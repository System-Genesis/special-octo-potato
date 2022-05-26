import { Request, Response } from "express";
import { AppError } from "../../../../core/logic/AppError";
import { ErrorResponseHandler } from "../../../../shared/infra/http/helpers/ErrorResponseHandler";
import { ResponseHandler } from "../../../../shared/infra/http/helpers/ResponseHandler";
import { DigitalIdentityService } from "../../useCases/DigitalIdentityService";
import {
  CreateDigitalIdentityDTO,
  joiSchema as CreateDigitalIdentitySchema
} from "../../useCases/dtos/CreateDigitalIdentityDTO"
import {
  joiSchema as DeleteDigitalIdentitySchema
} from "../../useCases/dtos/DeleteDigitalIdentityDTO"
import {
  UpdateDigitalIdentityDTO,
  joiSchema as UpdateDigitalIdentitySchema
} from "../../useCases/dtos/UpdateDigitalIdentityDTO";

export class DigitalIdentityController {
  constructor(
    private _diService: DigitalIdentityService
  ){}

  /**
   * POST /digitalIdentities
   */
  createDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value: dto } = CreateDigitalIdentitySchema.validate(req.body);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._diService.createDigitalIdentity(dto as CreateDigitalIdentityDTO);
    if(result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error);
    }
    return ResponseHandler.ok(res, result.value);
  }

  /**
   * PATCH /digitalIdentities/:id
   */
  updateDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value: dto } = UpdateDigitalIdentitySchema.validate({
      ...req.body,
      uniqueId: req.params.id,
    });
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._diService.updateDigitalIdentity(dto as UpdateDigitalIdentityDTO);
    if(result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error);
    }
    return ResponseHandler.ok(res);
  }
  deleteDigitalIdentity = async (req: Request, res: Response)=>{
    const {error} = DeleteDigitalIdentitySchema.validate({uniqueId: req.params.uniqueId})
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._diService.deleteDigitalIdentity(req.params.uniqueId);
    if(result.isErr()) {
      return ErrorResponseHandler.defaultErrorHandler(res, result.error);
    }
    return ResponseHandler.ok(res);
  }
}