import { loggerConfig } from './connection';
import { LoggerGenesis } from 'logger-genesis';
import { entityLog } from './../../../core/infra/logger';
import { ILogger } from '../../../core/infra/logger';
export default class Logger implements ILogger {
    
  private _logger;


    constructor(logger: LoggerGenesis) {
      this._logger = logger;
    }

    async initialize(rabbitConfig: loggerConfig) {
      await this._logger.initialize(rabbitConfig.systemName, rabbitConfig.serviceName, rabbitConfig.rabbit.loggerQueue, true, rabbitConfig.rabbit.uri);
    };

    logInfo(t: entityLog, local: boolean) {
        this._logger.info(!local, 'APP', t.title, t.message, { identifiers: t.identifiers });
    }

    logError(t: entityLog, local: boolean) {
      this._logger.error(!local, 'APP', t.title, t.message, { identifiers: t.identifiers });
  }
      
    
}