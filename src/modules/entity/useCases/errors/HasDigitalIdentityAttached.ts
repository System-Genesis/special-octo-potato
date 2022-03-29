import { BaseError } from '../../../../core/logic/BaseError';

export class HasDigitalIdentityAttached extends BaseError {
    private constructor(entityId: string) {
        super(`Entity: ${entityId} is connected to a digital Identity`);
    }

    static create(entityId: string) {
        return new HasDigitalIdentityAttached(entityId);
    }
}
