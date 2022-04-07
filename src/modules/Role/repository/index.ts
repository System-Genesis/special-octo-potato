import { RoleRepository } from '../infra/mongoose/RoleRepository';
import connection from '../../../shared/infra/mongoose/connection';
import { eventOutbox } from '../../../shared/infra/mongoose/eventOutbox';
import config from 'config';

export const roleRepository = new RoleRepository(connection, eventOutbox, { modelName: config.get('db.mongo.modelNames.role') });
