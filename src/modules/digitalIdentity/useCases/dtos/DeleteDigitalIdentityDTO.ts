import Joi from 'joi';

export const joiSchema = Joi.object({
  uniqueId: Joi.string().required(),
});
