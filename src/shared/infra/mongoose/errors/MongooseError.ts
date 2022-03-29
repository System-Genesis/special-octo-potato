import { BaseError } from '../../../../core/logic/BaseError';
import { Error as mongooseError } from 'mongoose';

export namespace MongooseError {
    export class GenericError extends BaseError {
        private err?: any;

        private constructor(message: string) {
            super(message);
        }

        get error() {
            return this.err;
        }

        static create(err: any) {
            if (err instanceof mongooseError) {
                return new GenericError(err.message);
            } else {
                return new GenericError(err.message);
            }
        }
    }
}
