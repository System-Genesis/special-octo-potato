import { BaseError } from "../../../../core/logic/BaseError";

export class CannotChangeEntityTypeError extends BaseError {
  private constructor(from: string, to: string, title: string) {
    super(`cannot transition from entityType: ${from} to type: ${to}`, title)
  }

  static create(from: string, to: string, title: string = 'CANNOT_CHANGE_ENTITY_TYPE') {
    return new CannotChangeEntityTypeError(from, to, title);
  }
}