import { Response } from 'express';
import { AppError } from '../../../../core/logic/AppError';
import { BaseError } from '../../../../core/logic/BaseError';
import { ResponseHandler } from './ResponseHandler';

type DefaultHandlerOpts = {
    notFoundOnlyWhenResourceMatch?: string;
};

export abstract class ErrorResponseHandler {
    /**
     * Handle common error results:
     *
     * RetryableConflictError -> 409 conflict
     *
     * ResourceNotFound Error -> 404 Not Found
     *
     * UnexpectedError -> 500 Unexpected
     *
     * all other errors -> 400 Bad Request
     *
     * options:
     *
     *- `notFoundOnlyWhenResourceMatch: string`- treat the error as 'Not Found' only when
     * the `err.resource` equal to the provided value. Takes effect only when `err` is
     * instance of `AppError.ResourceNotFound`
     * @param res
     * @param err
     * @returns
     */
    static defaultErrorHandler(res: Response, err: BaseError, opts: DefaultHandlerOpts = {}) {
        console.log(err);
        if (err instanceof AppError.RetryableConflictError) {
            return ResponseHandler.conflict(res);
        } else if (err instanceof AppError.ResourceNotFound) {
            if (
                !opts.notFoundOnlyWhenResourceMatch ||
                (!!opts.notFoundOnlyWhenResourceMatch && err.resource === opts.notFoundOnlyWhenResourceMatch)
            ) {
                return ResponseHandler.notFound(res, err.message);
            }
        } else if (err instanceof AppError.UnexpectedError) {
            return ResponseHandler.fail(res, err.message);
        } else if (err instanceof AppError.AlreadyExistsError) {
            return ResponseHandler.clientError(res, err.message, err.identifier);
        }
        // the default is client error
        return ResponseHandler.clientError(res, err.message);
    }
}
