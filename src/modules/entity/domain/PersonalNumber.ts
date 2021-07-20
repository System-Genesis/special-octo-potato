import { Result, err, ok } from "neverthrow";

export class PersonalNumber {
  constructor(
    private _value: string
  ){}

  private static isValid(personalNumber: string) {
    return /^\d{6,9}$/.test(personalNumber);
  }

  public static create(personalNumber: string): Result<PersonalNumber, string> {
    if(!PersonalNumber.isValid(personalNumber)) {
      return err(`invalid personal number: ${personalNumber}`);
    }
    return ok(new PersonalNumber(personalNumber));
  }

  get value() {
    return this._value;
  }
}