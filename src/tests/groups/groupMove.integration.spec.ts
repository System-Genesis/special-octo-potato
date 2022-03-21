import config from 'config';

import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';
import { app } from '../../shared/infra/http/app';
import { Types } from 'mongoose'


const sources: string[] = config.get('valueObjects.source.values');
const es_name_source = sources[1]
const sf_name_source = sources[2]

export const testMoveGroup = () => {
    describe('GROUP MOVE USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });
    

        const esGroup = { name: es_name_source, source: es_name_source}
        const sfGroup = { name: sf_name_source, source: sf_name_source}

        it('move group to be under another group', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const nikeRes = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const adidasGroup = { name: "adidas", source: es_name_source, directGroup: esRes.body.id}
            const adidasRes = await request(app).post(`/api/groups`).send(adidasGroup).expect(200)
            const addiasId = adidasRes.body.id;
            const nikeId = nikeRes.body.id;
            const res = await request(app).put(`/api/groups/${addiasId}/parent/${nikeId}`).send().expect(200)
            const foundAdidasGroup = await findOneByQuery('groups', { name: "adidas"})
            expect(foundAdidasGroup).toMatchObject({name: 'adidas', source: es_name_source, isLeaf: true, directGroup: Types.ObjectId(nikeId)})
        });

        it('cannot group to be under non exist group', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const nikeRes = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const adidasGroup = { name: "adidas", source: es_name_source, directGroup: esRes.body.id}
            const adidasRes = await request(app).post(`/api/groups`).send(adidasGroup).expect(200)
            const addiasId = adidasRes.body.id;
            const res = await request(app).put(`/api/groups/${addiasId}/parent/1234`).send().expect(400)
            expect(res.body.message).toEqual(expect.stringContaining(`does not exist`))
        });

        it('cannot move non exist group', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const nikeRes = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const adidasGroup = { name: "adidas", source: es_name_source, directGroup: esRes.body.id}
            const adidasRes = await request(app).post(`/api/groups`).send(adidasGroup).expect(200)
            const addiasId = adidasRes.body.id;
            const res = await request(app).put(`/api/groups/1234/parent/${addiasId}`).send().expect(404)
            expect(res.body.message).toEqual(expect.stringContaining(`does not exist`))
        });

        it('cannot move group to another source', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const esSubGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const esSubRes = await request(app).post(`/api/groups`).send(esSubGroup).expect(200)
            const esSubId = esSubRes.body.id;
            const sfRes = await request(app).post(`/api/groups`).send(sfGroup).expect(200)
            const sfSubGroup = { name: "sfSub", source: sf_name_source, directGroup: sfRes.body.id}
            const sfSubRes = await request(app).post(`/api/groups`).send(sfSubGroup).expect(200)
            const sfSubId = sfSubRes.body.id;
            const res = await request(app).put(`/api/groups/${sfSubId}/parent/${esSubId}`).send().expect(400)
            expect(res.body.message).toEqual(expect.stringContaining(`doesn't match to source`))
        });

        it('cannot move group to another group with already exist child name', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const nikeGroup = { name: "nike", source: es_name_source, directGroup: esRes.body.id}
            const nikeRes = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const nikeGroup2 = { name: "nike", source: es_name_source, directGroup: nikeRes.body.id}
            const nike2Res = await request(app).post(`/api/groups`).send(nikeGroup2).expect(200)
            const nike2Id = nike2Res.body.id;
            const res = await request(app).put(`/api/groups/${nike2Id}/parent/${esRes.body.id}`).send().expect(400)
            expect(res.body.message).toEqual(expect.stringContaining(`cannot have two groups with the name`))
        });

        it('cannot move group to another group because it creates a cycle', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const esSubGroup = { name: "esSub", source: es_name_source, directGroup: esRes.body.id}
            const esSubRes = await request(app).post(`/api/groups`).send(esSubGroup).expect(200)
            const esSubId = esSubRes.body.id;
            const esSub2Group = { name: "esSub2", source: es_name_source, directGroup: esSubRes.body.id}
            const esSub2Res = await request(app).post(`/api/groups`).send(esSub2Group).expect(200)
            const esSub2Id = esSub2Res.body.id;
            const res = await request(app).put(`/api/groups/${esSubId}/parent/${esSub2Id}`).send().expect(400)
            expect(res.body.message).toEqual(expect.stringContaining(`cannot move group ${esSubGroup.name} under its decentant: `))
        });

        // it('not update non exist group', async () => {
        //     const nonExistId = '12345';
        //     const updateData = { diPrefix: '132'}
        //     const res = await request(app).patch(`/api/groups/${nonExistId}`).send(updateData).expect(404)
        //     expect(res.body.message).toEqual(expect.stringContaining(`does not exist`))
        // });



    });
}




