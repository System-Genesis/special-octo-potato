import { Result, err, ok } from "neverthrow";

export class IdentityCard {
  constructor(
    private _value: string
  ){}

  private static isValid(identityCard: string) {
    // Validate correct input
    if (!identityCard.match(/^\d{5,9}$/g)) return false;

    // The number is too short - add leading zeros
    identityCard = identityCard.padStart(9,'0');

    // CHECK THE ID NUMBER
    const accumulator = identityCard.split('').reduce((count, currChar, currIndex) => { 
      const num = Number(currChar) * ((currIndex % 2) + 1);
      return count += num > 9 ? num - 9 : num;  
    }, 0);

    return (accumulator % 10 === 0);
  }

  public static create(identityCard: string): Result<IdentityCard, string> {
    if(!IdentityCard.isValid(identityCard)) {
      return err(`invalid identity card: ${identityCard}`);
    }

    return ok(new IdentityCard(identityCard));
  }

  get value() {
    return this._value;
  }
}