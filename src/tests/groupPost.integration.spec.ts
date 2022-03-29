import { connect } from '../shared/infra/mongoose/connection';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { emptyDB, findByQuery, findOneByQuery } from '../tests/setup/seedUtils';
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
        await emptyDB();
    } catch (err) {
        console.log(err);
    }
});
afterAll(async () => {
    await server.close();
});

describe('POST Group ', () => {
    const esGroup = { name: 'es_name', source: 'es_name' };
    let esId: string;
    let nikeGroup;
    it('create a VALID root group es_name', (done) => {
        request(app)
            .post(`/api/groups`)
            .send(esGroup)
            .expect(200)
            .end(async (err: any, res: any) => {
                if (err) {
                    throw done(err);
                }
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                esId = res.body.id;
                const foundGroup = await findOneByQuery('groups', { name: 'es_name' });
                expect(foundGroup.name).toBe('es_name');
                return done();
            });
    });
    let foundNikeGroup: any;
    it('create a VALID child group nike', (done) => {
        nikeGroup = { name: 'nike', source: 'es_name', directGroup: esId };
        request(app)
            .post(`/api/groups`)
            .send(nikeGroup)
            .expect(200)
            .end(async (err: any, res: any) => {
                if (err) {
                    throw done(err);
                }
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                foundNikeGroup = await findOneByQuery('groups', { name: 'nike' });
                expect(foundNikeGroup.name).toBe('nike');
                return done();
            });
    });
    it('shouldnt delete a root group because is not a leaf', async () => {
        request(app)
            .delete(`/api/groups/` + esId.toString())
            .expect(400)
            .end(async (err: any, res: any) => {
                if (err) {
                    throw err;
                }
            });
    });
    it('delete a VALID group ', async () => {
        request(app)
            .delete(`/api/groups/` + foundNikeGroup._id.toString())
            .expect(200)
            .end(async (err: any, res: any) => {
                if (err) {
                    throw err;
                }

                const foundGroup = await findOneByQuery('groups', { name: 'nike' });
                expect(foundGroup).toBe(null);
            });
    });
});

// describe('DELETE Group ', () => {
//     it('delete a VALID group ', async () => {
//         let foundGroup = await findOneByQuery('groups', { name: "nike"})
//         console.log(foundGroup._id.toString())
//         request(app)
//             .delete(`/api/groups/`+foundGroup._id.toString())
//             .expect(200)
//             .end(async (err :any, res : any) => {
//                 if (err) {

//                     throw (err);
//                 }

//                 const foundGroup = await findOneByQuery('groups', { name: "nike"})
//                 expect(foundGroup).toBe(null)

//             });

//     });
// });

// describe('PUT Group',() =>{
//     it('move a group', async()=>{
//         await emptyDB()
//         const moveGroupFather = { name: "fatherFirst", source: 'es_name'}
//         const moveGroupFather2 = {name: "fatherSecond", source: 'es_name'}
//         const res = await insert('groups', moveGroupFather)
//         const res2 = await insert('groups', moveGroupFather2)
//         let foundGroupFatherFirst = await findOneByQuery('groups', { name: "fatherFirst"})
//         const moveGroupSon = { name: "son", source: 'es_name', directGroup: foundGroupFatherFirst._id.toString()}
//         const res3 = await insert('groups', moveGroupSon)
//         const foundGroupSon = await findOneByQuery('groups', { name: "son"})
//         const foundGroupFather2 = await findOneByQuery('groups', { name: "fatherSecond"})
//         let st =(('/api/groups/'+foundGroupSon._id.toString()+'/parent/'+ foundGroupFather2._id.toString()).toString())
//         request(app)
//             .put(`/api/groups/${foundGroupSon._id.toString()}/parent/${foundGroupFather2._id.toString()}`)
//             .expect(200)
//             .end(async (err :any, res : any) => {
//                 if (err) {

//                     throw (err);
//                 }

//                 const foundGroup = await findOneByQuery('groups', { name: "son"})
//                 expect(foundGroup.directGroup).toBe(foundGroupFather2._id.toString())

//             });

//     });
// })
// describe('PUT Group',() =>{
//     it('move a group with different source, NOT VALID!', async()=>{
//         await emptyDB()
//         const moveGroupFather = { name: "fatherFirst", source: 'es_name'}
//         const moveGroupFather2 = {name: "fatherSecond", source: 'ads_name'}
//         const res = await insert('groups', moveGroupFather)
//         const res2 = await insert('groups', moveGroupFather2)
//         let foundGroupFatherFirst = await findOneByQuery('groups', { name: "fatherFirst"})
//         const moveGroupSon = { name: "son", source: 'es_name', directGroup: foundGroupFatherFirst._id.toString()}
//         const res3 = await insert('groups', moveGroupSon)
//         const foundGroupSon = await findOneByQuery('groups', { name: "son"})
//         const foundGroupFather2 = await findOneByQuery('groups', { name: "fatherSecond"})
//         request(app)
//             .put(`/api/groups/`+foundGroupSon._id.toString()+'/parent/'+ foundGroupFather2._id.toString())
//             .expect(200)
//             .end(async (err :any, res : any) => {
//                 if (err) {

//                     throw (err);
//                 }

//                 const foundGroup = await findOneByQuery('groups', { name: "son"})
//                 expect(foundGroup.directGroup).toBe(foundGroupFatherFirst._id.toString())

//             });

//     });
// })
