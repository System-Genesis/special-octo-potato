import { EmployeeNumber } from '../../domain/EmployeeNumber';
import { BaseError } from "../../../../core/logic/BaseError";

export class InvalidOrganizationValue extends BaseError {
  private constructor(organization : string) {
    super(`Invalid organization ${organization}`);
  }

  static create(organization: string) {
    return new InvalidOrganizationValue(organization);
  }
}