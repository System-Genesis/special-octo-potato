import Joi from 'joi';

export type UpdateDigitalIdentityDTO = {
    uniqueId: string;
    mail?: string;
    isRoleAttachable?: boolean;
};

export const joiSchema = Joi.object({
    uniqueId: Joi.string().required(),
    mail: Joi.string(),
    isRoleAttachable: Joi.boolean(),
});
