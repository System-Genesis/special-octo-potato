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
    
    describe('CREATE Group UseCases ', () => {

        const esGroup = { name: "es_name", source: 'es_name'}

        it('create a VALID root group es_name', async () => {
            const res = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            expect(Object.keys(res.body).length === 1)
            expect(res.body.id).toBeTruthy()
            esId = res.body.id
            const foundESGroup = await findOneByQuery('groups', { name: "es_name"})
            expect(foundESGroup).toEqual(expect.objectContaining({name: 'es_name', source: 'es_name', isLeaf: true}))
        });

        it('create a VALID child group nike', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: 'es_name', directGroup: esRes.body.id}
            const res = await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            expect(Object.keys(res.body).length === 1)
            expect(res.body.id).toBeTruthy()
            foundNikeGroup = await findOneByQuery('groups', { name: "nike"})
            expect(foundNikeGroup).toMatchObject({name: 'nike', source: 'es_name', isLeaf: true})
            const foundGroup = await findOneByQuery('groups', { name: "es_name"})
            expect(foundGroup).toEqual(expect.objectContaining({name: 'es_name', source: 'es_name', isLeaf: false}))
        });

        it('shouldnt create already exists child group nike', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: 'es_name', directGroup: esRes.body.id}
            await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const res = await request(app).post(`/api/groups`).send(nikeGroup).expect(400)
            expect(res.body.message).toEqual(expect.stringContaining('already exists'))
        });

        it('shouldnt delete a es_name group because its not a leaf', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: 'es_name', directGroup: esRes.body.id}
            await request(app).post(`/api/groups`).send(nikeGroup).expect(200)
            const res = await request(app).delete(`/api/groups/`+esRes.body.id).expect(400)
        });

        it('should delete nike child group ', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nikeGroup = { name: "nike", source: 'es_name', directGroup: esRes.body.id}
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
            nonValidGroup = { name: "es_name", source: 'es_name', directGroup: '123'}
            const res = await request(app).post(`/api/groups`).send(nonValidGroup).expect(404)
            expect(res.body.message).toEqual(expect.stringContaining('not exist'))
        });


        it('shouldnt create adidas group from sf_name under nike from es_name', async () => {
            const esRes = await request(app).post(`/api/groups`).send(esGroup).expect(200)
            nonValidGroup = { name: "ss", source: 'sf_name', directGroup: esRes.body.id}
            const res = await request(app).post(`/api/groups`).send(nonValidGroup).expect(400)
            expect(res.body.message).toEqual(expect.stringContaining(`sf_name doesn't match to source es_name`))

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

