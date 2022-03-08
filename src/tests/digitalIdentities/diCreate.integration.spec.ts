
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';

import config from "config";
import { app } from '../../shared/infra/http/app';

const sources: string[] = config.get('valueObjects.source.values');
const es_name_source = sources[1]


export const testCreateDI = () => {
    describe('DI CREATE USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });
    
        const esGroup = { name: es_name_source, source: es_name_source}

        it('create a VALID di sf_name', async () => {
            const res = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            expect(Object.keys(res.body).length === 1)
            expect(res.body.id).toBeTruthy()
            const foundESGroup = await findOneByQuery('groups', { name: es_name_source})
            expect(foundESGroup).toEqual(expect.objectContaining({name: es_name_source, source: es_name_source, isLeaf: true}))
        });
    
    
    });
}

