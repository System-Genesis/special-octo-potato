import { BaseError } from '../../../../core/logic/BaseError';

export class DigitalIdentityAlreadyExistsError extends BaseError {
    private constructor(diUniqueId: string) {
        super(`digital identity: ${diUniqueId} already exists`);
    }

    static create(diUniqueId: string) {
        return new DigitalIdentityAlreadyExistsError(diUniqueId);
    }
}
