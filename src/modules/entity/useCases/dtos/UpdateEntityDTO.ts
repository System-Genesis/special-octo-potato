import Joi from 'joi';

export type UpdateEntityDTO = { entityId: string } & Partial<{
  firstName: string;
  entityType: string;
  lastName: string;
  personalNumber: string;
  identityCard: string;
  rank: string;
  akaUnit: string;
  clearance: string;
  sex: string;
  serviceType: string;
  dischargeDay: Date;
  birthDate: Date;
  address: string; // value?
  phone: string | string[]; //value object
  mobilePhone: string | string[]; //value object
  goalUserId: string;
  pictures: {
    profile?: {
      meta?: {
        path: string;
        format: string;
        createdAt?: Date;
        updatedAt?: Date;
      } | {}
    }
  }
}>

export const joiSchema = Joi.object({
  entityId: Joi.string().required(),
  firstName: Joi.string().min(1),
  entityType: Joi.string(),
  lastName: Joi.string(),
  personalNumber: Joi.string(),
  identityCard: Joi.string(),
  rank: Joi.string(),
  akaUnit: Joi.string(),
  clearance: Joi.string().trim().regex(/^\d+$/).max(3),
  sex: Joi.string(),
  serviceType: Joi.string(),
  address: Joi.string(),
  phone: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  mobilePhone: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  goalUserId: Joi.string(),
  jobTitle: Joi.string(),
  dischargeDay: Joi.date(),
  birthDate: Joi.date(),
  pictures: Joi.object({
    profile: Joi.object({
      meta: Joi.object({
        path: Joi.string(),
        format: Joi.string(),
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      }),
    }),
  }),
});