
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';

import config from "config";
import { app } from '../../shared/infra/http/app';

const sources: string[] = config.get('valueObjects.source.values');
const es_name_source = sources[1]
const userDomains: string[] = config.get(
    "valueObjects.digitalIdentityId.domain.values"
  );
const esDomain = userDomains[1];

export const testCreateDI = () => {
    describe('DI CREATE USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });
    
        const esDI = {
            type: "domainUser",
            source: es_name_source,
            mail: `you@${esDomain}`,
            uniqueId: `uniqueId@${esDomain}`,
            isRoleAttachable: true
        }

        describe('DI FIELDS VALIDATION', () => {
            it('should return invalid uniqueId', async () => {
                const esDICopy = { ... esDI }
                esDICopy.uniqueId = 'aa@r.com'
                const res = await request(app).post(`/api/digitalIdentities`).send(esDICopy).expect(400)
                expect(res.body.message).toEqual(expect.stringContaining(`invalid digital identity unique id`))
            });
    
            it('should return invalid di type', async () => {
                const esDICopy = { ... esDI }
                esDICopy.type = 'DomainUser'
                const res = await request(app).post(`/api/digitalIdentities`).send(esDICopy).expect(400)
                expect(res.body.message).toEqual(expect.stringContaining(`is invalid Digital Identity type`))
            });
    
            it('should return invalid source', async () => {
                const esDICopy = { ... esDI }
                esDICopy.source = 'fakeSource'
                const res = await request(app).post(`/api/digitalIdentities`).send(esDICopy).expect(400)
                expect(res.body.message).toEqual(expect.stringContaining(`invalid source`))
            });
        
            it('should return invalid source', async () => {
                const esDICopy = { ... esDI }
                esDICopy.source = 'fakeSource'
                const res = await request(app).post(`/api/digitalIdentities`).send(esDICopy).expect(400)
                expect(res.body.message).toEqual(expect.stringContaining(`invalid source`))
            });
    
            it('should return invalid mail', async () => {
                const esDICopy = { ... esDI }
                esDICopy.mail = `you${esDomain}`
                const res = await request(app).post(`/api/digitalIdentities`).send(esDICopy).expect(400)
                expect(res.body.message).toEqual(expect.stringContaining(`invalid mail`))
            });
        })

        describe('Other Usecases', () => {
            it('create a VALID di es_name', async () => {
                const res = await request(app).post(`/api/digitalIdentities`).send(esDI).expect(200)
                const foundDI = await findOneByQuery('digitalidentities', { uniqueId: `uniqueid@${esDomain}`})
                expect(foundDI).toEqual(expect.objectContaining({
                type: "domainUser",
                source: es_name_source,
                mail: `you@${esDomain}`,
                uniqueId: `uniqueid@${esDomain}`,
                isRoleAttachable: true}
                ))
            });

            it('Shouldnt create di with already exists uniqueId', async () => {
                const res1 = await request(app).post(`/api/digitalIdentities`).send(esDI).expect(200)
                const res2 = await request(app).post(`/api/digitalIdentities`).send(esDI).expect(400)
                expect(res2.body.message).toEqual(expect.stringContaining(` already exists`))
            });

        })
            
    });
}

