import { SourceMisMatchError } from './errors/SourceMisMatchError';
import { CannotDeleteRoot } from './../domain/errors/CannotDeleteRoot';
import { RenameGroupDTO } from './dto/RenameGroupDTO';
import { RenameRootError } from './../domain/errors/RenameRootError';
import { GroupRepository } from '../repository/GroupRepository';
import { CreateGroupDTO } from './dto/CreateGroupDTO';
import { Source } from '../../digitalIdentity/domain/Source';
import { AppError } from '../../../core/logic/AppError';
import { combine, err, ok, Result } from 'neverthrow';
import { GroupId } from '../domain/GroupId';
import { has } from '../../../utils/ObjectUtils';
import { Group } from '../domain/Group';
import { DuplicateChildrenError } from '../domain/errors/DuplicateChildrenError';
import { MoveGroupDTO } from './dto/MoveGroupDTO';
import { TreeCycleError } from '../domain/errors/TreeCycleError';
import { GroupResultDTO, groupToDTO } from './dto/GroupResultDTO';
import { IsNotLeafError } from '../domain/errors/IsNotLeafError';
import { BaseError } from '../../../core/logic/BaseError';
import { RoleRepository } from '../../Role/repository/RoleRepository';
import { HasRolesAttachedError } from '../domain/errors/HasRolesAttachedError';
import { UpdateGroupDTO } from './dto/UpdateGroupDTO';
import { UpdateResult } from '../../group/domain/Group';

export class GroupService {
  constructor(private groupRepository: GroupRepository, private roleRepository: RoleRepository) {}

  async createGroup(
    createDTO: CreateGroupDTO
  ): Promise<
    Result<
      GroupResultDTO,
      | AppError.ValueValidationError
      | AppError.ResourceNotFound
      | AppError.RetryableConflictError
      | DuplicateChildrenError
    >
  > {
    const source = Source.create(createDTO.source).mapErr(AppError.ValueValidationError.create);
    if (source.isErr()) {
      return err(source.error);
    }
    let group: Result<Group, DuplicateChildrenError>;
    let parent = null;
    const groupId = this.groupRepository.generateGroupId();
    if (has(createDTO, 'directGroup')) {
      const parentId = GroupId.create(createDTO.directGroup);
      parent = await this.groupRepository.getByGroupId(parentId);
      if (!parent) {
        return err(AppError.ResourceNotFound.create(createDTO.directGroup, 'group'));
      }
      const parentSource = parent.source.value;
      if (createDTO.source !== parentSource) {
        return err(SourceMisMatchError.create(createDTO.source, parentSource));
      }
      group = parent.createChild(groupId, {
        source: source.value,
        name: createDTO.name,
        akaUnit: createDTO.akaUnit,
        diPrefix: createDTO.diPrefix,
      });
      if (group.isErr()) {
        const childGroupId = await this.groupRepository.getByNameAndParentId(createDTO.name, parentId);
        if (childGroupId) {
          return err(AppError.AlreadyExistsError.create('group', { id: childGroupId.toString() }));
        } else {
          return err(AppError.UnexpectedError.create());
        }
      }
    } else {
      // TODO: validate some map between source and root name
      if (createDTO.name !== createDTO.source) {
        return err(AppError.ValueValidationError.create(createDTO.name));
      }
      const rootId = await this.groupRepository.getRootByName(createDTO.name);
      if (rootId) {
        return err(AppError.AlreadyExistsError.create('group', { id: rootId.toString() }));
      } 
      group = ok(
        Group.createRoot(groupId, {
          name: createDTO.name,
          source: source.value,
          akaUnit: createDTO.akaUnit,
          diPrefix: createDTO.diPrefix
        })
      );
    }

  const saveGroupRes = (await this.groupRepository.save(group.value))
  .map(() => groupToDTO(group._unsafeUnwrap())) // TODO why the fuck TS doesn't recognize the correct type
  .mapErr((err) => {
    return AppError.RetryableConflictError.create(err.message)
  });

  if (saveGroupRes.isErr()) return saveGroupRes;
  if(parent) {
    const saveParentRes = (await this.groupRepository.save(parent)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    if (saveParentRes.isErr()) return err(AppError.UnexpectedError.create(saveParentRes.error.message));
  }
  // TODO: use saveParentRes or do it in some other way?
  return saveGroupRes;

  }
  // async updateGroup(updateGroupDTO: UpdateGroupDTO): Promise<Result<GroupResultDTO, AppError.ResourceNotFound | AppError.RetryableConflictError>> {
  //   const groupId = GroupId.create(updateGroupDTO.id);
  //   let group: Group | null = await this.groupRepository.getByGroupId(groupId);
  //   if (!group) {
  //     return err(AppError.ResourceNotFound.create(updateGroupDTO.id, 'Group'));
  //   }

  //   const newGroup =ok(
  //     Group._create(groupId, {
  //       name: group.name,
  //       source: group.source,
  //       akaUnit: group.akaUnit,
  //       diPrefix: updateGroupDTO.diPrefix,
        
  //     },{savedVersion: group.version, isNew:false}))
  //     ;
  //   return (await this.groupRepository.save(newGroup.value)).map(() => groupToDTO(newGroup._unsafeUnwrap())) .mapErr((err) =>
  //     AppError.RetryableConflictError.create(err.message)
  //   );
  // }
  async updateGroup(updateGroupDTO: UpdateGroupDTO): Promise<Result<GroupResultDTO, AppError.ResourceNotFound | AppError.RetryableConflictError>> {
    const groupId = GroupId.create(updateGroupDTO.id);
    let group: Group | null= await this.groupRepository.getByGroupId(groupId);
    if (!group) {
      return err(AppError.ResourceNotFound.create(updateGroupDTO.id, 'Group'));
    }
    const {diPrefix} = updateGroupDTO;
    let changes: UpdateResult[] = []
    if(diPrefix){
      const newDiPrefix = diPrefix;
      changes.push(group.updateDetails({ diPrefix: newDiPrefix }));

    }
    const result = combine(changes);
    if (result.isErr()) {
      return err(result.error);
    }
    return (await this.groupRepository.save(group))
      .map(() => groupToDTO(group as Group)) // return DTO
      .mapErr((err) => AppError.RetryableConflictError.create(err.message)); // or Error
  }

  async renameGroup(renameGroupDTO: RenameGroupDTO): Promise<Result<GroupResultDTO, AppError.ResourceNotFound | AppError.RetryableConflictError>> {
    const groupId = GroupId.create(renameGroupDTO.id);
    let group: Group | null= await this.groupRepository.getByGroupId(groupId);
    if (!group) {
      return err(AppError.ResourceNotFound.create(renameGroupDTO.id, 'Group'));
    }
    if (!group.parentId) {
      return err(RenameRootError.create(group.name));
    }
    const childGroupId = await this.groupRepository.getByNameAndParentId(renameGroupDTO.name, group.parentId);
    if (childGroupId) {
      return err(DuplicateChildrenError.create(renameGroupDTO.name, group.parentId.toString()))
    }
    const result = group.updateDetails({ name: renameGroupDTO.name });
    if (result.isErr()) {
      return err(result.error);
    }
    return (await this.groupRepository.save(group))
      .map(() => groupToDTO(group as Group)) // return DTO
      .mapErr((err) => AppError.RetryableConflictError.create(err.message)); // or Error
  }

  async moveGroup(
    moveGroupDTO: MoveGroupDTO
  ): Promise<
    Result<void, AppError.ResourceNotFound | AppError.RetryableConflictError | DuplicateChildrenError | TreeCycleError>
  > {
    const groupId = GroupId.create(moveGroupDTO.groupId);
    const parentId = GroupId.create(moveGroupDTO.parentId);
    const group = await this.groupRepository.getByGroupId(groupId);
    if (!group) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.groupId, 'group'));
    }
    const groupSource = group.source.value;
    const parent = await this.groupRepository.getByGroupId(parentId);
    if (!parent) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.parentId, 'parent group'));
    }
    const parentSource = parent.source.value;
    if (groupSource !== parentSource) {
      return err(SourceMisMatchError.create(groupSource, parentSource));
    }
    const result = group.moveToParent(parent);
    if (result.isErr()) {
      return err(result.error);
    }
    return (await this.groupRepository.save(group)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
  }

  // TODO: update group (rename)

  async deleteGroup(id: string): Promise<Result<any, BaseError>> {
    const groupId = GroupId.create(id);
    const group = await this.groupRepository.getByGroupId(groupId);
    if (!group) {
      return err(AppError.ResourceNotFound.create(id, 'Group'));
    }
    if(!group.isLeaf){
      return err(IsNotLeafError.create(id));
    }
    if (group.childrenNames.length != 0) {
      return err(IsNotLeafError.create(id));
    }
    const role = await this.roleRepository.getByGroupId(groupId);
    if (!!role && !!role.roleId) {
      return err(HasRolesAttachedError.create(id));
    }
    const parentId = group.parentId;
    if (!parentId) {
      return err(CannotDeleteRoot.create(id));
    }
    const parent = await this.groupRepository.getByGroupId(parentId);
    if (!parent) {
      return err(AppError.ResourceNotFound.create(id, 'Group'));
    }
    parent.deleteChild();
    const deleteGroupRes = (await this.groupRepository.delete(groupId)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    if (deleteGroupRes.isErr()) return deleteGroupRes;
    const saveParentRes = (await this.groupRepository.save(parent)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    return saveParentRes;
  }
}
