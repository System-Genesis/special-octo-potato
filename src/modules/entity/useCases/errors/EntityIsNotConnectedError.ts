import { BaseError } from '../../../../core/logic/BaseError';

export class EntityIsNotConnectedError extends BaseError {
    private constructor(entityId: string, digitalIdentityId: string) {
        super(`entity: ${entityId} is not connected to digital Identity: ${digitalIdentityId}`);
    }

    static create(entityId: string, digitalIdentityId: string) {
        return new EntityIsNotConnectedError(entityId, digitalIdentityId);
    }
}
