import { BaseError } from "../../../../core/logic/BaseError";

export class CannotDeleteRoot extends BaseError {
  private constructor(id: string) {
    super(`Cannot delete root group ${id}` )
  }

  static create(id: string) {
    return new CannotDeleteRoot(id);
  }
}