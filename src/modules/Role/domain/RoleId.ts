import { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import { UniqueEntityId } from '../../../core/domain/UniqueEntityId';
import config from 'config';

const domains: string[] = config.get('valueObjects.roleIdSuffixes.domain.values');
// replace dot special character with literal dot
const escapedDomains = domains.map((s) => s.replace('.', '\\.'));
const re = new RegExp(`^.+@(${escapedDomains.join('|')})$`, 'i');
export class RoleId extends UniqueEntityId {
    private constructor(id: string) {
        super(id.toLowerCase());
    }

    private static isValid(id: string) {
        return re.test(id);
    }

    private static format(id: string) {
        return id.trim();
    }

    public static create(id: string): Result<RoleId, string> {
        if (!RoleId.isValid(id)) {
            return err(`invalid roleId: ${id}`);
        }
        return ok(new RoleId(RoleId.format(id)));
    }
}
