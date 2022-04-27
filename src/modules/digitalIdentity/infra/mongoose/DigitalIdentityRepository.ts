import { Source } from './../../domain/Source';
import { Connection, Model } from 'mongoose';
import { DigitalIdentityRepository as IdigitalIdentityRepo } from '../../repository/DigitalIdentityRepository';
import { default as DigitalIdentitySchema, DigitalIdentityDoc } from './DigitalIdentitySchema';
import { DigitalIdentity } from '../../domain/DigitalIdentity';
import { DigitalIdentityMapper as Mapper } from './DigitalIdentityMapper';
import { DigitalIdentityId } from '../../domain/DigitalIdentityId';
import { EntityId } from '../../../entity/domain/EntityId';
import { EventOutbox } from '../../../../shared/infra/mongoose/eventOutbox/Outbox';
import { Mail } from '../../domain/Mail';
import { err, ok, Result } from 'neverthrow';
import { AggregateVersionError } from '../../../../core/infra/AggregateVersionError';
import { AppError } from '../../../../core/logic/AppError';
import { BaseError } from '../../../../core/logic/BaseError';
import { MongooseError } from '../../../../shared/infra/mongoose/errors/MongooseError';
import { extractUndefinedKeys, sanitize } from '../../../../utils/ObjectUtils';

export class DigitalIdentityRepository implements IdigitalIdentityRepo {
    private _model: Model<DigitalIdentityDoc>;

    constructor(db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
        const { modelName } = config;
        if (db.modelNames().includes(modelName)) {
            this._model = db.model(modelName);
        } else {
            this._model = db.model(modelName, DigitalIdentitySchema);
        }
    }

    async existsInSource(identifier: Mail | DigitalIdentityId, source: Source) {
        // TODO: perhaps not needed?
        if (identifier instanceof Mail) {
            return !!(await this._model.findOne({ mail: identifier.value, source: source.value }).lean());
        } else {
            // is DigitalIdentityId
            return !!(await this._model.findOne({ uniqueId: identifier.toString(), source: source.value }).lean());
        }
    }

    async exists(identifier: Mail | DigitalIdentityId) {
        if (identifier instanceof Mail) {
            return !!(await this._model.findOne({ mail: identifier.value }).lean());
        } else {
            // is DigitalIdentityId
            return !!(await this._model.findOne({ uniqueId: identifier.toString() }).lean());
        }
    }

    async create(digitalIdentity: DigitalIdentity): Promise<Result<void, AggregateVersionError | MongooseError.GenericError>> {
        const persistanceState = sanitize(Mapper.toPersistance(digitalIdentity));
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

    async save(digitalIdentity: DigitalIdentity): Promise<Result<void, AggregateVersionError | MongooseError.GenericError>> {
        const persistanceState = Mapper.toPersistance(digitalIdentity);
        const fieldsToDelete = extractUndefinedKeys(persistanceState);
        const persistanceStateSanitized = sanitize(persistanceState);
        let result: Result<void, AggregateVersionError> = ok(undefined);
        let session = await this._model.startSession();

        try {
            session.startTransaction();

            const updateOp = await this._model
                .updateOne(
                    {
                        uniqueId: digitalIdentity.uniqueId.toString(),
                        version: digitalIdentity.fetchedVersion,
                    },
                    { $set: persistanceStateSanitized , $unset: fieldsToDelete }
                )
                .session(session);

            if (!updateOp) {
                result = err(AggregateVersionError.create(digitalIdentity.fetchedVersion));
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

    async getByUniqueId(uniqueId: DigitalIdentityId) {
        const raw = await this._model.findOne({ uniqueId: uniqueId.toString() }).lean();
        if (!raw) return null;
        return Mapper.toDomain(raw);
    }

    async getByEntityId(entityId: EntityId) {
        const raw = await this._model.find({ entityId: entityId.toString() }).lean();
        return raw.map(Mapper.toDomain);
    }
    async delete(uniqueId: DigitalIdentityId): Promise<Result<any, BaseError>> {
        const res = await this._model.deleteOne({ uniqueId: uniqueId.toValue() });
        if (!res) {
            return err(AppError.LogicError.create(`${res}`));
        }
        return ok(undefined);
    }
}
