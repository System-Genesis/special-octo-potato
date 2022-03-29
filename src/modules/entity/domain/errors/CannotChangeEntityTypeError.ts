import { BaseError } from '../../../../core/logic/BaseError';

export class CannotChangeEntityTypeError extends BaseError {
    private constructor(from: string, to: string) {
        super(`cannot transition from entityType: ${from} to type: ${to}`);
    }

    static create(from: string, to: string) {
        return new CannotChangeEntityTypeError(from, to);
    }
}
