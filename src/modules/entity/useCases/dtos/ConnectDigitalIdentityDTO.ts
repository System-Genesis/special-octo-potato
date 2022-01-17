import Joi from 'joi';

export type ConnectDigitalIdentityDTO = {
  id: string; // TODO: change to entityId and digitalIdentityUniqueId respectively?
  uniqueId: string;
  upn? : string;
}

export const joiSchema = Joi.object({
  id: Joi.string().required(),
  uniqueId: Joi.string().required(),
  upn : Joi.string(),
});
