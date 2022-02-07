import { Result, err, ok } from "neverthrow";
import { Identifier } from "../../../core/domain/Identifier";

export class EmployeeId extends Identifier<string>{ 

  private static isValid(employeeId: string) {
    // Validate correct input
    // TODO: what validation?
    return employeeId.match(/^\d{4,12}$/);
  }

 // TODO: should be error?
  public static create(employeeId: string): Result<EmployeeId, string> {
    if(!EmployeeId.isValid(employeeId)) {
      return err(`invalid employee id: ${employeeId}`);
    }

    return ok(new EmployeeId(employeeId));
  }
}