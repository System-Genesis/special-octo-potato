import { GroupRepository } from '../infra/mongoose/GroupRepository';
import connection from '../../../shared/infra/mongoose/connection';
import { eventOutbox } from '../../../shared/infra/mongoose/eventOutbox';
import config from 'config';

export const groupRepository = new GroupRepository(connection, eventOutbox, { modelName: config.get('db.mongo.modelNames.group') });
