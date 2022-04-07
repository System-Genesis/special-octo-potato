import { entityRepository } from '../repository';
import { digitalIdentityRepository } from '../../digitalIdentity/repository';
import { EntityService } from './EntityService';
import { logger } from '../../../shared/infra/rabbit';

export const entityService = new EntityService(entityRepository, digitalIdentityRepository, logger);
