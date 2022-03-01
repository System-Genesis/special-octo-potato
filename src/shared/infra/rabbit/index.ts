import logger from 'logger-genesis';
import config from "config";

export const initializeLogger = async () => {
    const rabbitEnv = config.rabbit;
    await logger.initialize(config.systemName, config.serviceName, rabbitEnv.logger, false);
};
  