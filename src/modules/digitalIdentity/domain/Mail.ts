import { Result, err, ok } from 'neverthrow';

const re = new RegExp('^.+@.+$', 'i');

export class Mail {
    private constructor(private _value: string) {}

    private static isValidMail(mail: string) {
        return re.test(mail);
    }

    private static format(mail: string) {
        return mail.trim().toLowerCase();
    }

    static create(mail: string): Result<Mail, string> {
        if (!Mail.isValidMail(mail)) {
            return err(`invalid mail: ${mail}`);
        }
        return ok(new Mail(Mail.format(mail)));
    }

    get value() {
        return this._value;
    }
}
