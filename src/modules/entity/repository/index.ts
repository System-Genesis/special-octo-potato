import { EntityRepository } from '../infra/mongoose/EntityRepository';
import connection from '../../../shared/infra/mongoose/connection';
import { eventOutbox } from '../../../shared/infra/mongoose/eventOutbox';
import config from 'config';

export const entityRepository = new EntityRepository(connection, eventOutbox, { modelName: config.get('db.mongo.modelNames.entity') });
