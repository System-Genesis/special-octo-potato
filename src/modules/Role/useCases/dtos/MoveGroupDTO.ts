import Joi from 'joi';

export type MoveGroupDTO = {
    roleId: string;
    groupId: string;
};

export const joiSchema = Joi.object({
    roleId: Joi.string().required(),
    groupId: Joi.string().required(),
});
