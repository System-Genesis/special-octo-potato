import { BaseError } from '../../../../core/logic/BaseError';

export class DigitalIdentityFormatError extends BaseError {
    private constructor(diUniqueId: string) {
        super(`digital identity: ${diUniqueId} wrong format`);
    }

    static create(diUniqueId: string) {
        return new DigitalIdentityFormatError(diUniqueId);
    }
}
