
import { sanitize } from '../../utils/ObjectUtils';
import { Entity } from './../../modules/entity/domain/Entity';
export interface entityLog {
  identifiers: {
      personalNumber?: string,
      identityCard?: string,
      goalUserId?: string,
      employeeId?: string,
      id?: string,
  };
  message: string,
  title: string,
  body?: Object,
}

export interface ILogger {
/**
 * 
 * @param t 
 * @param local 
 */
  logInfo(t: entityLog, local: boolean) : void;
  logError(t: entityLog, local: boolean) : void;
}
