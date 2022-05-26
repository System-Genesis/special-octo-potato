import { ResponseHandler } from "../../../../shared/infra/http/helpers/ResponseHandler";
import { EntityService } from "../../useCases/EntityService";
import { Response, Request } from "express";
import { AppError } from "../../../../core/logic/AppError";
import {
  ConnectDigitalIdentityDTO,
  joiSchema as ConnectDigitalIdentitySchema
} from '../../useCases/dtos/ConnectDigitalIdentityDTO';
import {
  CreateEntityDTO,
  joiSchema as CreateEntitySchema
} from '../../useCases/dtos/CreateEntityDTO';
import {
  joiSchema as DeleteEntitySchema
} from '../../useCases/dtos/DeleteEntityDTO';
import {
  UpdateEntityDTO,
  joiSchema as UpdateEntitySchema
} from '../../useCases/dtos/UpdateEntityDTO';
import { ErrorResponseHandler } from "../../../../shared/infra/http/helpers/ErrorResponseHandler";

export class EntityController {
  private _entityService: EntityService;

  constructor(entityService: EntityService) {
    this._entityService = entityService;
  }

  /**
   * POST /entities
   */
  createEntity = async (req: Request, res: Response) => {
    const { error, value } = CreateEntitySchema.validate(req.body);
    if (!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.createEntity(value as CreateEntityDTO);
    if (result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error);
    }
    return ResponseHandler.ok(res, result.value);
  }

  /**
   * PUT /entities/:id/digitalIdentity/:uniqueId
   */
  connectDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value: dto } = ConnectDigitalIdentitySchema.validate({
      ...req.body,
      ...req.params
    });
    if (!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.connectDigitalIdentity(dto as ConnectDigitalIdentityDTO);
    if (result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error, {
        notFoundOnlyWhenResourceMatch: (dto as ConnectDigitalIdentityDTO).id,
      });
    }
    return ResponseHandler.ok(res);
  }

  /**
   * DELETE /entities/:id/digitalIdentity/:uniqueId
   */
  disconnectDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value: dto } = ConnectDigitalIdentitySchema.validate(req.params);
    if (!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.disconnectDigitalIdentity(dto as ConnectDigitalIdentityDTO);
    if (result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error, {
        notFoundOnlyWhenResourceMatch: (dto as ConnectDigitalIdentityDTO).id,
      });
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PATCH /entities/:id
   */
  updateEntity = async (req: Request, res: Response) => {
    const { error, value: dto } = UpdateEntitySchema.validate({
      ...req.body,
      entityId: req.params.id
    });
    if (!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.updateEntity(dto as UpdateEntityDTO);
    if (result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error);
    }
    return ResponseHandler.ok(res);
  }
  deleteEntity = async (req: Request, res: Response) => {
    const { error } = DeleteEntitySchema.validate({ id: req.params.id })
    if (!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.deleteEntity(req.params.id);
    if (result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error);
    }
    return ResponseHandler.ok(res);

  }

}