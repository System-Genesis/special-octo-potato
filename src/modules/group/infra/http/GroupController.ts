import { GroupService } from '../../useCases/GroupService';
import { Request, Response } from 'express';
import { CreateGroupDTO, joiSchema as CreateGroupSchema } from '../../useCases/dto/CreateGroupDTO';
import { joiSchema as DeleteGroupSchema } from '../../useCases/dto/DeleteGroupDTO';
import { joiSchema as UpdateGroupSchema, UpdateGroupDTO } from '../../useCases/dto/UpdateGroupDTO';
import { joiSchema as RenameGroupSchema, RenameGroupDTO } from '../../useCases/dto/RenameGroupDTO';
import { MoveGroupDTO, joiSchema as MoveGroupSchema } from '../../useCases/dto/MoveGroupDTO';
import { ResponseHandler } from '../../../../shared/infra/http/helpers/ResponseHandler';
import { AppError } from '../../../../core/logic/AppError';
import { ErrorResponseHandler } from '../../../../shared/infra/http/helpers/ErrorResponseHandler';

export class GroupController {
    constructor(private _groupService: GroupService) {}

    /**
     * POST /groups
     */
    createGroup = async (req: Request, res: Response) => {
        const { error, value: dto } = CreateGroupSchema.validate(req.body);
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._groupService.createGroup(dto as CreateGroupDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res, result.value);
    };

    /**
     * PATCH
     * @param req
     * @param res
     * @returns
     */
    updateGroup = async (req: Request, res: Response) => {
        const { error, value: dto } = UpdateGroupSchema.validate({
            ...req.body,
            id: req.params.id,
        });
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._groupService.updateGroup(dto as UpdateGroupDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res, result.value);
    };

    /**
     * PATCH
     * @param req
     * @param res
     * @returns
     */
    renameGroup = async (req: Request, res: Response) => {
        const { error, value: dto } = RenameGroupSchema.validate({
            ...req.body,
            id: req.params.id,
        });
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._groupService.renameGroup(dto as RenameGroupDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res, result.value);
    };

    /**
     * PUT /groups/:id/parent/:parentId
     * @param req
     * @param res
     * @returns
     */
    moveGroup = async (req: Request, res: Response) => {
        const { error, value: dto } = MoveGroupSchema.validate({
            groupId: req.params.id,
            parentId: req.params.parentId,
        });
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._groupService.moveGroup(dto as MoveGroupDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error, {
                notFoundOnlyWhenResourceMatch: (dto as MoveGroupDTO).groupId,
            });
        }
        return ResponseHandler.ok(res);
    };
    deleteGroup = async (req: Request, res: Response) => {
        const { error } = DeleteGroupSchema.validate({ id: req.params.id });
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._groupService.deleteGroup(req.params.id);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res);
    };
}

// TODO: update route
