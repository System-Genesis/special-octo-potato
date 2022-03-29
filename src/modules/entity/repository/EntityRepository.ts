import { Organization } from "./../domain/Organization";
import { Repository } from "../../../core/infra/Repository";
import { Entity } from "../domain/Entity";
import { EntityId } from "../domain/EntityId";
import { IdentityCard } from "../domain/IdentityCard";
import { PersonalNumber } from "../domain/PersonalNumber";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Result } from "neverthrow";
import { AggregateVersionError } from "../../../core/infra/AggregateVersionError";
import { BaseError } from "../../../core/logic/BaseError";

export type IhaveEntityIdentifiers = Partial<{
  identityCard: IdentityCard;
  personalNumber: PersonalNumber;
  goalUserId: DigitalIdentityId;
}>;

export type EntityIdentifier =
  | IdentityCard
  | PersonalNumber
  | DigitalIdentityId;

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export interface EntityRepository extends Repository<Entity> {
  create(entity: Entity): Promise<Result<void, AggregateVersionError>>;
  update(entity: Entity): Promise<Result<void, AggregateVersionError>>;
  getByEntityId(enityId: EntityId): Promise<Entity | null>;
  generateEntityId(): EntityId;
  exists(
    identifier: EntityIdentifier,
    organization?: Organization
  ): Promise<boolean>;
  delete(id: EntityId): Promise<Result<any, BaseError>>;
}
