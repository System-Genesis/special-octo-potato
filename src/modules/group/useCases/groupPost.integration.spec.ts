import { findByQuery, findOneByQuery, insert } from './../../../tests/seedUtils';
import { emptyDB } from '../../../tests/seedUtils';
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-mutable-exports */
import request from 'supertest';
import * as http from 'http';
import {app} from '../../../shared/infra/http/app'
import {startApp} from '../../../index';

let server: http.Server;
beforeAll(async () => {

    try {
        server = await startApp;
        await emptyDB()
    } catch (err) {}

    
});
afterAll(async () => {
    await server.close();
});


const group = { name: "nike", source: 'ES'}
describe('POST Group ', () => {
    it('create a VALID group ', (done) => {
        request(app)
            .post(`/api/groups`)
            .send(
                group
            )
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw done(err);
                }
                expect(Object.keys(res.body).length === 1)
                expect(res.body.id).toBeTruthy()
                const foundGroup = await findOneByQuery('groups', { name: "nike"})
                expect(foundGroup.name).toBe('nike')
                return done();
            });
    });
});

describe('DELETE Group ', () => {
    it('delete a VALID group ', async () => {
        let foundGroup = await findOneByQuery('groups', { name: "nike"})
        console.log(foundGroup._id.toString())
        request(app)
            .delete(`/api/groups/`+foundGroup._id.toString())
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw (err);
                }
                
                const foundGroup = await findOneByQuery('groups', { name: "nike"})
                expect(foundGroup).toBe(null)
                
            });
        
    });
});

describe('PUT Group',() =>{
    it('move a group', async()=>{
        await emptyDB()
        const moveGroupFather = { name: "fatherFirst", source: 'ES'}
        const moveGroupFather2 = {name: "fatherSecond", source: 'ES'}
        const res = await insert('groups', moveGroupFather)
        const res2 = await insert('groups', moveGroupFather2)
        let foundGroupFatherFirst = await findOneByQuery('groups', { name: "fatherFirst"})
        const moveGroupSon = { name: "son", source: 'ES', directGroup: foundGroupFatherFirst._id.toString()}
        const res3 = await insert('groups', moveGroupSon)
        const foundGroupSon = await findOneByQuery('groups', { name: "son"})
        const foundGroupFather2 = await findOneByQuery('groups', { name: "fatherSecond"})
        let st =(('/api/groups/'+foundGroupSon._id.toString()+'/parent/'+ foundGroupFather2._id.toString()).toString())
        request(app)
            .put(`/api/groups/${foundGroupSon._id.toString()}/parent/${foundGroupFather2._id.toString()}`)
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw (err);
                }
                
                const foundGroup = await findOneByQuery('groups', { name: "son"})
                expect(foundGroup.directGroup).toBe(foundGroupFather2._id.toString())
                
            });

    });
})
describe('PUT Group',() =>{
    it('move a group with different source, NOT VALID!', async()=>{
        await emptyDB()
        const moveGroupFather = { name: "fatherFirst", source: 'ES'}
        const moveGroupFather2 = {name: "fatherSecond", source: 'AD'}
        const res = await insert('groups', moveGroupFather)
        const res2 = await insert('groups', moveGroupFather2)
        let foundGroupFatherFirst = await findOneByQuery('groups', { name: "fatherFirst"})
        const moveGroupSon = { name: "son", source: 'ES', directGroup: foundGroupFatherFirst._id.toString()}
        const res3 = await insert('groups', moveGroupSon)
        const foundGroupSon = await findOneByQuery('groups', { name: "son"})
        const foundGroupFather2 = await findOneByQuery('groups', { name: "fatherSecond"})
        request(app)
            .put(`/api/groups/`+foundGroupSon._id.toString()+'/parent/'+ foundGroupFather2._id.toString())
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw (err);
                }
                
                const foundGroup = await findOneByQuery('groups', { name: "son"})
                expect(foundGroup.directGroup).toBe(foundGroupFatherFirst._id.toString())
                
            });

    });
})
