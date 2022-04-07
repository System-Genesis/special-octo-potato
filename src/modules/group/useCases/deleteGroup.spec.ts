import { DigitalIdentityRepository } from '../../digitalIdentity/repository/DigitalIdentityRepository';
import { GroupRepository } from '../repository/GroupRepository';
import 'jest-ts-auto-mock';
import { createMock } from 'ts-auto-mock';
import { GroupService } from './GroupService';
import { RoleRepository } from '../../Role/repository/RoleRepository';

describe('Delete Group', () => {
    describe(`Given an group id that exist`, () => {
        describe(`When a client wants to delete an a role`, () => {
            test(`Then the group should be deleted from repo`, async () => {
                // Arrange
                let mockRolesRepo = createMock<RoleRepository>();
                let mockGroupsRepo = createMock<GroupRepository>();

                let groupService = new GroupService(mockGroupsRepo, mockRolesRepo);
                let result = await groupService.deleteGroup('123');
                // console.log('result: ', (result as any).value);
                expect(mockGroupsRepo.delete).toHaveBeenCalled();
            });
        });
    });
});
