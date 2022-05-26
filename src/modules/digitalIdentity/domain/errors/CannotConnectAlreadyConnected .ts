import { BaseError } from "../../../../core/logic/BaseError";

export class CannotConnectAlreadyConnected  extends BaseError {
  private constructor(diUniqueId: string) {
    super(`digital identity ${diUniqueId} is already connected to entity`)
  }

  static create(diUniqueId: string) {
    return new CannotConnectAlreadyConnected (diUniqueId);
  }
}