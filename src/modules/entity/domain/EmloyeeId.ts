import { Result, err, ok } from "neverthrow";
import { Identifier } from "../../../core/domain/Identifier";

export class EmployeeId extends Identifier<string>{ 

  private static isValid(employeeId: string) {
    // Validate correct input
    return employeeId.match(/^\d{5,6}$/);
  }

 // TODO: should be error?
  public static create(employeeId: string): Result<EmployeeId, string> {
    if(!EmployeeId.isValid(employeeId)) {
      return err(`invalid employee id: ${employeeId}`);
    }

    return ok(new EmployeeId(employeeId));
  }
}