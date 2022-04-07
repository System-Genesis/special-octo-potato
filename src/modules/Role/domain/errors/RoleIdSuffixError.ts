import { BaseError } from '../../../../core/logic/BaseError';

export class RoleIdSuffixError extends BaseError {
    private constructor(roleId: string) {
        super(`roleId: ${roleId} wrong suffix`);
    }

    static create(roleId: string) {
        return new RoleIdSuffixError(roleId);
    }
}
