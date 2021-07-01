import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { GroupId } from "./GroupId";
import { Hierarchy } from "../../../shared/Hierarchy";
import { RoleId } from "../../Role/domain/RoleId";
import { RoleState, Role } from "../../Role/domain/Role";

type CreateGroupProps = {
  name: string;
  source: string;
  akaUnit?: string;
}

type ChildGroupProps = CreateGroupProps & {
  parent: Group;
}

interface GroupState {
  name: string;
  source: string; // todo: value object. 
  akaUnit?: string;
  hierarchy?: Hierarchy;
  ancestors?: GroupId[];
  status?: string;
}

export class Group extends AggregateRoot {

  private _name: string;
  private _akaUnit? : string; // maybe value object
  private _status: string; // maybe value object
  private _ancestors: GroupId[];
  private _hierarchy: Hierarchy;
  private _source: string;
  private _childrenCount = 0; // maybe a read model concern (isLeaf)

  private constructor(id: GroupId, state: GroupState) {
    super(id);
    this._name = state.name;
    this._akaUnit = state.akaUnit;
    this._source = state.source;
    this._status = state.status || 'active';
    this._hierarchy = state.hierarchy || Hierarchy.create('');
    this._ancestors = state.ancestors || [];
  }

  public moveToParent(parent: Group) {
    this._ancestors = [ parent.id, ...parent._ancestors ];
    this._hierarchy = createChildHierarchy(parent);
  }

  public addChild() {
    this._childrenCount++;
  }

  public removeChild() {
    this._childrenCount--;
  }

  get groupId(): GroupId {
    return GroupId.create(this.id.toValue());
  }
  get name() {
    return this._name;
  }
  get isLeaf() {
    return this._childrenCount === 0;
  }
  get hierarchy() {
    return this._hierarchy.value();
  }
  get ancestors() {
    return [...this._ancestors]
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
  
  public createChild(groupId: GroupId, props: CreateGroupProps) {
    const child = Group._create(
      groupId, 
      {
        name: props.name,
        akaUnit: props.akaUnit,
        source: props.source,
      },
      { isNew: true }
    );
    child.moveToParent(this);
    return child;
  }

  public createRole(roleId: RoleId, props: Omit<RoleState, 'hierarchyIds' | 'hierarchy'>) {
    return Role._create(
      roleId,
      {
        ...props,
        hierarchy: createChildHierarchy(this),
        hierarchyIds: this.ancestors,
      },
      { isNew: true }
    );
  }
  
  static createRoot(groupId: GroupId, props: CreateGroupProps) {
    return Group._create(groupId, props, { isNew: true })
  }

  static _create(groupId: GroupId, state: GroupState, opts: CreateOpts): Group {
    // validate hierarchy & ancestors
    return new Group(groupId, state);
  }
}

/***
 * helpers
 */

const createChildHierarchy = (parent: Group) => Hierarchy.create(parent.hierarchy).concat(parent.name);