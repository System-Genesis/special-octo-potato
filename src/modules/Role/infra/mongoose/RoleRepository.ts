import { Connection, Model } from 'mongoose';
import { DigitalIdentityId } from '../../../digitalIdentity/domain/DigitalIdentityId';
import { Role } from '../../domain/Role';
import { RoleId } from '../../domain/RoleId';
import { RoleRepository as IRoleRepository } from '../../repository/RoleRepository';
import { RoleMapper as Mapper } from './RoleMapper';
import { default as RoleSchema, RoleDoc } from './RoleSchema';
import { EventOutbox } from '../../../../shared/infra/mongoose/eventOutbox/Outbox';
import { err, ok, Result } from 'neverthrow';
import { AggregateVersionError } from '../../../../core/infra/AggregateVersionError';
import { BaseError } from '../../../../core/logic/BaseError';
import { AppError } from '../../../../core/logic/AppError';
import { GroupId } from '../../../group/domain/GroupId';
import { MongooseError } from '../../../../shared/infra/mongoose/errors/MongooseError';
import { extractUndefinedKeys, sanitize } from '../../../../utils/ObjectUtils';

export class RoleRepository implements IRoleRepository {
    private _model: Model<RoleDoc>;

    constructor(db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
        const { modelName } = config;
        if (db.modelNames().includes(modelName)) {
            this._model = db.model(modelName);
        } else {
            this._model = db.model(modelName, RoleSchema);
        }
    }

    async exists(roleId: RoleId): Promise<boolean> {
        const res = await this._model.findOne({ roleId: roleId.toString() }).lean();
        return !!res;
    }

    async getByRoleId(roleId: RoleId): Promise<Role | null> {
        const raw = await this._model.findOne({ roleId: roleId.toString() }).lean();
        if (!raw) return null;
        return Mapper.toDomain(raw);
    }

    async getByDigitalIdentityId(digitalIdentityUniqueId: DigitalIdentityId): Promise<Role | null> {
        const raw = await this._model.findOne({ digitalIdentityUniqueId: digitalIdentityUniqueId.toString() }).lean();
        if (!raw) return null;
        return Mapper.toDomain(raw);
    }
    async delete(roleId: RoleId): Promise<Result<any, BaseError>> {
        const res = await this._model.deleteOne({ roleId: roleId.toValue() });
        if (!res) {
            return err(AppError.LogicError.create(`${res}`));
        }
        return ok(undefined);
    }
    async getByGroupId(groupId: GroupId): Promise<Role | null> {
        const raw = await this._model.findOne({ directGroup: groupId.toValue() }).lean();
        if (!raw) return null;
        return Mapper.toDomain(raw);
    }

    async create(role: Role): Promise<Result<void, AggregateVersionError>> {
        const persistanceState = sanitize(Mapper.toPersistance(role));

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

    async save(role: Role): Promise<Result<void, AggregateVersionError>> {
        const persistanceState = Mapper.toPersistance(role);
        const fieldsToDelete = extractUndefinedKeys(persistanceState);
        const persistanceStateSanitized = sanitize(persistanceState);

        let result: Result<void, AggregateVersionError> = ok(undefined);
        let session = await this._model.startSession();

        try {
            session.startTransaction();

            const updateOp = await this._model.updateOne(
                {
                    roleId: role.roleId.toString(),
                    version: role.fetchedVersion,
                },
                { $set: persistanceStateSanitized , $unset: fieldsToDelete },
                { session },
            );

            if (!updateOp) {
                result = err(AggregateVersionError.create(role.fetchedVersion));
            }

            await session.commitTransaction();
        } catch (error) {
            result = err(MongooseError.GenericError.create(error));

            await session.abortTransaction();
        } finally {
            session.endSession();
        }

        return result;
    }
}
