import { BaseError } from '../../../../core/logic/BaseError';

export class HasRolesAttachedError extends BaseError {
    private constructor(id: string) {
        super(`group with id: ${id} has roles attached`);
    }

    static create(id: string) {
        return new HasRolesAttachedError(id);
    }
}
