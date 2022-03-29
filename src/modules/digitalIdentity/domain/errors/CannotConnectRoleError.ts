import { BaseError } from '../../../../core/logic/BaseError';

export class CannotConnectRoleError extends BaseError {
    private constructor(diUniqueId: string) {
        super(`virtualUser digital identity ${diUniqueId} is not able to be connected to Role`);
    }

    static create(diUniqueId: string) {
        return new CannotConnectRoleError(diUniqueId);
    }
}
