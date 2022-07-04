import { BaseError } from '../../../../core/logic/BaseError';

export class GoalUserIdAlreadyExistsError extends BaseError {
    private constructor(goalUserId: string, title: string) {
        super(`GoalUser Id: ${goalUserId} already belogns to another entity`, title);
    }

    static create(goalUserId: string, title: string = 'GOALUSERID_ALREADY_EXISTS') {
        return new GoalUserIdAlreadyExistsError(goalUserId, title);
    }
}
