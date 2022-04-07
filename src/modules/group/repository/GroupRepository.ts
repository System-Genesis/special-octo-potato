import { Result } from 'neverthrow';
import { AggregateVersionError } from '../../../core/infra/AggregateVersionError';
import { Repository } from '../../../core/infra/Repository';
import { BaseError } from '../../../core/logic/BaseError';
import { DigitalIdentityId } from '../../digitalIdentity/domain/DigitalIdentityId';
import { Group } from '../domain/Group';
import { GroupId } from '../domain/GroupId';

export interface GroupRepository extends Repository<Group> {
    generateGroupId(): GroupId;
    exists(id: GroupId): Promise<boolean>;
    save(group: Group): Promise<Result<void, AggregateVersionError>>;
    getByGroupId(groupId: GroupId): Promise<Group | null>;
    getByNameAndParentId(name: string, parentId: GroupId): Promise<GroupId | null>;
    getRootByName(name: string): Promise<GroupId | null>;
    delete(groupId: GroupId): Promise<Result<any, BaseError>>;
}
