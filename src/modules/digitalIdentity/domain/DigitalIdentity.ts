import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { DigitalIdentityId } from "./DigitalIdentityId";
import { RoleId } from "../../Role/domain/RoleId";
import { EntityId } from "../../entity/domain/EntityId";
import { Entity } from "../../entity/domain/Entity";

export enum DigitalIdentityType {
  DomainUser = 'domainUser',
  Kaki = 'kaki'
}

interface DigitalIdentityProps {
  type: DigitalIdentityType;
  source: string; // enum?
  mail: string; // use value Object
  entityId?: EntityId
  canConnectRole?: boolean;
}

export class DigitalIdentity extends AggregateRoot {

  private _type: DigitalIdentityType;
  private _mail: string;
  private _source: string;
  private _canConnectRole: boolean;
  private _entityId?: EntityId; 

  private constructor(id: DigitalIdentityId, props: DigitalIdentityProps) {
    super(id);
    this._type = props.type;
    this._source = props.source;
    this._mail = props.mail;
    this._canConnectRole = props.canConnectRole !== undefined ? props.canConnectRole 
      : this._type === DigitalIdentityType.DomainUser ? true : false;
    this._entityId = props.entityId;
  }

  disableRoleConnectable() {
    this._canConnectRole = false;
  }

  connectToEntity(entity: Entity) {
    this._entityId = entity.entityId
  }

  disconnectEntity() {
    if (this.type === DigitalIdentityType.Kaki) {
      return; //error??
    }
    this._entityId = undefined;
  }

  static create(id: DigitalIdentityId, props: DigitalIdentityProps) {
    if (props.type === DigitalIdentityType.Kaki && props.canConnectRole) {
      return; //error
    }
    return new DigitalIdentity(id, props);
  }

  get type() {
    return this._type;
  }
  get source() {
    return this._source;
  }
  get mail() {
    return this._mail;
  }
  get canConnectRole() {
    return this._canConnectRole;
  }
  get uniqueId() {
    return DigitalIdentityId.create(this.id.toValue());
  }
  get connectedEntityId() {
    return this._entityId;
  }

}