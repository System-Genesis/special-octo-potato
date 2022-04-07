import { Response } from 'express';

export abstract class ResponseHandler {
    static ok<T>(res: Response, dto?: T) {
        if (!!dto) {
            return res.status(200).json(dto);
        } else {
            return res.sendStatus(200);
        }
    }

    static jsonResponse(res: Response, code: number, message: string, detail?: any) {
        // console.log(message)
        return res.status(code).json({ message, ...detail });
    }

    static clientError(res: Response, message?: string, detail?: any) {
        return this.jsonResponse(res, 400, message || 'Bad Request', detail || {});
    }

    static notFound(res: Response, message?: string) {
        return this.jsonResponse(res, 404, message || 'Not found');
    }

    static conflict(res: Response, message?: string) {
        return this.jsonResponse(res, 409, message || 'Conflict');
    }

    static forbidden(res: Response, message?: string) {
        return this.jsonResponse(res, 403, message || 'Forbidden');
    }

    static fail(res: Response, message?: string) {
        return this.jsonResponse(res, 500, message || 'Unexpected Error');
    }
}
