import { EmployeeId } from './../../domain/EmloyeeId';
import { BaseError } from "../../../../core/logic/BaseError";

export class EmployeeIdAlreadyExists extends BaseError {
  private constructor(employeeId: string, organization: string) {
    super(`Employee Id: ${employeeId} already belogns to another entity in organization ${organization}`);
  }

  static create(employeeId: string, organization: string) {
    return new EmployeeIdAlreadyExists(employeeId, organization);
  }
}