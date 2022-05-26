import { BaseError } from "../../../../core/logic/BaseError";

export class DigitalIdentityConnectedToRole extends BaseError {
  private constructor(diUniqueId: string) {
    super(`digital identity: ${diUniqueId} is connected to role`);
  }

  static create(diUniqueId: string) {
    return new DigitalIdentityConnectedToRole(diUniqueId);
  }
}