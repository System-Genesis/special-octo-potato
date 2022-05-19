import { Pictures } from './../../domain/Entity';
import Joi from 'joi';

export type CreateEntityDTO = {
    firstName: string;
    entityType: string;
    lastName?: string;
    personalNumber?: string;
    identityCard?: string;
    employeeNumber?: string;
    organization?: string;
    rank?: string;
    akaUnit?: string;
    clearance?: string;
    externalClearance?: string;
    sex?: string;
    serviceType?: string;
    dischargeDay?: Date;
    birthDate?: Date;
    jobTitle?: string;
    address?: string; // value?
    phone?: string | string[]; //value object
    mobilePhone?: string | string[]; //value object
    goalUserId?: string;
    pictures?: Pictures;
};

export const joiSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    entityType: Joi.string().required(),
    lastName: Joi.string(),
    personalNumber: Joi.string(),
    identityCard: Joi.string(),
    employeeNumber: Joi.string(),
    organization: Joi.string(),
    rank: Joi.string(),
    akaUnit: Joi.string(),
    clearance: Joi.string().trim().regex(/^\d+$/).max(3),
    externalClearance: Joi.string().trim().regex(/^\d+$/).max(3), // TODO: what valid?
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
            }).and('meta'),
        }),
    }),
});
