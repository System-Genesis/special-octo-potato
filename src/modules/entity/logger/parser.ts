import { CreateEntityDTO } from './../useCases/dtos/CreateEntityDTO';
import { entityLog } from './../../../core/infra/logger';
import { sanitize } from '../../../utils/ObjectUtils';
import { Entity } from './../domain/Entity';

export const logEntity = (entity: Partial<Entity> | Partial<CreateEntityDTO>, title: string, message: string): entityLog => {
    const identifiers = getEntityIdentifiers(entity);
    return {
        identifiers,
        title,
        message
    }
}

// TODO: add entityId and figure out a type accordingly
export const getEntityIdentifiers = (entity: Partial<Entity> | Partial<CreateEntityDTO>) => {
    const identifiers = {
      personalNumber: entity.personalNumber?.toString(),
      identityCard: entity.identityCard?.toString(),
      goalUserId: entity.goalUserId?.toString(),
      employeeNumber: entity.employeeNumber?.toString(),
      // id: entity.entityId?.toString(),
    }
    return sanitize(identifiers)
  }