import { BaseError } from '../../../../core/logic/BaseError';

export class DuplicateChildrenError extends BaseError {
    private constructor(duplicateName: string, parentName: string) {
        super(`cannot have two groups with the name: ${duplicateName} under group: ${parentName}`);
    }

    static create(duplicateName: string, parentName: string) {
        return new DuplicateChildrenError(duplicateName, parentName);
    }
}
