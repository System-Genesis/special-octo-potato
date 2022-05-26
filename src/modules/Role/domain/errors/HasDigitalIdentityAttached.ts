import { BaseError } from "../../../../core/logic/BaseError";

export class HasDigitalIdentityAttached extends BaseError {
  private constructor(roleId: string) {
    super(`role: ${roleId} is connected to a digital Identity`)
  }

  static create(roleId: string) {
    return new HasDigitalIdentityAttached(roleId);
  }
}