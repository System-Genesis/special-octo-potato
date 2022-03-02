
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';
import { app } from '../../shared/infra/http/app';
import { Types } from 'mongoose'

export const testMoveGroup = () => {
    describe('GROUP MOVE USECASES', () => {
        beforeEach(async () => {
        try {
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
        });

        let esId: string;
        let nonValidGroup: string | object | undefined;
        let foundNikeGroup : any;
    

        const esGroup = { name: "es_name", source: 'es_name'}

        it('move group to be under another group', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            const nikeGroup = { name: "nike", source: 'es_name', directGroup: esRes.body.id}
            const nikeRes = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const adidasGroup = { name: "adidas", source: 'es_name', directGroup: esRes.body.id}
            const adidasRes = await request(app).post(`/api/groups`).send(adidasGroup).expect(200)
            const res = await request(app).put(`/api/groups/${resCreate.body.id}`).send(updateData).expect(200)
            foundNikeGroup = await findOneByQuery('groups', { name: "nike"})
            expect(foundNikeGroup).toMatchObject({name: 'nike', source: 'es_name', isLeaf: true, diPrefix: '132'})
        });

        it('not update non exist group', async () => {
            const nonExistId = '12345';
            const updateData = { diPrefix: '132'}
            const res = await request(app).patch(`/api/groups/${nonExistId}`).send(updateData).expect(404)
            expect(res.body.message).toEqual(expect.stringContaining(`does not exist`))
        });



    });
}




