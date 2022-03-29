import { Source } from "./../domain/Source";
import { Repository } from "../../../core/infra/Repository";
import { DigitalIdentity } from "../domain/DigitalIdentity";
import { DigitalIdentityId } from "../domain/DigitalIdentityId";
import { EntityId } from "../../entity/domain/EntityId";
import { Mail } from "../domain/Mail";
import { Result } from "neverthrow";
import { AggregateVersionError } from "../../../core/infra/AggregateVersionError";
import { BaseError } from "../../../core/logic/BaseError";
import { MongooseError } from "../../../shared/infra/mongoose/errors/MongooseError";

export interface DigitalIdentityRepository extends Repository<DigitalIdentity> {
  create(
    digitalIdentity: DigitalIdentity
  ): Promise<Result<void, AggregateVersionError>>;
  update(
    digitalIdentity: DigitalIdentity
  ): Promise<Result<void, AggregateVersionError>>;
  getByUniqueId(uniqueId: DigitalIdentityId): Promise<DigitalIdentity | null>;
  getByEntityId(entityId: EntityId): Promise<DigitalIdentity[]>;
  existsInSource(
    identifier: Mail | DigitalIdentityId,
    source: Source
  ): Promise<boolean>;
  exists(identifier: Mail | DigitalIdentityId): Promise<boolean>;
  delete(id: DigitalIdentityId): Promise<Result<any, BaseError>>;
}
