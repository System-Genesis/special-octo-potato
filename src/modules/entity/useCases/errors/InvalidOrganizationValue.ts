import { EmployeeNumber } from '../../domain/EmployeeNumber';
import { BaseError } from "../../../../core/logic/BaseError";

export class InvalidOrganizationValue extends BaseError {
  private constructor(organization : string) {
    super(``);
  }

  static create(organization: string) {
    return new InvalidOrganizationValue(organization);
  }
}