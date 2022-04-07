import { Request, Response } from 'express';
import { RoleService } from '../../useCases/RoleService';
import { ConnectDigitalIdentityDTO, joiSchema as ConnectDigitalIdentitySchema } from '../../useCases/dtos/ConnectDigitalIdentityDTO';
import { CreateRoleDTO, joiSchema as CreateRoleSchema } from '../../useCases/dtos/CreateRoleDTO';
import { MoveGroupDTO, joiSchema as MoveGroupSchema } from '../../useCases/dtos/MoveGroupDTO';
import { UpdateRoleDTO, joiSchema as UpdateRoleSchema } from '../../useCases/dtos/UpdateRoleDTO';
import { joiSchema as DeleteRoleSchema } from '../../useCases/dtos/DeleteRoleDTO';
import { ResponseHandler } from '../../../../shared/infra/http/helpers/ResponseHandler';
import { AppError } from '../../../../core/logic/AppError';
import { ErrorResponseHandler } from '../../../../shared/infra/http/helpers/ErrorResponseHandler';

export class RoleController {
    constructor(private _roleService: RoleService) {}

    /**
     * POST /roles
     * @param req
     * @param res
     * @returns
     */
    createRole = async (req: Request, res: Response) => {
        const { error, value: dto } = CreateRoleSchema.validate(req.body);
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._roleService.createRole(dto as CreateRoleDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res, result.value);
    };

    /**
     * PUT /roles/:roleId/group/:groupId
     * @param req
     * @param res
     * @returns
     */
    moveGroup = async (req: Request, res: Response) => {
        const { error, value: dto } = MoveGroupSchema.validate(req.params);
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._roleService.moveToGroup(dto as MoveGroupDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error, {
                notFoundOnlyWhenResourceMatch: (dto as MoveGroupDTO).roleId,
            });
        }
        return ResponseHandler.ok(res);
    };

    /**
     * PUT /roles/:roleId/digitalIdentity/:digitalIdentityUniqueId
     * @param req
     * @param res
     * @returns
     */
    connectDigitalIdentity = async (req: Request, res: Response) => {
        const { error, value: dto } = ConnectDigitalIdentitySchema.validate(req.params);
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._roleService.connectDigitalIdentity(dto as ConnectDigitalIdentityDTO);
        if (result.isErr()) {
            const err = result.error;
            return ErrorResponseHandler.defaultErrorHandler(res, result.error, {
                notFoundOnlyWhenResourceMatch: (dto as ConnectDigitalIdentityDTO).roleId,
            });
        }
        return ResponseHandler.ok(res);
    };

    /**
     * delete /roles/:roleId/digitalIdentity/:digitalIdentityUniqueId
     * @param req
     * @param res
     * @returns
     */
    disconnectDigitalIdentity = async (req: Request, res: Response) => {
        const { error, value: dto } = ConnectDigitalIdentitySchema.validate(req.params);
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._roleService.disconnectDigitalIdentity(dto as ConnectDigitalIdentityDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error, {
                notFoundOnlyWhenResourceMatch: (dto as ConnectDigitalIdentityDTO).roleId,
            });
        }
        return ResponseHandler.ok(res);
    };

    /**
     * PATCH /roles/:roleId
     * @param req
     * @param res
     * @returns
     */
    updateRole = async (req: Request, res: Response) => {
        const { error, value: dto } = UpdateRoleSchema.validate({
            roleId: req.params.roleId,
            ...req.body,
        });
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._roleService.updateRole(dto as UpdateRoleDTO);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res);
    };

    deleteRole = async (req: Request, res: Response) => {
        const { error } = DeleteRoleSchema.validate({ roleId: req.params.roleId });
        if (!!error) {
            return ResponseHandler.clientError(res, error.message);
        }
        const result = await this._roleService.deleteRole(req.params.roleId);
        if (result.isErr()) {
            return ErrorResponseHandler.defaultErrorHandler(res, result.error);
        }
        return ResponseHandler.ok(res);
    };
}
