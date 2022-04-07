import Joi from 'joi';

export type ConnectDigitalIdentityDTO = {
    roleId: string;
    digitalIdentityUniqueId: string;
};

export const joiSchema = Joi.object({
    roleId: Joi.string().required(),
    digitalIdentityUniqueId: Joi.string().required(),
});
