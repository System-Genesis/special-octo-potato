import { LoggerGenesis } from 'logger-genesis';

export type rabbitConfig = { uri: string, prefetch: number, loggerQueue: string, retryOptions: { minTimeOut: number, retries: number, factor: number } }

export type loggerConfig = { rabbit: rabbitConfig, systemName: string; serviceName: string }

export const initializeLogger = async (logger: LoggerGenesis, rabbitConfig: loggerConfig) => {
    await logger.initialize(rabbitConfig.systemName, rabbitConfig.serviceName, rabbitConfig.rabbit.loggerQueue, true);
};
  