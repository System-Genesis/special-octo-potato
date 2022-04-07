import { BaseError } from '../../../../core/logic/BaseError';

export class MailAlreadyExistsError extends BaseError {
    private constructor(mail: string) {
        super(`mail: ${mail} already exists`);
    }

    static create(mail: string) {
        return new MailAlreadyExistsError(mail);
    }
}
