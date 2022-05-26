import { connect as connectDB } from "./shared/infra/mongoose/connection";
import pRetry from 'p-retry';
import { start as startServer } from './shared/infra/http/app';

export const startApp = (async () => {
  try {
    await pRetry(connectDB, {
      onFailedAttempt: err => console.log(`[DB]: connection attempt ${err.attemptNumber} failed`),
    });
    console.log('[DB]: connected successfully');
  } catch (err) {
    console.error(err);
  }
  // starts the server
  // await import('./shared/infra/http/app');
  return startServer();
})();