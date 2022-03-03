import logger from 'logger-genesis';

export type rabbitConfig ={ uri: string, prefetch: number, retryOptions: { minTimeOut: number, retries: number, factor: number}}

export type loggerConfig = { rabbit: rabbitConfig, logger: { systemName: string; serviceName: string; loggerQueue: string; }}

export const initializeLogger = async (rabbitConfig: loggerConfig) => {
    await logger.initialize(rabbitConfig.logger.systemName, rabbitConfig.logger.serviceName, rabbitConfig.logger.loggerQueue, false);
};
  