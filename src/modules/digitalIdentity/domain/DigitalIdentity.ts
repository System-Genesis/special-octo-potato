import config from 'config';
import { CannotConnectAlreadyConnected } from './errors/CannotConnectAlreadyConnected ';
import { CannotDisconnectUnconnected } from './errors/CannotDisconnectUnconnected';
import { AggregateRoot, CreateOpts } from '../../../core/domain/AggregateRoot';
import { DigitalIdentityId } from './DigitalIdentityId';
import { EntityId } from '../../entity/domain/EntityId';
import { Entity } from '../../entity/domain/Entity';
import { Result, err, ok, Err, Ok } from 'neverthrow';
import { CannotConnectRoleError } from './errors/CannotConnectRoleError';
import { Mail } from './Mail';
import { Source } from './Source';
import { isFromArray } from '../../../utils/isSomeValues';

export type digitalIdentityType = {
  DomainUser: string;
  VirtualUser: string;
};

export const DigitalIdentityTypes: digitalIdentityType = config.get('valueObjects.digitalIdentityType');

const isDiType = isFromArray(Object.values(DigitalIdentityTypes));

export const castToDigitalIdentityType = (val: string): Result<string, string> => {
  if (isDiType(val)) {
    return ok(val);
  }
  return err(`${val} is invalid Digital Identity type`);
};

export interface DigitalIdentityState {
  type: string;
  source: Source;
  mail?: Mail; // use value Object
  entityId?: EntityId;
  canConnectRole?: boolean;
  upn?: string;
}

export interface DigitalIdentityRepresent {
  source: Source;
  uniqueId: DigitalIdentityId;
}

export class DigitalIdentity extends AggregateRoot {
  private _type: string;
  private _mail?: Mail;
  private _source: Source;
  private _canConnectRole: boolean;
  private _entityId?: EntityId;
  private _upn?: string;

  private constructor(id: DigitalIdentityId, props: DigitalIdentityState, opts: CreateOpts) {
    super(id, opts);
    this._type = props.type;
    this._source = props.source;
    this._mail = props.mail;
    this._entityId = props.entityId;
    this._canConnectRole =
      props.canConnectRole !== undefined
        ? // if given in props - use it
          props.canConnectRole
        : // else default to true if it is a domainUser type
          this._type === DigitalIdentityTypes.DomainUser;
  }

  disableRoleConnectable() {
    this._canConnectRole = false;
    this.markModified();
  }

  updateMail(mail: Mail) {
    this._mail = mail;
    this.markModified();
  }

  connectToEntity(entity: Entity, upn?: string): Err<unknown, CannotConnectAlreadyConnected> | Ok<undefined, unknown> {
    if (this._entityId) {
      return err(CannotConnectAlreadyConnected.create(this.uniqueId.toString()));
    }
    this._entityId = entity.entityId;
    // TODO: perhaps required upn error should be here with source validation?
    if (upn) {
      this._upn = upn;
    }
    this.markModified();
    return ok(undefined);
  }

  disconnectEntity(): Err<unknown, CannotDisconnectUnconnected> | Ok<undefined, unknown> {
    // if (this.type === DigitalIdentityType.Kaki) {
    //   return; // TODO: is error?
    // }
    if (!this._entityId) {
      return err(CannotDisconnectUnconnected.create(this.uniqueId.toString()));
    }
    this._entityId = undefined;
    this._upn = undefined;
    this.markModified();
    return ok(undefined);
  }

  static create(
    id: DigitalIdentityId,
    state: DigitalIdentityState,
    opts: CreateOpts
  ): Result<DigitalIdentity, CannotConnectRoleError> {
    if (state.type === DigitalIdentityTypes.VirtualUser && state.canConnectRole) {
      return err(CannotConnectRoleError.create(id.toString())); //error
    }
    // TODO:
    return ok(new DigitalIdentity(id, state, opts));
  }

  // static createDomainUser(uniqueId: DigitalIdentityId, props: Omit<DigitalIdentityState, 'type'>) {
  //   return DigitalIdentity._create(
  //     uniqueId,
  //     { ...props, type: DigitalIdentityType.DomainUser },
  //     { isNew: true },
  //   );
  // }

  // maybe need an Entity to create a 'kaki' DI
  // static createKaki(
  //   uniqueId: DigitalIdentityId,
  //   connectedEntity: Entity,
  //   props: Omit<DigitalIdentityState, 'type' | 'canConnectRole' | 'entityId'>
  // ) {
  //   return DigitalIdentity._create(
  //     uniqueId,
  //     {
  //       ...props,
  //       entityId: connectedEntity.entityId,
  //       type: DigitalIdentityType.Kaki,
  //     },
  //     { isNew: true },
  //   )
  // }

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
    return DigitalIdentityId.create(this.id.toString())._unsafeUnwrap();
  }
  get connectedEntityId() {
    return this._entityId;
  }

  get upn() {
    return this._upn;
  }


  get connectedDigitalIdentity(): DigitalIdentityRepresent {
    return {
      source: this._source,
      uniqueId: this.uniqueId,
    };
  }
}
