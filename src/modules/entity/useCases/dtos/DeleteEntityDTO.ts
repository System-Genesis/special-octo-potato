import Joi from 'joi';

export const joiSchema = Joi.object({
    id: Joi.string().required(),
});
