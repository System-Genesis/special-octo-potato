import { Result, err, ok } from "neverthrow";
import { Identifier } from "../../../core/domain/Identifier";

export class EmployeeNumber extends Identifier<string>{ 

  private static isValid(employeeNumber: string) {
    // Validate correct input
    // TODO: what validation?
    return employeeNumber.match(/^\d{4,12}$/);
  }

 // TODO: should be error?
  public static create(employeeNumber: string): Result<EmployeeNumber, string> {
    if(!EmployeeNumber.isValid(employeeNumber)) {
      return err(`invalid employee id: ${employeeNumber}`);
    }

    return ok(new EmployeeNumber(employeeNumber));
  }
}