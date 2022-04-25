import { Result } from 'neverthrow';
import { Identifier } from '../../../core/domain/Identifier';
import { AggregateVersionError } from '../../../core/infra/AggregateVersionError';
import { Repository } from '../../../core/infra/Repository';
import { BaseError } from '../../../core/logic/BaseError';
import { DigitalIdentityId } from '../../digitalIdentity/domain/DigitalIdentityId';
import { GroupId } from '../../group/domain/GroupId';
import { Role } from '../domain/Role';
import { RoleId } from '../domain/RoleId';

export interface RoleRepository extends Repository<Role> {
    create(role: Role): Promise<Result<void, AggregateVersionError>>;
    save(role: Role): Promise<Result<void, AggregateVersionError>>;
    getByRoleId(roleId: RoleId): Promise<Role | null>;
    exists(roleId: RoleId): Promise<boolean>;
    getByDigitalIdentityId(digitalIdentityUniqueId: DigitalIdentityId): Promise<Role | null>;
    getByGroupId(groupId: GroupId): Promise<Role | null>;
    delete(roleId: RoleId): Promise<Result<any, BaseError>>;
}
