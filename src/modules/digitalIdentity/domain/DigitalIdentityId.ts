import { UniqueEntityId } from '../../../core/domain/UniqueEntityId';
import { Result, err, ok } from 'neverthrow';
import config from 'config';

// TODO: maybe inject config to a factory class that creates ids
const domains: string[] = config.get('valueObjects.digitalIdentityId.domain.values');
// replace dot special character with literal dot
const escapedDomains = domains.map((s) => s.replace('.', '\\.'));
const re = new RegExp(`^.+@(${escapedDomains.join('|')})$`, 'i');

export class DigitalIdentityId extends UniqueEntityId {
    private constructor(id: string) {
        super(id.toLowerCase());
    }

    private static isValid(id: string) {
        return re.test(id);
    }

    private static format(id: string) {
        return id.toLowerCase();
    }

    public static create(id: string): Result<DigitalIdentityId, string> {
        if (!DigitalIdentityId.isValid(id)) {
            return err(`invalid digital identity unique id: ${id}`);
        }
        return ok(new DigitalIdentityId(DigitalIdentityId.format(id)));
    }
}
