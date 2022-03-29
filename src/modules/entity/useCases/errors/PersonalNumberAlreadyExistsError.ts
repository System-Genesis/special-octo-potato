import { BaseError } from '../../../../core/logic/BaseError';

export class PersonalNumberAlreadyExistsError extends BaseError {
    private constructor(personalNumber: string) {
        super(`personal number: ${personalNumber} already belogns to another entity`);
    }

    static create(identityCard: string) {
        return new PersonalNumberAlreadyExistsError(identityCard);
    }
}
