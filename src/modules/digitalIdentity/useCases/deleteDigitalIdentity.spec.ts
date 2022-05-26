
import { DigitalIdentityRepository } from './../../digitalIdentity/repository/DigitalIdentityRepository';
import 'jest-ts-auto-mock'
import { createMock } from 'ts-auto-mock';
import { DigitalIdentityService } from './DigitalIdentityService';
import { RoleRepository } from '../../Role/repository/RoleRepository';
import { DigitalIdentityFormatError } from './errors/DigitalIdentityFormatError';
import { err } from 'neverthrow';

describe('Delete digital identity', () => {
  describe(`Given an digital id that exist`, () => {
    describe(`When a client wants to delete an a digital identity`, () => {
      test(`Then the digital identity should be deleted from repo`, async () => {

        // Arrange
        
        let mockDIsRepo = createMock<DigitalIdentityRepository>();
        let mockRolesRepo = createMock<RoleRepository>();

        let diService = new DigitalIdentityService(
            mockDIsRepo,
            mockRolesRepo,
        );
        let result = await diService.deleteDigitalIdentity("tommy@sirutim.com");
        // console.log('result: ', (result as any).value);                  
        expect(mockDIsRepo.delete).toHaveBeenCalled();       
          
      });
    });
  });
  describe(`Give an not valid digital id`, () => {
    test(`Then the digital identity should NOT be deleted and throw DigitalIdentityFormatError from repo`, async () => {

        // Arrange
        
        let mockDIsRepo = createMock<DigitalIdentityRepository>();
        let mockRolesRepo = createMock<RoleRepository>();

        let diService = new DigitalIdentityService(
            mockDIsRepo,
            mockRolesRepo,
        );
        let result = await diService.deleteDigitalIdentity("tommy.com");
                
        expect(result).toEqual(err(DigitalIdentityFormatError.create("tommy.com")))     
          
      });
  });

});