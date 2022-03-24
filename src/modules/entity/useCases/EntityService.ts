import { InvalidOrganizationValue } from './errors/InvalidOrganizationValue';
import { MissingOrganizationEmployee } from './errors/MissingOrganizationEmployee';
import { Organization } from './../domain/Organization';
import { EmployeeNumberAlreadyExists } from './errors/EmployeeNumberAlreadyExists';
import { EmployeeNumber } from '../domain/EmployeeNumber';
import { connect } from './../../../shared/infra/mongoose/connection';
import config from 'config';
import { IdentityCard } from './../domain/IdentityCard';
import { entityRepository } from './../repository/index';
import { EntityRepository } from '../repository/EntityRepository';
import { CreateEntityDTO } from './dtos/CreateEntityDTO';
import { Entity, castToEntityType, castToSex } from '../domain/Entity';
import { PersonalNumber } from '../domain/PersonalNumber';
import { combine, err, Result, ok } from 'neverthrow';
import { EntityId } from '../domain/EntityId';
import { UpdateResult } from '../domain/Entity';
import { ServiceType } from '../domain/ServiceType';
import { Rank } from '../domain/Rank';
import { DigitalIdentityId } from '../../digitalIdentity/domain/DigitalIdentityId';
import { Phone, MobilePhone } from '../domain/phone';
import { UniqueArray } from '../../../utils/UniqueArray';
import { filterNullOrUndefined, toArray } from '../../../utils/arrayUtils';
import { extractNullKeys, has } from '../../../utils/ObjectUtils';
import { AppError } from '../../../core/logic/AppError';
import { IllegalEntityStateError } from '../domain/errors/IllegalEntityStateError';
import { DigitalIdentityRepository } from '../../digitalIdentity/repository/DigitalIdentityRepository';
import { ConnectDigitalIdentityDTO } from './dtos/ConnectDigitalIdentityDTO';
import { UpdateEntityDTO } from './dtos/UpdateEntityDTO';
import { CannotChangeEntityTypeError } from '../domain/errors/CannotChangeEntityTypeError';
import { GoalUserIdAlreadyExistsError } from './errors/GoalUserIdAlreadyExistsError';
import { IdentityCardAlreadyExistsError } from './errors/IdentityCardAlreadyExistsError';
import { PersonalNumberAlreadyExistsError } from './errors/PersonalNumberAlreadyExistsError';
import { EntityIsNotConnectedError } from './errors/EntityIsNotConnectedError';
import { EntityResultDTO, entityToDTO } from './dtos/EntityResultDTO';
import { HasDigitalIdentityAttached } from './errors/HasDigitalIdentityAttached';
import { BaseError } from '../../../core/logic/BaseError';

export class EntityService {
  constructor(private entityRepository: EntityRepository, private diRepository: DigitalIdentityRepository) { }

  async createEntity(
    createEntityDTO: CreateEntityDTO
  ): Promise<
    Result<
      EntityResultDTO,
      | AppError.ValueValidationError
      | IllegalEntityStateError
      | IdentityCardAlreadyExistsError
      | PersonalNumberAlreadyExistsError
      | GoalUserIdAlreadyExistsError
      | AppError.RetryableConflictError
    >
  > {
    let personalNumber, identityCard, employeeNumber, organization, serviceType, rank, goalUserId, phone, mobilePhone, sex, profilePicture;
    // check entity type
    const entityType = castToEntityType(createEntityDTO.entityType).mapErr(AppError.ValueValidationError.create);
    if (entityType.isErr()) {
      return err(entityType.error);
    }
    // extract all identifiers and check for duplicates for each one:
    if (has(createEntityDTO, 'personalNumber')) {
      personalNumber = PersonalNumber.create(createEntityDTO.personalNumber).mapErr(
        AppError.ValueValidationError.create
      );
      if (personalNumber.isErr()) {
        return err(personalNumber.error);
      }
      if (await this.entityRepository.exists(personalNumber.value)) {
        return err(PersonalNumberAlreadyExistsError.create(createEntityDTO.personalNumber));
      }
    }
    if (has(createEntityDTO, 'identityCard')) {
      identityCard = IdentityCard.create(createEntityDTO.identityCard).mapErr(AppError.ValueValidationError.create);
      if (identityCard.isErr()) {
        return err(identityCard.error);
      }
      if (await this.entityRepository.exists(identityCard.value)) {
        return err(IdentityCardAlreadyExistsError.create(createEntityDTO.identityCard));
      }
    }
    if (has(createEntityDTO, 'goalUserId')) {
      goalUserId = DigitalIdentityId.create(createEntityDTO.goalUserId).mapErr(AppError.ValueValidationError.create);
      if (goalUserId.isErr()) {
        return err(goalUserId.error);
      }
      if (await this.entityRepository.exists(goalUserId.value)) {
        return err(GoalUserIdAlreadyExistsError.create(createEntityDTO.goalUserId));
      }
    }
    if (has(createEntityDTO, 'employeeNumber')) {
      if (!has(createEntityDTO, 'organization')) {
        return err(MissingOrganizationEmployee.create());
      }
      organization = Organization.create(createEntityDTO.organization)
      if (organization.isErr()) {
        return err(InvalidOrganizationValue.create(createEntityDTO.organization));
      }
      employeeNumber = EmployeeNumber.create(createEntityDTO.employeeNumber).mapErr(AppError.ValueValidationError.create);
      if (employeeNumber.isErr()) {
        return err(employeeNumber.error);
      }
      if (await this.entityRepository.exists(employeeNumber.value, organization.value)) {
        return err(EmployeeNumberAlreadyExists.create(createEntityDTO.employeeNumber, createEntityDTO.organization));
      }
    }
    // extract all other existing fields
    if (has(createEntityDTO, 'serviceType')) {
      serviceType = ServiceType.create(createEntityDTO.serviceType).mapErr(AppError.ValueValidationError.create);
      if (serviceType.isErr()) {
        return err(serviceType.error);
      }
    }
    if (has(createEntityDTO, 'rank')) {
      rank = Rank.create(createEntityDTO.rank).mapErr(AppError.ValueValidationError.create);
      if (rank.isErr()) {
        return err(rank.error);
      }
    }
    if (has(createEntityDTO, 'sex')) {
      sex = castToSex(createEntityDTO.sex).mapErr(AppError.ValueValidationError.create);
      if (sex.isErr()) {
        return err(sex.error);
      }
    }
    if (has(createEntityDTO, 'phone')) {
      phone = combine(toArray(createEntityDTO.phone).map(Phone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (phone.isErr()) {
        return err(phone.error);
      }
    }
    if (has(createEntityDTO, 'mobilePhone')) {
      mobilePhone = combine(toArray(createEntityDTO.mobilePhone).map(MobilePhone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (mobilePhone.isErr()) {
        return err(mobilePhone.error);
      }
    }
    
    if (has(createEntityDTO, 'pictures') && has(createEntityDTO.pictures, 'profile')) {
      const {
        meta: { updatedAt, format, path },
      } = createEntityDTO.pictures.profile;
      profilePicture = {
        meta: {
          path,
          format,
          updatedAt,
        }
      };
    }
    const entityOrError = Entity.createNew(this.entityRepository.generateEntityId(), {
      entityType: entityType.value,
      firstName: createEntityDTO.firstName,
      lastName: createEntityDTO.lastName,
      dischargeDay: createEntityDTO.dischargeDay,
      clearance: createEntityDTO.clearance,
      birthDate: createEntityDTO.birthDate,
      address: createEntityDTO.address,
      akaUnit: createEntityDTO.akaUnit,
      personalNumber: personalNumber?.value,
      identityCard: identityCard?.value,
      employeeNumber: employeeNumber?.value,
      goalUserId: goalUserId?.value,
      organization: organization?.value,
      rank: rank?.value,
      serviceType: serviceType?.value,
      sex: sex?.value,
      mobilePhone: mobilePhone?.value,
      phone: phone?.value,
      pictures: {
        profile: profilePicture
      },
    });
    if (entityOrError.isErr()) {
      return err(entityOrError.error);
    }
    let val = (await this.entityRepository.save(entityOrError.value))
      .map(() => entityToDTO(entityOrError.value))
      .mapErr((err) => AppError.RetryableConflictError.create(err.message));
    return val;
  }

  async connectDigitalIdentity(
    connectDTO: ConnectDigitalIdentityDTO
  ): Promise<
    Result<void, AppError.ValueValidationError | AppError.ResourceNotFound | AppError.RetryableConflictError>
  > {
    const entityId = EntityId.create(connectDTO.id);
    const uidOrError = DigitalIdentityId.create(connectDTO.uniqueId).mapErr(AppError.ValueValidationError.create);
    if (uidOrError.isErr()) {
      return err(uidOrError.error);
    }
    // get the objects from Repo
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(AppError.ResourceNotFound.create(connectDTO.id, 'entity'));
    }
    const di = await this.diRepository.getByUniqueId(uidOrError.value);
    if (!di) {
      return err(AppError.ResourceNotFound.create(connectDTO.uniqueId, 'digital identity'));
    }
    // check if source ads require for upn
    if (di.source.isUpnSource() && !has(connectDTO, 'upn') ) {
      return err(AppError.ValueValidationError.create('digital identity must have upn in order to be connected'));
    }
    // connect the entity to the digital identity
    const res = di.connectToEntity(entity, connectDTO.upn);

    if (res.isErr()) {
      return err(AppError.LogicError.create(res.error.message));;
    }


    const saveDiRes = (await this.diRepository.save(di)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    if (saveDiRes.isErr()) return saveDiRes;
    const connectedDIs = (await this.diRepository.getByEntityId(entityId)).map((di) => di.connectedDigitalIdentity);
    entity.choosePrimaryDigitalIdentity(connectedDIs);
    const saveEntityRes = (await this.entityRepository.save(entity)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    return saveEntityRes;
  }

  async disconnectDigitalIdentity(
    disconnectDTO: ConnectDigitalIdentityDTO
  ): Promise<
    Result<
      void,
      | AppError.ValueValidationError
      | AppError.ResourceNotFound
      | EntityIsNotConnectedError
      | AppError.RetryableConflictError
    >
  > {
    const entityId = EntityId.create(disconnectDTO.id);
    const uidOrError = DigitalIdentityId.create(disconnectDTO.uniqueId).mapErr(AppError.ValueValidationError.create);
    if (uidOrError.isErr()) {
      return err(uidOrError.error);
    }
    // get digital identity from Repo
    // get the objects from Repo
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(AppError.ResourceNotFound.create(disconnectDTO.id, 'entity'));
    }
    const di = await this.diRepository.getByUniqueId(uidOrError.value);
    if (!di) {
      return err(AppError.ResourceNotFound.create(disconnectDTO.uniqueId, 'digital identity'));
    }
    if (!di.connectedEntityId?.equals(entityId)) {
      return err(EntityIsNotConnectedError.create(disconnectDTO.id, disconnectDTO.uniqueId));
    }
    // disconnect the digital identity to the entity
    // disconnect the entityy to the digital identity
    di.disconnectEntity();
    // TODO: do it in a better way already
    const saveDiRes = (await this.diRepository.save(di)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    if (saveDiRes.isErr()) return saveDiRes;

    const connectedDIs = (await this.diRepository.getByEntityId(entityId)).map((di) => di.connectedDigitalIdentity);
    entity.choosePrimaryDigitalIdentity(connectedDIs);
    const saveEntityRes = (await this.entityRepository.save(entity)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    return saveEntityRes;
  }

  /**
   *
   * @param updateDTO
   */
  async updateEntity(
    updateDTO: UpdateEntityDTO
  ): Promise<
    Result<
      EntityResultDTO,
      | AppError.ResourceNotFound
      | AppError.ValueValidationError
      | AppError.CannotUpdateFieldError
      | AppError.RetryableConflictError
      | CannotChangeEntityTypeError
      | IllegalEntityStateError
      | GoalUserIdAlreadyExistsError
      | IdentityCardAlreadyExistsError
      | PersonalNumberAlreadyExistsError
    >
  > {
    let changes: UpdateResult[] = [];
    const entityId = EntityId.create(updateDTO.entityId);
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(AppError.ResourceNotFound.create(updateDTO.entityId, 'entity'));
    }
    const { pictures, personalNumber, identityCard, goalUserId, serviceType, rank, sex, phone, mobilePhone, akaUnit, entityType, ...rest } = updateDTO;
    // for arrOfNulls
    // try to update entity for each existing field in the DTO
    if (personalNumber) {
      const newPersonalNumber = PersonalNumber.create(personalNumber).mapErr(AppError.ValueValidationError.create);
      if (newPersonalNumber.isErr()) {
        return err(newPersonalNumber.error);
      }
      if (!entity.personalNumber?.equals(newPersonalNumber.value)) {
        if (await this.entityRepository.exists(newPersonalNumber.value)) {
          return err(PersonalNumberAlreadyExistsError.create(newPersonalNumber.value.toString()));
        }
        changes.push(entity.updateDetails({ personalNumber: newPersonalNumber.value }));
      }
    }
    if (identityCard) {
      const newIdentityCard = IdentityCard.create(identityCard).mapErr(AppError.ValueValidationError.create);
      if (newIdentityCard.isErr()) {
        return err(newIdentityCard.error);
      }
      if (!entity.identityCard?.equals(newIdentityCard.value)) {
        if (await this.entityRepository.exists(newIdentityCard.value)) {
          return err(IdentityCardAlreadyExistsError.create(newIdentityCard.value.toString()));
        }
        changes.push(entity.updateDetails({ identityCard: newIdentityCard.value }));
      }
    }
    if (goalUserId) {
      const newGoalUserId = DigitalIdentityId.create(goalUserId).mapErr(AppError.ValueValidationError.create);
      if (newGoalUserId.isErr()) {
        return err(newGoalUserId.error);
      }
      if (!entity.goalUserId?.equals(newGoalUserId.value)) {
        if (await this.entityRepository.exists(newGoalUserId.value)) {
          return err(GoalUserIdAlreadyExistsError.create(newGoalUserId.value.toString()));
        }
        changes.push(entity.updateDetails({ goalUserId: newGoalUserId.value }));
      }
    }
    if (entityType) {
      const newEntityType = castToEntityType(entityType).mapErr(AppError.ValueValidationError.create);
      if (newEntityType.isErr()) {
        return err(newEntityType.error);
      }
      changes.push(entity.updateDetails({ entityType: newEntityType.value }));
    }
    if (serviceType) {
      const newServiceType = ServiceType.create(serviceType).mapErr(AppError.ValueValidationError.create);
      if (newServiceType.isOk()) {
        changes.push(entity.updateDetails({ serviceType: newServiceType.value }));
      } else {
        return err(newServiceType.error);
      }
    }
    if (rank) {
      const newRank = Rank.create(rank).mapErr(AppError.ValueValidationError.create);
      if (newRank.isOk()) {
        changes.push(entity.updateDetails({ rank: newRank.value }));
      } else {
        return err(newRank.error);
      }
    }

    if (sex) {
      const newSex = castToSex(sex).mapErr(AppError.ValueValidationError.create);
      if (newSex.isOk()) {
        changes.push(entity.updateDetails({ sex: newSex.value }));
      } else {
        return err(newSex.error);
      }
    }
    if (phone) {
      const newPhone = combine(toArray(phone).map(Phone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (newPhone.isOk()) {
        changes.push(entity.updateDetails({ phone: newPhone.value }));
      } else {
        return err(newPhone.error);
      }
    }
    if (mobilePhone) {
      const newMobilePhone = combine(toArray(mobilePhone).map(MobilePhone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (newMobilePhone.isOk()) {
        changes.push(entity.updateDetails({ mobilePhone: newMobilePhone.value }));
      } else {
        return err(newMobilePhone.error);
      }
    }

    if (akaUnit) {
      const newAkaUnit = akaUnit
      // Need to check new primary
      const connectedDIs = (await this.diRepository.getByEntityId(entityId)).map((di) => di.connectedDigitalIdentity);
      changes.push(entity.updateDetails({ akaUnit: newAkaUnit }));
      entity.choosePrimaryDigitalIdentity(connectedDIs);
    }

    if (pictures) {
      if (pictures.profile) {
        changes.push(entity.updateProfilePicture(pictures.profile));
      }
    }
    // update the rest fields that dont require value validation and delete fields requested
    const propsToDelete = extractNullKeys(updateDTO);
    changes.push(entity.updateDetails({... rest, ...propsToDelete}));

    // check that all entity update calls returned success result
    const result = combine(changes);
    if (result.isErr()) {
      return err(result.error);
    }
    // finally, save the entity
    return (await this.entityRepository.save(entity))
      .map(() => entityToDTO(entity)) // return DTO
      .mapErr((err) => AppError.RetryableConflictError.create(err.message)); // or Error
  }

  async deleteEntity(id: string): Promise<Result<any, BaseError>> {
    const entityId = EntityId.create(id);
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(AppError.ResourceNotFound.create(id, 'Entity'));
    }
    // TODO: check for condition in usecase instead of here
    // if(!!entity.connectedDIs && entity.connectedDIs.length != 0){
    //   return err(HasDigitalIdentityAttached.create(id));
    // }
    const digitalIdentities = await this.diRepository.getByEntityId(entityId); 
    if(digitalIdentities.length){
      return err(HasDigitalIdentityAttached.create(id));
    }
    // if(digitalIdentities.length !=0){
    //   return err(HasDigitalIdentityAttached.create(id));
    // }
    return (await this.entityRepository.delete(entityId)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
  }
}
