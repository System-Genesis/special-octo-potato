import { Types } from 'mongoose';

import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';

import config from "config";
import { app } from '../../shared/infra/http/app';

const sources: string[] = config.get('valueObjects.source.values');
const es_name_source = sources[1]
const userDomains: string[] = config.get(
    "valueObjects.digitalIdentityId.domain.values"
  );

const roleDomains: string[] = config.get(
    "valueObjects.roleIdSuffixes.domain.values"
  );

const esDomain = userDomains[1];
const esRoleDomain = roleDomains[1];

beforeEach(async () => {
    try {
      await emptyDB();
    } catch (err) {
      console.log(err);
    }
  });
  
export const testCreateRole = () => {
    describe('ROLE CREATE USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });
    
        it('create a VALID role es_name', async () => {
            const esGroup = { name: es_name_source, source: es_name_source}
            const res = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            expect(Object.keys(res.body).length === 1)
            expect(res.body.id).toBeTruthy()
            const esId = res.body.id
            const esRole = {
                roleId: `roleId@${esRoleDomain}`,
                source: es_name_source,
                directGroup: esId,
                jobTitle: 'job title',
                clearance: '2',
            }
            const resCreateRole = await request(app).post(`/api/roles`).send(esRole).expect(200)
            const foundRole = await findOneByQuery('roles', { roleId: esRole.roleId.toLowerCase()})
            expect(foundRole).toEqual(expect.objectContaining({
                roleId: esRole.roleId.toLowerCase(),
                source: es_name_source,
                directGroup: Types.ObjectId(esRole.directGroup),
                jobTitle: esRole.jobTitle,
                clearance: esRole.clearance,
            }
            ))
        });
    
    
    });
}

