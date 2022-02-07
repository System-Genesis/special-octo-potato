import { EmployeeId } from '../../domain/EmloyeeId';
import { BaseError } from "../../../../core/logic/BaseError";

export class MissingOrganizationEmployee extends BaseError {
  private constructor() {
    super(`Employee creation must supply organization`);
  }

  static create() {
    return new MissingOrganizationEmployee();
  }
}