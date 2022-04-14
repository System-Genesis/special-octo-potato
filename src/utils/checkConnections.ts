
import logger from 'logger-genesis';
import connection from '../shared/infra/mongoose/connection';

export default () => {
    return connection.readyState === 1 && logger.isConnected();
}