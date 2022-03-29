import { Result, err, ok } from 'neverthrow';

const re = /^\d{2,3}-?\d{7}$/;
const FORMATTED_LENGTH = 10;

export class MobilePhone {
    constructor(private _value: string) {}

    private static format(mobilePhone: string) {
        return mobilePhone.replace('-', '').padStart(FORMATTED_LENGTH, '0');
    }

    private static isvalid(mobilePhone: string) {
        return re.test(mobilePhone);
    }

    public equals(other: MobilePhone) {
        return this._value === other.value;
    }

    public static create(mobilePhone: string): Result<MobilePhone, string> {
        if (!MobilePhone.isvalid(mobilePhone)) {
            return err(`invalid mobile phone: ${mobilePhone}`);
        }
        return ok(new MobilePhone(MobilePhone.format(mobilePhone)));
    }

    get value() {
        return this._value;
    }
}
