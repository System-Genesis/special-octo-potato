import { BaseError } from '../../../../core/logic/BaseError';

export class IllegalEntityStateError extends BaseError {
    private constructor(message: string) {
        super(message);
    }

    static create(message: string) {
        return new IllegalEntityStateError(message);
    }
}
