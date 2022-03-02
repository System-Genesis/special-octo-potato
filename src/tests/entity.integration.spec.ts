import { digitalIdentityService } from '../modules/digitalIdentity/useCases/index';
import { PersonalNumber } from '../modules/entity/domain/PersonalNumber';
import { IdentityCard } from '../modules/entity/domain/IdentityCard';
import { emptyDB, findByQuery, findOneByQuery } from '../tests/setup/seedUtils';
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-mutable-exports */
import request from 'supertest';
import * as http from 'http';
import {app} from '../shared/infra/http/app'
import {startApp} from '../index';

let server: http.Server;
beforeAll(async () => {

    try {
        server = await startApp;
        await emptyDB()
    } catch (err) {}

    
});
afterAll(async () => {
    await server.close();
});


const entity = {
    firstName: "no",
    lastName: "s",
    entityType: "soldier",
    personalNumber: "6536548",
    serviceType: "hov"
}

describe('POST Entity ', () => {
    it('create a VALID entity ', (done) => {
        request(app)
            .post(`/api/entities`)
            .send(
                entity
            )
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw done(err);
                }
                expect(Object.keys(res.body).length === 1)
                expect(res.body.id).toBeTruthy()
                const foundEntity = await findOneByQuery('entities', { personalNumber: "6536548"})
                expect(foundEntity.firstName).toBe('no')
                return done();
            });
    });
});

describe('PATCH entity ', () => {
    it('update exists entity firstName and identityCard', async () => {
        let foundEntity = await findOneByQuery('entities', { personalNumber: "6536548"})
        let updateFields = { 
            firstName: "no2",
            identityCard: "234567899"
        }
        // console.log(foundEntity._id.toString())
        request(app)
            .patch(`/api/entities/`+foundEntity._id.toString())
            .send(
                updateFields
            )
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw (err);
                }
                
                expect(Object.keys(res.body).length === 1)
                expect(res.body.id).toBeTruthy()
                const foundEntity = await findOneByQuery('entities', { personalNumber: "6536548"})
                expect(foundEntity.firstName).toBe('no2')
                expect(foundEntity.identityCard).toBe('253658342')
                
            });
        
    });
});

const digitalIdentity = {
    type: "domainUser",
    source: "es_name",
    mail: "barakkk@leonardo.com",
    uniqueId: "barakkk@leonardo.com",
    isRoleAttachable: true
}

describe('PUT connections Digital identity, entity  ', () => {
    beforeEach(async () => {
        const di = await digitalIdentityService.createDigitalIdentity(digitalIdentity);
        console.log(di)
      });
    it('connect the DI to the entity', async () => {
        const foundDI = await findOneByQuery('digitalidentities', { uniqueId: "uniqueid@sirutim.com"})
        const diUniqueId = foundDI.uniqueId;
        const foundEntity = await findOneByQuery('entities', { personalNumber: "6536548"})
        const entityId = foundEntity._id.toString();
        request(app)
            .put(`/api/entities/${entityId}/digitalIdentity/${diUniqueId}`)
            .expect(200)
            .end(async (err :any, res : any) => {
                // if (err) {
                    
                //     throw done(err);
                // }
                const foundDI = await findOneByQuery('digitalidentities', { uniqueId: "uniqueid@sirutim.com"})
                expect(foundDI.entityId.toString()).toBe(entityId)
            });
    });

});

describe('DELETE entity ', () => {
    it('delete exists entity ', async () => {
        let foundEntity = await findOneByQuery('entities', { personalNumber: "6536548"})
        // console.log(foundEntity._id.toString())
        request(app)
            .delete(`/api/entities/`+foundEntity._id.toString())
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw (err);
                }
                
                const foundEntity = await findOneByQuery('entities', { personalNumber: "6536548"})
                expect(foundEntity).toBe(null)
                
            });
        
    });
});
