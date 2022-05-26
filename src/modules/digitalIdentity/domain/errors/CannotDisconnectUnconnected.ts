import { BaseError } from "../../../../core/logic/BaseError";

export class CannotDisconnectUnconnected extends BaseError {
  private constructor(diUniqueId: string) {
    super(`digital identity ${diUniqueId} is not connected to entity`)
  }

  static create(diUniqueId: string) {
    return new CannotDisconnectUnconnected(diUniqueId);
  }
}