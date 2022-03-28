
// import { DigitalIdentityRepository } from './../../digitalIdentity/repository/DigitalIdentityRepository';
// import { EntityRepository } from '../repository/EntityRepository';
// import { EntityService } from './EntityService';
// import 'jest-ts-auto-mock'
// import { createMock } from 'ts-auto-mock';
// import { method, On } from 'ts-auto-mock/extension';

// describe('Create Entity', () => {
//   describe(`Given an entity that doesn't exist`, () => {
//     describe(`When a client wants to create an entity`, () => {
//       test(`Then the entity should be created and saved to repo`, async () => {

//         // Arrange
//         let mockEntitiesRepo = createMock<EntityRepository>();
//         let mockDIsRepo = createMock<DigitalIdentityRepository>();

//         const mockSaveMethod = On(mockEntitiesRepo).get(method(mock => mock.save));

//         let entityService = new EntityService(
//             mockEntitiesRepo,
//             mockDIsRepo,
//         );

//         let result = await entityService.createEntity({
//             "firstName": "noam",
//             "lastName": "s",
//             "entityType": "civilian",
//             "identityCard": "316127711",
//             "serviceType": "hov"
//         });

//         // console.log('result: ', (result as any).value);                  
//         expect(mockEntitiesRepo.save).toHaveBeenCalled();       
          
//       });
//     });
//   });
// });