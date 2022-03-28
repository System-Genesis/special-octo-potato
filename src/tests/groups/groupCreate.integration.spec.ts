
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';

import config from "config";
import { app } from '../../shared/infra/http/app';

const sources: string[] = config.get('valueObjects.source.values');
const es_name_source = sources[1]
const sf_name_source = sources[2]

beforeEach(async () => {
    try {
      await emptyDB();
    } catch (err) {
      console.log(err);
    }
  });
  
export const testCreateGroup = () => {
    describe('GROUP CREATE USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });
    
        let esId: string;
        let nikeGroup;
        let nonValidGroup: string | object | undefined;
        let foundNikeGroup : any;
        

        const esGroup = { name: es_name_source, source: es_name_source}

        it('create a VALID root group es_name', async () => {
            const res = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            expect(Object.keys(res.body).length === 1)
            expect(res.body.id).toBeTruthy()
            esId = res.body.id
            const foundESGroup = await findOneByQuery('groups', { name: es_name_source})
            expect(foundESGroup).toEqual(expect.objectContaining({name: es_name_source, source: es_name_source, isLeaf: true}))
        });

        it('create a VALID child group nike', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const res = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            expect(Object.keys(res.body).length === 1)
            expect(res.body.id).toBeTruthy()
            foundNikeGroup = await findOneByQuery('groups', { name: "nike"})
            expect(foundNikeGroup).toMatchObject({name: 'nike', source: es_name_source, isLeaf: true})
            const foundGroup = await findOneByQuery('groups', { name: es_name_source})
            expect(foundGroup).toEqual(expect.objectContaining({name: es_name_source, source: es_name_source, isLeaf: false}))
        });

        it('shouldnt create already exists child group nike', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const res = await request(app).post(`/api/groups`).send(nikeGroup).expect(400)
            expect(res.body.message).toEqual(expect.stringContaining('already exists'))
        });

        it('shouldnt delete a es_name group because its not a leaf', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const res = await request(app).delete(`/api/groups/`+esRes.body.id).expect(400)
        });

        it('should delete nike child group ', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const nikeRes = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const res = await request(app).delete(`/api/groups/`+nikeRes.body.id).expect(200)                    
            const foundGroup = await findOneByQuery('groups', { name: "nike"})
            expect(foundGroup).toBe(null)
        });

        it('shouldnt create a non valid source group ss', async () => {
            const ssGroup = { name: "ss", source: 'ss'}
            const res = await request(app).post(`/api/groups`).send(ssGroup).expect(400)
            expect(res.body.message).toEqual(expect.stringContaining('invalid source'))
        });

        
        it('shouldnt create a group with non exist parent', async () => {
            nonValidGroup = { name: es_name_source, source: es_name_source, directGroup: '123'}
            const res = await request(app).post(`/api/groups`).send(nonValidGroup).expect(404)
            expect(res.body.message).toEqual(expect.stringContaining('not exist'))
        });


        it('shouldnt create adidas group from sf_name under nike from es_name', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nonValidGroup = { name: "ss", source: sf_name_source, directGroup: esRes.body.id}
            const res = await request(app).post(`/api/groups`).send(nonValidGroup).expect(400)
            expect(res.body.message).toEqual(expect.stringContaining(`sf_name doesn't match to source es_name`))

        });
    
    
    });
}

