import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { GroupId } from "./GroupId";
import { RoleId } from "../../Role/domain/RoleId";
import { RoleState, Role } from "../../Role/domain/Role";
import { Result, err, ok } from "neverthrow";
import { DuplicateChildrenError } from "./errors/DuplicateChildrenError";
import { IGroup } from "./IGroup";
import { Source } from "../../digitalIdentity/domain/Source";
import { TreeCycleError } from "./errors/TreeCycleError";
import { AppError } from "../../../core/logic/AppError";
import { has } from "../../../utils/ObjectUtils";

type CreateGroupProps = {
  name: string;
  source: Source;
  akaUnit?: string;
  diPrefix?: string;

}

type ChildGroupProps = CreateGroupProps & {
  parent: Group;
}

interface GroupState {
  name: string;
  source: Source;
  akaUnit?: string;
  // hierarchy?: Hierarchy;
  ancestors?: GroupId[];
  status?: string;
  diPrefix?: string;
  isLeaf?: boolean;
  childrenNames?: Set<string>;

}


type UpdateDto = Partial<Omit<GroupState, "childrenNames" | "ancestors" | "source">>;
export type UpdateResult = Result<
  void,
  | AppError.CannotUpdateFieldError
>;
export class Group
  extends AggregateRoot
  implements IGroup {

  private _name: string;
  private _akaUnit?: string; // maybe value object
  private _status: string; // maybe value object
  private _ancestors: GroupId[];
  // private _hierarchy: Hierarchy;
  private _isLeaf: boolean;
  private _source: Source;
  private _diPrefix?: string;
  private _childrenNames: Set<string>;

  private constructor(id: GroupId, state: GroupState, opts: CreateOpts) {
    super(id, opts);
    this._name = state.name;
    this._akaUnit = state.akaUnit;
    this._source = state.source;
    this._status = state.status || 'active';
    this._diPrefix = state.diPrefix;
    this._isLeaf = state.isLeaf || true;
    // this._hierarchy = state.hierarchy || Hierarchy.create('');
    this._ancestors = state.ancestors || [];
    this._childrenNames = state.childrenNames || new Set();
  }
  public updateDetails(updateDto: UpdateDto): UpdateResult {

    if (
      has(updateDto, "name")
    ) {
      this._name = updateDto.name
    }

    if (
      has(updateDto, "diPrefix")
    ) {
      this._diPrefix = updateDto.diPrefix
    }

    this.markModified();
    return ok(undefined);
  }



  public moveToParent(parent: Group): Result<void, DuplicateChildrenError | TreeCycleError> {
    if (parent._childrenNames.has(this._name)) {
      return err(DuplicateChildrenError.create(this._name, parent.name));
    }
    // check for cycles: if 'parent' is actually a decendant of this group
    if (!!parent.ancestors.find(ancestorId => ancestorId.equals(this.id))) {
      return err(TreeCycleError.create(this.name, parent.name));
    }
    const previousParentId = this.parentId;
    this._ancestors = [parent.id, ...parent._ancestors];
    // this._hierarchy = createChildHierarchy(parent);
    this.markModified();
    return ok(undefined);
  }

  // public addChild(child: IGroup): Result<void, DuplicateChildrenError> {
  //   if(this._childrenNames.has(child.name)) {
  //     return err(DuplicateChildrenError.create(child.name, this.name));
  //   }
  //   this._childrenNames.add(child.name);
  //   return ok(undefined);
  // }

  // public removeChild(child: IGroup) {
  //   this._childrenNames.delete(child.name);
  // }

  get groupId(): GroupId {
    return GroupId.create(this.id.toValue());
  }
  get name() {
    return this._name;
  }
  get isLeaf() {
    return this._isLeaf;
  }
  // get hierarchy() {
  //   return this._hierarchy.value();
  // }
  get ancestors() {
    return [...this._ancestors]
  }
  get parentId() {
    return this._ancestors.length > 0 ?
      this._ancestors[0] : undefined;
  }
  get akaUnit() {
    return this._akaUnit;
  }
  get status() {
    return this._status;
  }
  get source() {
    return this._source;
  }
  get childrenNames() {
    return Array.from(this._childrenNames);
  }
  get diPrefix() {
    return this._diPrefix
  }

  public createChild(groupId: GroupId, props: CreateGroupProps): Result<Group, DuplicateChildrenError> {
    if (this._childrenNames.has(props.name)) {
      return err(DuplicateChildrenError.create(props.name, this.name));
    }
    const child = Group._create(
      groupId,
      {
        name: props.name,
        akaUnit: props.akaUnit,
        source: props.source,
        diPrefix: props.diPrefix,
      },
      { isNew: true }
    );
    this._isLeaf = false;
    child.moveToParent(this);
    return ok(child);
  }

  // TODO: what best practice here?
  public deleteChild() {
    if (this._childrenNames.values.length === 1) {
      this._isLeaf = true;
    }
  }

  public createRole(roleId: RoleId, props: Omit<RoleState, 'directGroup' | 'digitalIdentityUniqueId'>) {
    return Role.createNew(
      roleId,
      {
        ...props,
        directGroup: this.groupId,
      }
    );
  }

  static createRoot(groupId: GroupId, props: CreateGroupProps) {
    return Group._create(groupId, props, { isNew: true })
  }

  static _create(groupId: GroupId, state: GroupState, opts: CreateOpts): Group {
    // validate hierarchy & ancestors
    return new Group(groupId, state, opts);
  }
}

/*
 * helpers
 */

// const createChildHierarchy = (parent: IGroup) => Hierarchy.create(parent.hierarchy).concat(parent.name);