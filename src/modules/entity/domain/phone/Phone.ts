import { Result, err, ok } from 'neverthrow';

/*
 * example of valid values: 02-123456, 02-1234567, 02123456/7, *123, 1234/5
 */
const re = /^\d{1,2}-?\d{6,7}$|^\*\d{3}$|^\d{4,5}$/;

export class Phone {
    constructor(private _value: string) {}

    private static format(phone: string) {
        return phone.replace('-', '');
    }

    private static isvalid(phone: string) {
        return re.test(phone);
    }

    public equals(other: Phone) {
        return this._value === other.value;
    }

    public static create(phone: string): Result<Phone, string> {
        if (!Phone.isvalid(phone)) {
            return err(`invalid phone: ${phone}`);
        }
        return ok(new Phone(Phone.format(phone)));
    }

    get value() {
        return this._value;
    }
}
