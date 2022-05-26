
import { DigitalIdentityRepository } from './../../digitalIdentity/repository/DigitalIdentityRepository';
import { RoleRepository } from '../repository/RoleRepository';
import { RoleService } from './RoleService';
import 'jest-ts-auto-mock'
import { createMock } from 'ts-auto-mock';
import { GroupRepository } from '../../group/repository/GroupRepository';

describe('Delete Role', () => {
  describe(`Given an role id that exist`, () => {
    describe(`When a client wants to delete an a role`, () => {
      test(`Then the role should be deleted from repo`, async () => {

        // Arrange
        let mockRolesRepo = createMock<RoleRepository>();
        let mockGroupsRepo = createMock<GroupRepository>();
        let mockDIsRepo = createMock<DigitalIdentityRepository>();

        let roleService = new RoleService(
            mockRolesRepo,
            mockGroupsRepo,
            mockDIsRepo,
        );

        let result = await roleService.deleteRole("123");

        // console.log('result: ', (result as any).value);                  
        expect(mockRolesRepo.delete).toHaveBeenCalled();       
          
      });
    });
  });

});