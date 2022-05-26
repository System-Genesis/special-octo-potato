import { BaseError } from "../../../../core/logic/BaseError";

export class RoleAlreadyExists extends BaseError {
  private constructor(roleId: string) {
    super(`role: ${roleId} already exists`)
  }

  static create(roleId: string) {
    return new RoleAlreadyExists(roleId);
  }
}