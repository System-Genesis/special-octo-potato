import Joi from 'joi';

export type CreateDigitalIdentityDTO = {
    uniqueId: string;
    type: string;
    source: string;
    mail?: string;
    isRoleAttachable?: boolean;
};

export const joiSchema = Joi.object({
    uniqueId: Joi.string().required(),
    type: Joi.string().required(),
    source: Joi.string().required(),
    mail: Joi.string(),
    isRoleAttachable: Joi.boolean(),
});
