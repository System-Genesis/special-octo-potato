import Joi from 'joi';

export type MoveGroupDTO = {
    groupId: string;
    parentId: string;
};

export const joiSchema = Joi.object({
    groupId: Joi.string().required(),
    parentId: Joi.string().required(),
});
