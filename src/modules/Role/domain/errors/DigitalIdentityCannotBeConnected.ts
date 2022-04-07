import { BaseError } from '../../../../core/logic/BaseError';

export class DigitalIdentityCannotBeConnected extends BaseError {
    private constructor(diUniqueId: string) {
        super(`digitalIdentity: ${diUniqueId} can not be connected to a role`);
    }

    static create(diUniqueId: string) {
        return new DigitalIdentityCannotBeConnected(diUniqueId);
    }
}
