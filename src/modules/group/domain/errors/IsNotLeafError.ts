import { BaseError } from "../../../../core/logic/BaseError";

export class IsNotLeafError extends BaseError {
  private constructor(id: string) {
    super(`group with id: ${id} is not a leaf` )
  }

  static create(id: string) {
    return new IsNotLeafError(id);
  }
}