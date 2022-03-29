import Joi from 'joi';

export type DeleteGroupDTO = {
    id: string;
};

export const joiSchema = Joi.object({
    id: Joi.string().required(),
});
