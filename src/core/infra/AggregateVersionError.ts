import { BaseError } from '../logic/BaseError';

export class AggregateVersionError extends BaseError {
    private constructor(expectedVersion: number) {
        super(`aggregate version error: expected version ${expectedVersion}`);
    }

    static create(expectedVersion: number) {
        return new AggregateVersionError(expectedVersion);
    }
}
