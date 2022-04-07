import { BaseError } from '../../../../core/logic/BaseError';

export class AlreadyConnectedToDigitalIdentity extends BaseError {
    private constructor(roleId: string, diUniqueId: string) {
        super(`role: ${roleId} already connected to a digital Identity: ${diUniqueId}`);
    }

    static create(roleId: string, diUniqueId: string) {
        return new AlreadyConnectedToDigitalIdentity(roleId, diUniqueId);
    }
}
