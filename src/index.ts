
import { connect as connectDB } from "./shared/infra/mongoose/connection";
import pRetry from 'p-retry';
import { start as startServer } from './shared/infra/http/app';
import config from "config";
import { logger } from "./shared/infra/rabbit";
import { loggerConfig } from "./shared/infra/rabbit/connection";

const connString: string = config.get('db.mongo.connectionString');
const loggerConf : loggerConfig = config.get('logger');

export const startApp = (async () => {
  try {
    await pRetry(() => connectDB(connString), {
      onFailedAttempt: err => console.log(`[DB]: connection attempt ${err.attemptNumber} failed`),
    });
    await pRetry(() => logger.initialize(loggerConf), {
      onFailedAttempt: err => console.log(`[RABBIT LOGGER]: connection attempt ${err.attemptNumber} failed`),
    });
    console.log('[DB]: connected successfully');
  } catch (err) {
    console.error(err);
  }
  // starts the server
  // await import('./shared/infra/http/app');
  return startServer();
})();