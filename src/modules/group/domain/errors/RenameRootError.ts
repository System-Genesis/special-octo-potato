import { BaseError } from '../../../../core/logic/BaseError';

export class RenameRootError extends BaseError {
    private constructor(rootName: string) {
        super(`cannot change root name of: ${rootName}`);
    }

    static create(rootName: string) {
        return new RenameRootError(rootName);
    }
}
