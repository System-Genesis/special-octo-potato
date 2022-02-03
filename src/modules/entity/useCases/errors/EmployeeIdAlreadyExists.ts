import { EmployeeId } from './../../domain/EmloyeeId';
import { BaseError } from "../../../../core/logic/BaseError";

export class EmployeeIdAlreadyExists extends BaseError {
  private constructor(employeeId: string) {
    super(`Employee Id: ${employeeId} already belogns to another entity`);
  }

  static create(employeeId: string) {
    return new EmployeeIdAlreadyExists(employeeId);
  }
}