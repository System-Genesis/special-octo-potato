import { DigitalIdentityId } from '../../../digitalIdentity/domain/DigitalIdentityId';
import { GroupId } from '../../../group/domain/GroupId';
import { Role } from '../../domain/Role';
import { RoleId } from '../../domain/RoleId';
import { RoleDoc } from './RoleSchema';
import { Source } from '../../../digitalIdentity/domain/Source';
import { Types } from 'mongoose';
import { wrapResult } from '../../../../utils/resultUtils';

export class RoleMapper {
    static toPersistance(role: Role): RoleDoc {
        return {
            roleId: role.roleId.toString(),
            source: role.source.value,
            jobTitle: role.jobTitle,
            directGroup: Types.ObjectId(role.directGroup.toString()),
            digitalIdentityUniqueId: role.digitalIdentityUniqueId?.toString(),
            clearance: role.clearance,
            version: role.version,
            createdAt: role.createdAt,
        };
    }

    static toDomain(raw: RoleDoc): Role {
        const roleIdRes = RoleId.create(raw.roleId);
        const roleIdExtracted = wrapResult(roleIdRes);
        const di_uid = raw.digitalIdentityUniqueId;
        const sourceRes = Source.create(raw.source);
        const sourceExtracted = wrapResult(sourceRes);
        return Role._create(
            roleIdExtracted,
            {
                source: sourceExtracted!, //
                directGroup: GroupId.create(raw.directGroup.toHexString()),
                jobTitle: raw.jobTitle,
                digitalIdentityUniqueId: !!di_uid ? DigitalIdentityId.create(di_uid)._unsafeUnwrap() : undefined,
                clearance: raw.clearance,
                createdAt: raw.createdAt,
            },
            { isNew: false, savedVersion: raw.version },
        );
    }
}
