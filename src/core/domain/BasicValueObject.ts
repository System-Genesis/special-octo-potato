import { err, ok, Result } from 'neverthrow';

export abstract class BasicValueObject<T> {
    protected constructor(private _value: T) {}

    get value() {
        return this._value;
    }
}
