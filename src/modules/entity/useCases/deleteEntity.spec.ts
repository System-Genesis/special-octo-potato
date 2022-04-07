// import { DigitalIdentityRepository } from './../../digitalIdentity/repository/DigitalIdentityRepository';
// import 'jest-ts-auto-mock'
// import { createMock } from 'ts-auto-mock';
// import { EntityService } from './EntityService';
// import { RoleRepository } from '../../Role/repository/RoleRepository';
// import { EntityRepository } from '../repository/EntityRepository';

// describe('Delete entity', () => {
//   describe(`Given an entity id that exist`, () => {
//     describe(`When a client wants to delete an a entity`, () => {
//       test(`Then the entity should be deleted from repo`, async () => {

//         // Arrange
//         let mockEntitiesRepo = createMock<EntityRepository>();
//         let mockDisRepo = createMock<DigitalIdentityRepository>();

//         let entityService = new EntityService(
//             mockEntitiesRepo,
//             mockDisRepo,
//         );
//         let result = await entityService.deleteEntity("123");
//         // console.log('result: ', (result as any).value);
//         expect(mockEntitiesRepo.delete).toHaveBeenCalled();

//       });
//     });
//   });

// });
