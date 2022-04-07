import { CreateEntityDTO } from './../useCases/dtos/CreateEntityDTO';
import { entityLog } from './../../../core/infra/logger';
import { sanitize } from '../../../utils/ObjectUtils';
import { Entity } from './../domain/Entity';

// TODO: better type for body
export const logEntity = (entity: Entity | CreateEntityDTO, message: string, title: string, body?: Object): entityLog => {
    const identifiers = getEntityIdentifiers(entity);
    return {
        identifiers,
        title,
        message,
        body: body ? body : {},
    };
};

// TODO: add entityId and figure out a type accordingly
export const getEntityIdentifiers = (entity: Entity | CreateEntityDTO) => {
    const identifiers = {
        personalNumber: entity.personalNumber?.toString(),
        identityCard: entity.identityCard?.toString(),
        goalUserId: entity.goalUserId?.toString(),
        employeeNumber: entity.employeeNumber?.toString(),
        id: (entity as Entity).entityId?.toString(),
    };
    return sanitize(identifiers);
};
