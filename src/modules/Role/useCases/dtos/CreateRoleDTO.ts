import Joi from 'joi';

export type CreateRoleDTO = {
    roleId: string;
    source: string;
    directGroup: string;
    jobTitle?: string;
    clearance?: string;
};

export const joiSchema = Joi.object({
    roleId: Joi.string().required(),
    source: Joi.string().required(),
    directGroup: Joi.string().required(),
    jobTitle: Joi.string(),
    clearance: Joi.string(),
});
