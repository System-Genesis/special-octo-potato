import { roleRepository } from '../repository';
import { groupRepository } from '../../group/repository';
import { digitalIdentityRepository } from '../../digitalIdentity/repository';
import { RoleService } from './RoleService';

export const roleService = new RoleService(roleRepository, groupRepository, digitalIdentityRepository);
