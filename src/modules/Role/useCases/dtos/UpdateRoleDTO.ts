import Joi from 'joi';

export type UpdateRoleDTO = {
    roleId: string;
    jobTitle: string;
    clearance: string;
};

export const joiSchema = Joi.object({
    roleId: Joi.string().required(),
    jobTitle: Joi.string(),
    clearance: Joi.string(),
});
