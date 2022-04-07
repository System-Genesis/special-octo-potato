import { BaseError } from '../../../../core/logic/BaseError';

export class SourceMisMatchError extends BaseError {
    private constructor(source1: string, source2: string) {
        super(`source: ${source1} doesn't match to source ${source2}`);
    }

    static create(source1: string, source2: string) {
        return new SourceMisMatchError(source1, source2);
    }
}
