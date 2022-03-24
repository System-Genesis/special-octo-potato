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

export const testConnectRole = () => {
    describe('ROLE CONNECT USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });
    
        it('Connect and disconnect role to es di', async () => {
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
            const esDI = {
                type: "domainUser",
                source: es_name_source,
                mail: `you@${esDomain}`,
                uniqueId: `uniqueId@${esDomain}`,
                isRoleAttachable: true
            }
            const resCreateRole = await request(app).post(`/api/roles`).send(esRole).expect(200)
            const resDI = await request(app).post(`/api/digitalIdentities`).send(esDI).expect(200)
            const foundDI = await findOneByQuery('digitalidentities', { uniqueId: `uniqueid@${esDomain}`})
            const resConnect = await request(app).put(`/api/roles/${esRole.roleId}/digitalIdentity/${esDI.uniqueId}`).send().expect(200)
            let foundRole = await findOneByQuery('roles', { roleId: esRole.roleId.toLowerCase()})
            const beforeCreatedAt = foundRole.createdAt;
            expect(foundRole).toEqual(expect.objectContaining({
                roleId: esRole.roleId.toLowerCase(),
                source: es_name_source,
                directGroup: Types.ObjectId(esRole.directGroup),
                jobTitle: esRole.jobTitle,
                clearance: esRole.clearance,
                digitalIdentityUniqueId: esDI.uniqueId.toLowerCase(),
            }))
            const resDisConnect = await request(app).delete(`/api/roles/${esRole.roleId}/digitalIdentity/${esDI.uniqueId}`).send().expect(200)
            foundRole = await findOneByQuery('roles', { roleId: esRole.roleId.toLowerCase()})
            const afterCreatedAt = foundRole.createdAt;
            expect(foundRole).toEqual(expect.objectContaining({
                roleId: esRole.roleId.toLowerCase(),
                source: es_name_source,
                directGroup: Types.ObjectId(esRole.directGroup),
                jobTitle: esRole.jobTitle,
                clearance: esRole.clearance,
            }))
            expect(foundRole.digitalIdentityUniqueId).toBeUndefined()
            expect(Date.parse(beforeCreatedAt) === Date.parse(afterCreatedAt)).toBeTruthy()
        });
    
    
    });
}

