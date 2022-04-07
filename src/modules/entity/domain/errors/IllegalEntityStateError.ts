import { BaseError } from "../../../../core/logic/BaseError";

export class IllegalEntityStateError extends BaseError {
  private constructor(message: string, title: string) {
    super(message, title)
  }

  static create(message:string, title: string = 'ILLEGAL_ENTITY_STATE') {
    return new IllegalEntityStateError(message, title);
  }
}