import { BaseError } from '../../../../core/logic/BaseError';

export class TreeCycleError extends BaseError {
    private constructor(parent: string, decendant: string) {
        super(`cannot move group ${parent} under its decentant: ${decendant}`);
    }

    static create(parent: string, decendant: string) {
        return new TreeCycleError(parent, decendant);
    }
}
