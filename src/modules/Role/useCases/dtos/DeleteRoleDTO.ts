import Joi from "joi";


// export type DeleteRoleDTO = {
//     roleId: string;
// }

export const joiSchema = Joi.object({
    roleId: Joi.string().required(),
  });