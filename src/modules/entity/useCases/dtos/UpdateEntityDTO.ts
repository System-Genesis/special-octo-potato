import { Pictures } from './../../domain/Entity';
import Joi from 'joi';

export type UpdateEntityDTO = { entityId: string } & Partial<{
    firstName: string;
    entityType: string;
    lastName: string | null;
    personalNumber: string;
    identityCard: string;
    // TODO: should be emplyeeId in update?
    rank: string | null;
    akaUnit: string | null;
    clearance: string | null;
    externalClearance: string | null;
    sex: string | null;
    serviceType: string | null;
    dischargeDay: Date | null;
    birthDate: Date | null;
    address: string | null; // value?
    phone: string | string[] | null; //value object
    mobilePhone: string | string[] | null; //value object
    goalUserId: string;
    pictures: Pictures | null;
}>;

export const joiSchema = Joi.object({
    entityId: Joi.string().required(),
    firstName: Joi.string().min(1),
    entityType: Joi.string(),
    lastName: Joi.string().allow(null),
    personalNumber: Joi.string(),
    identityCard: Joi.string(),
    rank: Joi.string().allow(null),
    akaUnit: Joi.string().allow(null),
    clearance: Joi.string().trim().regex(/^\d+$/).max(3).allow(null),
    externalClearance: Joi.string().trim().regex(/^\d+$/).max(3).allow(null), // TODO: what valid?
    sex: Joi.string().allow(null),
    serviceType: Joi.string().allow(null),
    address: Joi.string().allow(null),
    phone: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow(null),
    mobilePhone: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow(null),
    goalUserId: Joi.string(),
    dischargeDay: Joi.date().allow(null),
    birthDate: Joi.date().allow(null),
    pictures: Joi.object({
        profile: Joi.object({
            meta: Joi.object({
                takenAt: Joi.date(),
                path: Joi.string(),
                format: Joi.string(),
                updatedAt: Joi.date(),
            }),
        }),
    }).allow(null),
});
