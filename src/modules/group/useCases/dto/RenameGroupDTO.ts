import Joi from 'joi';

export type RenameGroupDTO = {
    id: string;
    name: string;
};

export const joiSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
});
