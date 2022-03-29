import { entityRepository } from '../repository';
import { digitalIdentityRepository } from '../../digitalIdentity/repository';
import { EntityService } from './EntityService';

export const entityService = new EntityService(entityRepository, digitalIdentityRepository);
