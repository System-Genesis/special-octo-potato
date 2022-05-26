import { BaseError } from "./BaseError";

export namespace AppError {
  export class UnexpectedError extends BaseError {
    private err?: any

    private constructor (err?: any) {
      super('unexpected error occured');
      this.err = err
    }

    get error() {
      return this.err;
    }

    static create(err?: any) {
      return new UnexpectedError(err);
    }
  }

  export class CannotUpdateFieldError extends BaseError {
    private constructor(fieldName: string) {
      super(`cannot update field: ${fieldName}`);
    }

    static create(fieldName: string) {
      return new CannotUpdateFieldError(fieldName);
    }
  }

  export class ValueValidationError extends BaseError {
    private constructor(msg: string) {
      super(msg);
    }
    static create(msg: string) {
      return new ValueValidationError(msg);
    }
  }

  export class LogicError extends BaseError {
    private constructor(msg: string) {
      super(msg);
    }
    static create(msg: string) {
      return new LogicError(msg);
    }
  }

  export class ResourceNotFound extends BaseError {
    private _resource: string;

    private constructor(resource: string, resourceType: string) {
      super(`resource ${resourceType}: ${resource} does not exist`);
      this._resource = resource;
    }

    get resource() {
      return this._resource;
    }

    static create(resource: string, resourceType: string = '') {
      return new ResourceNotFound(resource, resourceType);
    }
  }

  export class AlreadyExistsError extends BaseError {
    private _idDetail: Object;

    private constructor(object: string, idDetail: Object) {
      super(`${object} already exists`);
      this._idDetail = idDetail;
    }

    get identifier() {
      return this._idDetail;
    }

    static create(object: string, idDetail: Object) {
      return new AlreadyExistsError(object, idDetail);
    }
  }

  export class RetryableConflictError extends BaseError {
    private constructor(message: string) {
      super(message);
    }

    static create(message: string) {
      return new RetryableConflictError(message);
    }
  }
}