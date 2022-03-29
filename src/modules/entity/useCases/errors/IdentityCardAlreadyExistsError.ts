import { BaseError } from '../../../../core/logic/BaseError';

export class IdentityCardAlreadyExistsError extends BaseError {
    private constructor(identityCard: string) {
        super(`identity card: ${identityCard} already belogns to another entity`);
    }

    static create(identityCard: string) {
        return new IdentityCardAlreadyExistsError(identityCard);
    }
}
