import { entityLog } from './../../../core/infra/logger';
import { sanitize } from '../../../utils/ObjectUtils';
import { Entity } from './../domain/Entity';

export const logEntity = (entity: Entity, title: string, message: string): entityLog => {
    const identifiers = getEntityIdentifiers(entity);
    return {
        identifiers,
        title,
        message
    }
}

export const getEntityIdentifiers = (entity: Entity) => {
    const identifiers = {
      personalNumber: entity.personalNumber?.toString(),
      identityCard: entity.identityCard?.toString(),
      goalUserId: entity.goalUserId?.toString(),
      employeeNumber: entity.employeeNumber?.toString(),
      id: entity.entityId?.toString(),
    }
    return sanitize(identifiers)
  }