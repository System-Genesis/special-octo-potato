import { Identifier } from './Identifier';

export class UniqueEntityId extends Identifier<string> {
    constructor(id: string) {
        super(id);
    }
}
