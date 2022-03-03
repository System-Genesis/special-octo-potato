export interface entityLog {
identifiers: {
    personalNumber: string,
    identityCard: string,
    goalUserId: string,
    employeeId: string
};
message: string,
title: string,
}

export interface ILogger {
/**
 * 
 * @param t 
 * @param local 
 */
  logInfo(t: infoLog, local: boolean) : void;
}
