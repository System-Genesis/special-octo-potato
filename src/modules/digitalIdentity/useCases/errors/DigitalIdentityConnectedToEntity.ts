import { BaseError } from '../../../../core/logic/BaseError';

export class DigitalIdentityConnectedToEntity extends BaseError {
    private constructor(diUniqueId: string) {
        super(`digital identity: ${diUniqueId} is connected to entity`);
    }

    static create(diUniqueId: string) {
        return new DigitalIdentityConnectedToEntity(diUniqueId);
    }
}
