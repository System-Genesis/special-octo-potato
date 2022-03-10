
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
    
    
    });
}

