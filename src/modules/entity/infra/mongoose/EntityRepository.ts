import { EventOutbox } from './../../../../shared/infra/mongoose/eventOutbox/Outbox';
import { Model, Types, FilterQuery, Connection } from "mongoose";
import { EntityRepository as IEntityRepository, IhaveEntityIdentifiers, EntityIdentifier } from "../../repository/EntityRepository"
import { EntityMapper as Mapper} from "./EntityMapper";
import { default as EntitySchema, EntityDoc } from "./EntitySchema";
import { EntityId } from "../../domain/EntityId";
import { Entity } from "../../domain/Entity";
import { PersonalNumber } from "../../domain/PersonalNumber";
import { IdentityCard } from "../../domain/IdentityCard";
import { err, ok, Result } from "neverthrow";
import { AggregateVersionError } from "../../../../core/infra/AggregateVersionError";
import { AppError } from "../../../../core/logic/AppError";
import { BaseError } from "../../../../core/logic/BaseError";
import { MongooseError } from "../../../../shared/infra/mongoose/errors/MongooseError";
import { sanitize } from '../../../../utils/ObjectUtils';

export class EntityRepository implements IEntityRepository {
  private _model: Model<EntityDoc>;

  constructor(db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
    const { modelName } = config;
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName);
    } else {
      this._model = db.model(modelName, EntitySchema);
    }
  }

  async exists(identifier: EntityIdentifier): Promise<boolean> {
    let identifierName: 'personalNumber' | 'identityCard' | 'goalUserId';
    if(identifier instanceof PersonalNumber) { identifierName = 'personalNumber'; }
    else if(identifier instanceof IdentityCard) { identifierName = 'identityCard'; }
    else { identifierName = 'goalUserId'; }
    const res = await this._model.findOne({ [identifierName]: identifier.toString() }).lean().select('_id');
    return !!res;
  }

  generateEntityId(): EntityId {
    return EntityId.create(new Types.ObjectId().toHexString());
  }
  
  async getByEntityId(entityId: EntityId): Promise<Entity | null> {
    let raw;
    raw = await this._model.findOne({ _id: entityId.toString() }).lean();
    if (!raw) return null;
    return Mapper.toDomain(raw);
  }

  async save(entity: Entity): Promise<Result<void, AggregateVersionError | MongooseError.GenericError>> {
    const persistanceState = sanitize(Mapper.toPersistance(entity));
    let result: Result<void, AggregateVersionError> = ok(undefined);
    let session = await this._model.startSession();

    try {
      const existingEntity = await this._model
        .findOne({
          _id: entity.entityId.toString(),
        })
      if (existingEntity) {
        const updateOp = await this._model.updateOne(
          { 
            _id: entity.entityId.toString(), 
            version: entity.fetchedVersion,
          },
            persistanceState
          )
          .session(session);

        if (updateOp.n === 0) {
          result = err(AggregateVersionError.create(entity.fetchedVersion));
        }
      } else {
        await this._model.create([persistanceState], { session });
        result = ok(undefined);
      }
    } catch (error) {
      result = err(MongooseError.GenericError.create(error));
    } finally {
      session.endSession();
    }
    return result;
  }

  
  async delete(id: EntityId): Promise<Result<any,BaseError>>{
    const res = await this._model.deleteOne({_id: id.toValue()});
    if(!res) {
      return err(AppError.LogicError.create(`${res}`));
    }
    return ok(undefined)
  }
}
