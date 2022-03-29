import Joi from 'joi';

export type CreateGroupDTO = {
    name: string;
    source: string;
    directGroup?: string;
    akaUnit?: string;
    diPrefix?: string;
};

export const joiSchema = Joi.object({
    name: Joi.string().required(),
    source: Joi.string().required(),
    directGroup: Joi.string(),
    diPrefix: Joi.string(),
    akaUnit: Joi.string(),
});
