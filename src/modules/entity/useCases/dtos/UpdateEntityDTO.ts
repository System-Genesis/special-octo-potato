import { Pictures } from './../../domain/Entity';
import Joi from 'joi';

export type UpdateEntityDTO = { entityId: string } & Partial<{
  firstName: string;
  entityType: string;
  lastName: string | null;
  personalNumber: string | null;
  identityCard: string | null;
  // TODO: should be emplyeeId in update?
  rank: string | null;
  akaUnit: string | null;
  clearance: string | null;
  sex: string | null;
  serviceType: string | null;
  dischargeDay: Date | null;
  birthDate: Date | null;
  address: string; // value?
  phone: string | string[] | null; //value object
  mobilePhone: string | string[] | null; //value object
  goalUserId: string | null;
  pictures: Pictures | null;
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
        takenAt: Joi.date(),
        path: Joi.string(),
        format: Joi.string(),
        updatedAt: Joi.date(),
      }),
    }),
  }),
});