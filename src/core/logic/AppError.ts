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
      super(`cannot update field: ${fieldName}`, 'CANNOT_UPDATE_FIELD');
    }

    static create(fieldName: string) {
      return new CannotUpdateFieldError(fieldName);
    }
  }

  export class ValueValidationError extends BaseError {
    private constructor(msg: string, title?: string) {
      super(msg, title);
    }
    static create(msg: string, title?: string, ) {
      return new ValueValidationError(msg, title);
    }
  }

  export class LogicError extends BaseError {
    private constructor(msg: string, title?: string) {
      super(msg, title);
    }
    static create(msg: string, title?: string) {
      return new LogicError(msg, title);
    }
  }

  export class ResourceNotFound extends BaseError {
    private _resource: string;
    private constructor(resource: string, resourceType: string, title: string) {
      super(`resource ${resourceType}: ${resource} does not exist`, title);
      this._resource = resource;
    }

    get resource() {
      return this._resource;
    }

    static create(resource: string, resourceType: string = '', title: string = 'RESOURCE_NOT_FOUND') {
      return new ResourceNotFound(resource, resourceType, title);
    }
  }

  export class AlreadyExistsError extends BaseError {
    private _idDetail: Object;

    private constructor(object: string, idDetail: Object, title: string) {
      super(`${object} already exists`, title);
      this._idDetail = idDetail;
    }

    get identifier() {
      return this._idDetail;
    }

    static create(object: string, idDetail: Object, title: string = 'ALREADY_EXISTS_ERR') {
      return new AlreadyExistsError(object, idDetail, title);
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