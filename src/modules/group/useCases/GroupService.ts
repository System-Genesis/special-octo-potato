import { GroupRepository } from "../repository/GroupRepository";
import { CreateGroupDTO } from "./dto/CreateGroupDTO";
import { Source } from "../../digitalIdentity/domain/Source";
import { AppError } from "../../../core/logic/AppError";
import { err, ok, Result } from "neverthrow";
import { GroupId } from "../domain/GroupId";
import { has } from "../../../utils/ObjectUtils";
import { Group } from "../domain/Group";
import { DuplicateChildrenError } from "../domain/errors/DuplicateChildrenError";
import { MoveGroupDTO } from "./dto/MoveGroupDTO";

export class GroupService {
  constructor(
    private groupRepository: GroupRepository
  ) {}

  async createGroup(createDTO: CreateGroupDTO): Promise<Result<
    void,
    AppError.ValueValidationError |
    AppError.ResourceNotFound |
    DuplicateChildrenError
  >> {
    const source = Source.create(createDTO.source)
      .mapErr(AppError.ValueValidationError.create);
    if(source.isErr()) { return err(source.error); }
    let group;
    const groupId = this.groupRepository.generateGroupId();
    if(has(createDTO, 'parentId')) {
      const parentId = GroupId.create(createDTO.parentId);
      const parent = await this.groupRepository.getByGroupId(parentId);
      if(!parent) { 
        return err(AppError.ResourceNotFound.create(createDTO.parentId, 'group')); 
      }
      group = parent.createChild(
        groupId, {
          source: source.value,
          name: createDTO.name,
          akaUnit: createDTO.akaUnit,
        }
      );
    } else {
      group = ok(Group.createRoot(
        groupId, {
          name: createDTO.name,
          source: source.value,
          akaUnit: createDTO.akaUnit
        }
      ));
    }
    if(group.isErr()) { return err(group.error); }
    await this.groupRepository.save(group.value);
    return ok(undefined);
  }

  async moveGroup(moveGroupDTO: MoveGroupDTO): Promise<Result<
    void,
    AppError.ResourceNotFound | 
    DuplicateChildrenError
  >> {
    const groupId = GroupId.create(moveGroupDTO.groupId);
    const parentId = GroupId.create(moveGroupDTO.parentId);
    const group = await this.groupRepository.getByGroupId(groupId);
    if(!group) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.groupId, 'group'));
    }
    const parent = await this.groupRepository.getByGroupId(parentId);
    if(!parent) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.parentId, 'parent group'));
    }
    const result = group.moveToParent(parent);
    if(result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }

  // TODO: update group (rename) and delete group
}