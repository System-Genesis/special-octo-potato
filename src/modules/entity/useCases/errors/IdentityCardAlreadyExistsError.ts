import { BaseError } from "../../../../core/logic/BaseError";

export class IdentityCardAlreadyExistsError extends BaseError {
  private constructor(identityCard: string, title: string) {
    super(`identity card: ${identityCard} already belogns to another entity`, title);
  }

  static create(identityCard: string, title: string = 'IDCARD_ALREADY_EXISTS') {
    return new IdentityCardAlreadyExistsError(identityCard, title);
  }
}