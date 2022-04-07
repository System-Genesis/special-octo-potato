import { RoleIdSuffixError } from '../domain/errors/RoleIdSuffixError';
import { RoleAlreadyExists } from './../domain/errors/RoleAlreadyExists';
import { RoleRepository } from '../repository/RoleRepository';
import { GroupRepository } from '../../group/repository/GroupRepository';
import { CreateRoleDTO } from './dtos/CreateRoleDTO';
import { RoleId } from '../domain/RoleId';
import { Source } from '../../digitalIdentity/domain/Source';
import { Result, err, ok } from 'neverthrow';
import { AppError } from '../../../core/logic/AppError';
import { GroupId } from '../../group/domain/GroupId';
import { ConnectDigitalIdentityDTO } from './dtos/ConnectDigitalIdentityDTO';
import { DigitalIdentityRepository } from '../../digitalIdentity/repository/DigitalIdentityRepository';
import { DigitalIdentityId } from '../../digitalIdentity/domain/DigitalIdentityId';
import { UpdateRoleDTO } from './dtos/UpdateRoleDTO';
import { DigitalIdentity } from '../../digitalIdentity/domain/DigitalIdentity';
import { MoveGroupDTO } from './dtos/MoveGroupDTO';
import { DigitalIdentityCannotBeConnected } from '../domain/errors/DigitalIdentityCannotBeConnected';
import { AlreadyConnectedToDigitalIdentity } from '../domain/errors/AlreadyConnectedToDigitalIdentity';
import { BaseError } from '../../../core/logic/BaseError';
import { HasDigitalIdentityAttached } from '../domain/errors/HasDigitalIdentityAttached';
import { has } from '../../../utils/ObjectUtils';
import { Role } from '../domain/Role';
import { SourceMisMatchError } from './errors/SourceMisMatchError';

export class RoleService {
    constructor(private roleRepository: RoleRepository, private groupRepository: GroupRepository, private diRepository: DigitalIdentityRepository) {}

    /**
     * Create a new Role under a group
     * @param createRoleDTO
     */
    async createRole(
        createRoleDTO: CreateRoleDTO,
    ): Promise<Result<void, AppError.ValueValidationError | AppError.ResourceNotFound | AppError.RetryableConflictError>> {
        const roleIdRes = RoleId.create(createRoleDTO.roleId);
        if (roleIdRes.isErr()) {
            return err(RoleIdSuffixError.create(createRoleDTO.roleId));
        }
        const sourceOrError = Source.create(createRoleDTO.source).mapErr((msg) => AppError.ValueValidationError.create(msg));
        if (sourceOrError.isErr()) {
            return err(sourceOrError.error);
        }
        const doesExist = await this.roleRepository.exists(roleIdRes.value);
        if (doesExist) {
            return err(RoleAlreadyExists.create(createRoleDTO.roleId));
        }
        const groupId = GroupId.create(createRoleDTO.directGroup);
        const group = await this.groupRepository.exists(groupId);
        if (!group) {
            return err(AppError.ResourceNotFound.create(createRoleDTO.directGroup, 'group id'));
        }
        const role = Role.createRole(roleIdRes.value, groupId, {
            source: sourceOrError.value,
            jobTitle: createRoleDTO.jobTitle,
            clearance: createRoleDTO.clearance,
        });
        return (await this.roleRepository.save(role)).mapErr((err) => {
            return AppError.RetryableConflictError.create(err.message);
        });
    }

    /**
     * Connect Role to a Digital Identity
     * @param connectDTO
     */
    async connectDigitalIdentity(
        connectDTO: ConnectDigitalIdentityDTO,
    ): Promise<
        Result<
            void,
            | AppError.ValueValidationError
            | AppError.ResourceNotFound
            | AppError.RetryableConflictError
            | DigitalIdentityCannotBeConnected
            | AlreadyConnectedToDigitalIdentity
        >
    > {
        const roleIdRes = RoleId.create(connectDTO.roleId);
        if (roleIdRes.isErr()) {
            return err(RoleIdSuffixError.create(connectDTO.roleId));
        }
        const idOrError = DigitalIdentityId.create(connectDTO.digitalIdentityUniqueId).mapErr((msg) => AppError.ValueValidationError.create(msg));
        if (idOrError.isErr()) {
            // invalid DI unique id value provided
            return err(idOrError.error);
        }
        const role = await this.roleRepository.getByRoleId(roleIdRes.value);
        if (!role) {
            return err(AppError.ResourceNotFound.create(connectDTO.roleId, 'role id'));
        }
        const roleSource = role.source.value;
        const di = await this.diRepository.getByUniqueId(idOrError.value);
        if (!di) {
            return err(AppError.ResourceNotFound.create(connectDTO.digitalIdentityUniqueId, 'digitalIdentity UniqueId'));
        }
        const diSource = di.source.value;
        if (roleSource !== diSource) {
            return err(SourceMisMatchError.create(roleSource, diSource));
        }
        const res = role.connectDigitalIdentity(di);
        if (res.isErr()) {
            return err(res.error);
        }
        return (await this.roleRepository.save(role)).mapErr((err) => {
            return AppError.RetryableConflictError.create(err.message);
        });
    }

    /**
     * Disconnect a Role from a Digital Identity
     * @param disconnectDTO
     */
    async disconnectDigitalIdentity(
        disconnectDTO: ConnectDigitalIdentityDTO,
    ): Promise<Result<void, AppError.ResourceNotFound | AppError.ValueValidationError | AppError.RetryableConflictError>> {
        const roleIdRes = RoleId.create(disconnectDTO.roleId);
        if (roleIdRes.isErr()) {
            return err(RoleIdSuffixError.create(disconnectDTO.roleId));
        }
        const uidOrError = DigitalIdentityId.create(disconnectDTO.digitalIdentityUniqueId).mapErr((msg) => AppError.ValueValidationError.create(msg));
        if (uidOrError.isErr()) {
            // invalid DI unique id value provided
            return err(uidOrError.error);
        }
        const role = await this.roleRepository.getByRoleId(roleIdRes.value);
        if (!role) {
            return err(AppError.ResourceNotFound.create(disconnectDTO.roleId, 'role'));
        }
        if (!role.digitalIdentityUniqueId?.equals(uidOrError.value)) {
            return err(
                AppError.ValueValidationError.create(
                    `provided digital identity id: ${uidOrError.value} does not match Role: ${disconnectDTO.roleId}`,
                ),
            );
            // TODO: better error type
        }
        role.disconnectDigitalIdentity();
        const saveRoleRes = (await this.roleRepository.save(role)).mapErr((err) => AppError.RetryableConflictError.create(err.message));
        return saveRoleRes;
    }

    /**
   * Update fields of a Role.

   * currently UpdateDTO = `{
     jobTitle: string
   }`
   * @param updateDTO 
   */
    async updateRole(updateDTO: UpdateRoleDTO): Promise<Result<void, AppError.ResourceNotFound | AppError.RetryableConflictError>> {
        const roleIdRes = RoleId.create(updateDTO.roleId);
        if (roleIdRes.isErr()) {
            return err(RoleIdSuffixError.create(updateDTO.roleId));
        }
        const role = await this.roleRepository.getByRoleId(roleIdRes.value);
        if (!role) {
            return err(AppError.ResourceNotFound.create(updateDTO.roleId, 'role id'));
        }
        if (has(updateDTO, 'clearance')) {
            role.updateClearnace(updateDTO.clearance);
        }
        if (has(updateDTO, 'jobTitle')) {
            role.updateJob(updateDTO.jobTitle);
        }
        return (await this.roleRepository.save(role)).mapErr((err) => AppError.RetryableConflictError.create(err.message));
    }

    /**
     * Move a Role to a new Group
     * @param moveGroupDTO
     */
    async moveToGroup(moveGroupDTO: MoveGroupDTO): Promise<Result<void, AppError.ResourceNotFound | AppError.RetryableConflictError>> {
        const roleIdRes = RoleId.create(moveGroupDTO.roleId);
        if (roleIdRes.isErr()) {
            return err(RoleIdSuffixError.create(moveGroupDTO.roleId));
        }
        const groupId = GroupId.create(moveGroupDTO.groupId);
        const role = await this.roleRepository.getByRoleId(roleIdRes.value);
        if (!role) {
            return err(AppError.ResourceNotFound.create(moveGroupDTO.roleId, 'role'));
        }
        const roleSource = role.source.value;
        const group = await this.groupRepository.getByGroupId(groupId);
        if (!group) {
            return err(AppError.ResourceNotFound.create(moveGroupDTO.groupId, 'group'));
        }
        const groupSource = group.source.value;
        if (roleSource !== groupSource) {
            return err(SourceMisMatchError.create(roleSource, groupSource));
        }
        role.moveToGroup(group);
        return (await this.roleRepository.save(role)).mapErr((err) => AppError.RetryableConflictError.create(err.message));
    }

    async deleteRole(roleId: string): Promise<Result<any, BaseError>> {
        const roleIdRes = RoleId.create(roleId);
        if (roleIdRes.isErr()) {
            return err(RoleIdSuffixError.create(roleId));
        }
        const role = await this.roleRepository.getByRoleId(roleIdRes.value);
        if (!role) {
            return err(AppError.ResourceNotFound.create(roleId, 'role'));
        }
        if (role?.digitalIdentityUniqueId != null) {
            return err(HasDigitalIdentityAttached.create(roleId));
        }
        return (await this.roleRepository.delete(roleIdRes.value)).mapErr((err) => AppError.RetryableConflictError.create(err.message));
    }
}
