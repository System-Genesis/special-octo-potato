
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';
import { app } from '../../shared/infra/http/app';


export const testUpdateGroup = () => {
    describe('GROUP UPDATE USECASES', () => {
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
    

        const esGroup = { name: "es_name", source: 'es_name'}

        it('update a created group nike', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: 'es_name', directGroup: esRes.body.id}
            const resCreate = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const updateData = { diPrefix: '132'}
            const res = await request(app).patch(`/api/groups/${resCreate.body.id}`).send(updateData).expect(200)
            foundNikeGroup = await findOneByQuery('groups', { name: "nike"})
            expect(foundNikeGroup).toMatchObject({name: 'nike', source: 'es_name', isLeaf: true, diPrefix: '132'})
        });


    });
}




