import { connect } from '../shared/infra/mongoose/connection';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { emptyDB, findByQuery, findOneByQuery } from './setup/seedUtils';
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-mutable-exports */
import request from 'supertest';
import * as http from 'http';
import { start as startServer, app } from '../shared/infra/http/app';

let server: http.Server;
beforeAll(async () => {

    try {
        server = await startServer();
        const replset = await MongoMemoryReplSet.create({
            replSet: {
                name: 'rs0',
                dbName: 'kartoffelTest',
                storageEngine: 'wiredTiger',
                count: 1,
            },
        });
        await replset.waitUntilRunning();
        const uri = replset.getUri();
        await connect(uri);
        await emptyDB()
    } catch (err) {
        console.log(err)
    }

    
});
afterAll(async () => {
    await server.close();
});


describe('GROUP USECASES', () => {
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
    
    describe('UPDATE Group UseCases ', () => {

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

});





