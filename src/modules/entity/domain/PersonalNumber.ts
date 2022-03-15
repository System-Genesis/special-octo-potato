import { Result, err, ok } from "neverthrow";
import { Identifier } from "../../../core/domain/Identifier";

//TODO (D-T): should be value objects? collection of validation functions?
export class PersonalNumber extends Identifier<string> {

  private static isValid(personalNumber: string) {
    return /^\d{6,9}$/.test(personalNumber);
  }

  public static create(personalNumber: string): Result<PersonalNumber, string> {
    if(!PersonalNumber.isValid(personalNumber)) {
      return err(`invalid personal number: ${personalNumber}`);
    }
    return ok(new PersonalNumber(personalNumber));
  }

}