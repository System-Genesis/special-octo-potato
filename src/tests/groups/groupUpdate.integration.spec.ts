import config from 'config';

import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';
import { app } from '../../shared/infra/http/app';
import { Types } from 'mongoose';

const sources: string[] = config.get('valueObjects.source.values');
const es_name_source = sources[1];
const sf_name_source = sources[2];

beforeEach(async () => {
    try {
        await emptyDB();
    } catch (err) {
        console.log(err);
    }
});

export const testUpdateGroup = () => {
    describe('GROUP UPDATE USECASES', () => {
        beforeEach(async () => {
            try {
                await emptyDB();
            } catch (err) {
                console.log(err);
            }
        });

        let esId: string;
        let nikeGroup;
        let nonValidGroup: string | object | undefined;
        let foundNikeGroup: any;

        const esGroup = { name: es_name_source, source: es_name_source };

        it('update a created group nike', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200);
            nikeGroup = { name: 'nike', source: es_name_source, directGroup: esRes.body.id };
            const resCreate = await request(app).post(`/api/groups`).send(nikeGroup).expect(200);
            const updateData = { diPrefix: '132' };
            const res = await request(app).patch(`/api/groups/${resCreate.body.id}`).send(updateData).expect(200);
            foundNikeGroup = await findOneByQuery('groups', { name: 'nike' });
            expect(foundNikeGroup).toMatchObject({ name: 'nike', source: es_name_source, isLeaf: true, diPrefix: '132' });
        });

        it('not update non exist group', async () => {
            const nonExistId = '12345';
            const updateData = { diPrefix: '132' };
            const res = await request(app).patch(`/api/groups/${nonExistId}`).send(updateData).expect(404);
            expect(res.body.message).toEqual(expect.stringContaining(`does not exist`));
        });

        it('rename group', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200);
            nikeGroup = { name: 'nike', source: es_name_source, directGroup: esRes.body.id };
            const resCreate = await request(app).post(`/api/groups`).send(nikeGroup).expect(200);
            const updateData = { name: 'adidas' };
            const res = await request(app).patch(`/api/groups/${resCreate.body.id}/rename`).send(updateData).expect(200);
            foundNikeGroup = await findOneByQuery('groups', { _id: Types.ObjectId(resCreate.body.id) });
            expect(foundNikeGroup).toMatchObject({ name: 'adidas', source: es_name_source, isLeaf: true });
        });

        it('cannot rename non exist group', async () => {
            const updateData = { name: 'adidas' };
            const res = await request(app).patch(`/api/groups/1234/rename`).send(updateData).expect(404);
            expect(res.body.message).toEqual(expect.stringContaining(`does not exist`));
        });

        it('cannot rename root group', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200);
            nikeGroup = { name: 'nike', source: es_name_source, directGroup: esRes.body.id };
            const resCreate = await request(app).post(`/api/groups`).send(nikeGroup).expect(200);
            const updateData = { name: 'adidas' };
            const res = await request(app).patch(`/api/groups/${esRes.body.id}/rename`).send(updateData).expect(400);
            expect(res.body.message).toEqual(expect.stringContaining(`cannot change root name of`));
        });

        it('cannot rename group with exists child name in parent ', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200);
            nikeGroup = { name: 'nike', source: es_name_source, directGroup: esRes.body.id };
            const resCreateNike = await request(app).post(`/api/groups`).send(nikeGroup).expect(200);
            nikeGroup = { name: 'adidas', source: es_name_source, directGroup: esRes.body.id };
            const resCreateAdidas = await request(app).post(`/api/groups`).send(nikeGroup).expect(200);
            const updateData = { name: 'nike' };
            const res = await request(app).patch(`/api/groups/${resCreateAdidas.body.id}/rename`).send(updateData).expect(400);
            expect(res.body.message).toEqual(expect.stringContaining(`cannot have two groups with the name`));
        });
    });
};
