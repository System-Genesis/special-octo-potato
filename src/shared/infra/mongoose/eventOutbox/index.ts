import { EventOutbox } from './Outbox';
import connection from '../connection';
import config from 'config';

export const eventOutbox = new EventOutbox(connection, {
    modelName: config.get('db.mongo.modelNames.eventOutbox'),
});
