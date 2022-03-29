import { BaseError } from '../../../../core/logic/BaseError';

export class GoalUserIdAlreadyExistsError extends BaseError {
    private constructor(goalUserId: string) {
        super(`GoalUser Id: ${goalUserId} already belogns to another entity`);
    }

    static create(identityCard: string) {
        return new GoalUserIdAlreadyExistsError(identityCard);
    }
}
