import { EventOutbox } from './../../../../shared/infra/mongoose/eventOutbox/Outbox';
import { ClientSession, Collection, Connection, default as mongoose, Model, Types } from 'mongoose';
import { GroupRepository as IGroupRepository } from '../../repository/GroupRepository';
import { GroupMapper as Mapper } from './GroupMapper';
import { default as GroupSchema, GroupDoc } from './GroupSchema';
import { GroupId } from '../../domain/GroupId';
import { Group } from '../../domain/Group';
import { err, ok, Result } from 'neverthrow';
import { AggregateVersionError } from '../../../../core/infra/AggregateVersionError';
import { AppError } from '../../../../core/logic/AppError';
import { BaseError } from '../../../../core/logic/BaseError';
import { MongooseError } from '../../../../shared/infra/mongoose/errors/MongooseError';
import { Error as mongooseError } from 'mongoose';
import { extractUndefinedKeys, sanitize } from '../../../../utils/ObjectUtils';

export class GroupRepository implements IGroupRepository {
    private _model: Model<GroupDoc>;

    constructor(db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
        const { modelName } = config;
        if (db.modelNames().includes(modelName)) {
            this._model = db.model(modelName);
        } else {
            this._model = db.model(modelName, GroupSchema);
        }
    }

    generateGroupId(): GroupId {
        return GroupId.create(new Types.ObjectId().toHexString());
    }

    async exists(id: GroupId): Promise<boolean> {
        const res = await this._model.findById(id.toString()).lean();
        return !!res;
    }

    async getByGroupId(groupId: GroupId): Promise<Group | null> {
        let groupOrNull: Group | null = null;
        // calculate all group's fields in one transaction to preserve consistency
        /*
     // TODO: maybe can be done in one aggregate query 
      (maybe with virtual populate in addition) without transaction!
    */
        const session = await this._model.startSession();
        try {
            session.startTransaction();
            const [raw, ancestors, childrenNames] = await Promise.all([
                this._model.findById(groupId.toString()).lean(),
                this.calculateAncestors(groupId),
                this.calculateChildrenNames(groupId),
            ]);
            if (!!raw) {
                groupOrNull = Mapper.toDomain({
                    ...raw,
                    ancestors: ancestors || [],
                    childrenNames: childrenNames || [],
                });
            }
            await session.commitTransaction();
        } catch (error) {
            console.log(error);
            // groupOrNull = null;
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
        return groupOrNull;
    }

    async getByNameAndParentId(name: string, parentId: GroupId): Promise<GroupId | null> {
        let groupIdOrNull: GroupId | null = null;
        // calculate all group's fields in one transaction to preserve consistency
        /*
     // TODO: maybe can be done in one aggregate query 
      (maybe with virtual populate in addition) without transaction!
    */
        const session = await this._model.startSession();
        try {
            session.startTransaction();
            const raw = await this._model.findOne({ directGroup: parentId.toString(), name: name }).lean();
            if (!!raw) {
                groupIdOrNull = GroupId.create(raw._id.toHexString());
            }
            await session.commitTransaction();
        } catch (error) {
            groupIdOrNull = null;
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
        return groupIdOrNull;
    }

    async getRootByName(name: string): Promise<GroupId | null> {
        let groupIdOrNull: GroupId | null = null;
        const session = await this._model.startSession();
        try {
            session.startTransaction();
            const raw = await this._model.findOne({ directGroup: null, name: name }).lean();
            if (!!raw) {
                groupIdOrNull = GroupId.create(raw._id.toHexString());
            }
            await session.commitTransaction();
        } catch (error) {
            groupIdOrNull = null;
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
        return groupIdOrNull;
    }

    private async calculateAncestors(groupId: GroupId, session?: ClientSession) {
        const res = await this._model
            .aggregate([
                { $match: { _id: Types.ObjectId(groupId.toString()) } },
                {
                    $graphLookup: {
                        from: 'groups',
                        startWith: '$directGroup',
                        connectFromField: 'directGroup',
                        connectToField: '_id',
                        as: 'ancestors',
                        depthField: 'searchDepth',
                    },
                },
                { $unwind: '$ancestors' },
                { $sort: { 'ancestors.searchDepth': 1 } },
                { $project: { _id: 0, ancestors: 1 } }, // TODO: does it work?
            ])
            .session(session || null);
        //TODO: instead of getting ancestors directly somehow via lookup?

        //TODO: better way to map
        return res.map((doc: any) => doc.ancestors._id) as Types.ObjectId[];
    }

    private async calculateChildrenNames(groupId: GroupId, session?: ClientSession) {
        const children = await this._model
            .find({ directGroup: groupId.toString() })
            .lean()
            .select({ name: 1 })
            .session(session || null);
        return children.map((g) => g.name);
    }

    async create(group: Group): Promise<Result<void, AggregateVersionError | MongooseError.GenericError>> {
        const persistanceState = sanitize(Mapper.toPersistance(group));
        let result: Result<void, AggregateVersionError> = ok(undefined);
        let session = await this._model.startSession();

        try {
            session.startTransaction();
            await this._model.create([persistanceState], { session });

            await session.commitTransaction();
        } catch (error) {
            result = err(MongooseError.GenericError.create(error));
            await session.abortTransaction();
        } finally {
            session.endSession();
        }

        return result;
    }
    async update(group: Group): Promise<Result<void, AggregateVersionError | MongooseError.GenericError>> {
        const persistanceState = Mapper.toPersistance(group);
        const fieldsToDelete = extractUndefinedKeys(persistanceState);
        const persistanceStateSanitized = sanitize(persistanceState);
        let result: Result<void, AggregateVersionError> = ok(undefined);
        let session = await this._model.startSession();

        try {
            session.startTransaction();
            const updateOp = await this._model
                .updateOne(
                    {
                        _id: group.groupId.toString(),
                        version: group.fetchedVersion,
                    },
                    { $set: persistanceStateSanitized , $unset: fieldsToDelete }
                )
                .session(session);

            if (!updateOp) {
                result = err(AggregateVersionError.create(group.fetchedVersion));
            }
            result = ok(undefined);
            await session.commitTransaction();
        } catch (error) {
            result = err(MongooseError.GenericError.create(error));
            await session.abortTransaction();
        } finally {
            session.endSession();
        }

        return result;
    }

    async delete(id: GroupId): Promise<Result<any, BaseError>> {
        let res;
        try {
            res = await this._model.deleteOne({ _id: id.toValue() });
        } catch (error) {
            return err(MongooseError.GenericError.create(error));
        }
        if (!res) {
            return err(AppError.LogicError.create(`${res}`));
        }
        return ok(undefined);
    }
}
