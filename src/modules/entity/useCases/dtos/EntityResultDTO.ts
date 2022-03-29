import { Entity } from '../../domain/Entity';

export type EntityResultDTO = {
    id: string;
    // firstName: string;
    // entityType: string;
    // lastName?: string;
    // personalNumber?: string;
    // identityCard?: string;
    // rank?: string;
    // akaUnit?: string;
    // clearance?: string;
    // sex?: string;
    // serviceType?: string;
    // dischargeDate?: Date;
    // birthDate?: Date;
    // jobTitle?: string;
    // address?: string;
    // phone?: string[];
    // mobilePhone?: string[];
    // goalUserId?: string;
    // pictures?: {
    //   profile?: {
    //     url: string;
    //     meta: {
    //       createdAt: Date;
    //       updatedAt?: Date;
    //     }
    //   }
    // }
};

export const entityToDTO: (e: Entity) => EntityResultDTO = (entity) => ({
    id: entity.entityId.toString(),
    // firstName: entity.name.firstName,
    // lastName: entity.name.lastName,
    // entityType: entity.entityType,
    // address: entity.address,
    // personalNumber: entity.personalNumber?.toString(),
    // identityCard: entity.identityCard?.toString(),
    // rank: entity.rank?.value,
    // akaUnit: entity.akaUnit,
    // clearance: entity.clearance,
    // sex: entity.sex,
    // serviceType: entity.serviceType?.value,
    // dischargeDate: entity.dischargeDate,
    // birthDate: entity.birthDate,
    // jobTitle: entity.jobTitle,
    // phone: entity.phone.map(p => p.value),
    // mobilePhone: entity.mobilePhone.map(p => p.value),
    // goalUserId: entity.goalUserId?.toString(),
    // pictures: !!entity.profilePicture ? {
    //   profile: {
    //     url: entity.profilePicture.path,
    //     meta: {
    //       createdAt: entity.profilePicture.createdAt,
    //       updatedAt: entity.profilePicture.updatedAt,
    //     },
    //   },
    // } : undefined,
});
