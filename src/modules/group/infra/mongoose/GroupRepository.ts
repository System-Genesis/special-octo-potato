import { ClientSession, Collection, Connection, default as mongoose ,Model, Types } from "mongoose";
import { GroupRepository as IGroupRepository } from "../../repository/GroupRepository"
import { GroupMapper as Mapper} from "./GroupMapper";
import { default as GroupSchema, GroupDoc } from "./GroupSchema";
import { GroupId } from "../../domain/GroupId";
import { Group } from "../../domain/Group";
import { EventOutbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";
import { err, ok, Result } from "neverthrow";
import { AggregateVersionError } from "../../../../core/infra/AggregateVersionError";
import { AppError } from "../../../../core/logic/AppError";
import { BaseError } from "../../../../core/logic/BaseError";
import { MongooseError } from "../../../../shared/infra/mongoose/errors/MongooseError";
import { Error as mongooseError} from "mongoose";

export class GroupRepository implements IGroupRepository {

  private _model: Model<GroupDoc>;
  private _eventOutbox: EventOutbox;

  constructor(db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
    const { modelName } = config;
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName);
    } else {
      this._model = db.model(modelName, GroupSchema);
    }
    this._eventOutbox = eventOutbox;
  }

  generateGroupId(): GroupId {
    return GroupId.create(new Types.ObjectId().toHexString());
  }
  
  async getByGroupId(groupId: GroupId): Promise<Group | null> {
    let groupOrNull: Group | null = null;
    // calculate all group's fields in one transaction to preserve consistency
    /*
     // TODO: maybe can be done in one aggregate query 
      (maybe with virtual populate in addition) without transaction!
    */ 
    const session = await this._model.startSession();
    await session.withTransaction(async () => {
      const [raw, ancestors, childrenNames] = await Promise.all([
        this._model.findOne({ _id: groupId.toString() }).lean().session(session),
        this.calculateAncestors(groupId, session),
        this.calculateChildrenNames(groupId, session) 
      ]);
      if(!!raw) {
        groupOrNull = Mapper.toDomain({ ...raw, ancestors: ancestors || [], childrenNames: childrenNames || [] });
      }
    });
    session.endSession();
    return groupOrNull;
  }

  private async calculateAncestors(groupId: GroupId, session?: ClientSession) {
    const res = await this._model.aggregate([
      { $match: { _id: groupId.toString() } },
      {
        $graphLookup: {
          from: 'groups',
          startWith: '$directGroup',
          connectFromField: 'directGroup',
          connectToField: '_id',
          as: 'ancestors',
          depthField: 'searchDepth',
        }
      },
      { $unwind: '$ancestors' },
      { $sort: { searchDepth: 1 } },
      { $project: { _id: 1 } } // TODO: does it work?
    ]).session(session || null);
    return res.map(doc => doc._id) as Types.ObjectId[];
  }

  private async calculateChildrenNames(groupId: GroupId, session?: ClientSession) {
    const children = await this._model.find({ directGroup: groupId.toString() })
      .lean().select({ name: 1 }).session(session || null);
    return children.map(g => g.name);
  }

  async save(group: Group): Promise<Result<void, AggregateVersionError | MongooseError.GenericError>> {
    const persistanceState = Mapper.toPersistance(group);
    try { 
     let session = await this._model.startSession();
     let result: Result<void, AggregateVersionError | MongooseError.GenericError> = ok(undefined);
     await session.withTransaction(async () => {
       if(!!await this._model.findOne({ _id: group.groupId.toString()}).session(session)) {
         const updateOp = await this._model.updateOne({ 
             uniqueId: group.groupId.toString(), 
             version: group.fetchedVersion,
           },
           persistanceState
         ).session(session);
         if(updateOp.n === 0) {
           result = err(AggregateVersionError.create(group.fetchedVersion))
         }
       } else {
         try {
           await this._model.create([persistanceState], { session: session });
         } catch(error) {
          result = err(MongooseError.GenericError.create(error));
         }
         result = ok(undefined);
       }
       await this._eventOutbox.put(group.domainEvents, session); // TODO: remove every outbox
     });
     session.endSession();
     return result;
    }catch(error){
      
      throw error
    }
  }
  async delete(id: GroupId): Promise<Result<any,BaseError>>{
    let res;
    try {
      res = await this._model.deleteOne({_id: id.toValue()});
    } catch(error) {
      return err(MongooseError.GenericError.create(error));
    }
    if(!res) {
      return err(AppError.LogicError.create(`${res}`));
    }
    return ok(undefined)
  }
}
