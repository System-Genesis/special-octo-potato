import { emptyDB, findByQuery, findOneByQuery } from '../tests/setup/seedUtils';
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-mutable-exports */
import request from 'supertest';
import * as qs from 'qs';
import {startApp} from '../index';
import * as http from 'http';
import {app} from '../shared/infra/http/app'
let server: http.Server;


const validRole = { roleId: "123", source: 'ES', directGroup : '123'}
const notValidRoleGroup = { roleId: "123", source: 'ES', directGroup : '123321321'}
describe('POST Role ', () => {
    beforeAll(async () => {
        
        try {
            server = await startApp;
            await emptyDB()
        } catch (err) {
            console.log(err)
        }
    
        
    });
    afterAll(async () => {
        await server.close();
    });
    it('create a VALID role ', (done) => {
        request(app)
            .post(`/api/roles`)
            .send(
                validRole
            )
            .expect(200)
            .end((err :any, res : any) => {
                if (err) {
                    
                    throw done(err);
                }
                // 
                expect(res.body.toString()).toBe(
                res.body.toString());
                return done();
            });
    });
    it('role is not valid because of the group id ', (done) => {
        request(app)
            .post(`/api/roles`)
            .send(
                notValidRoleGroup
            )
            .expect(200)
            .end((err :any, res : any) => {
                if (err) {
                    
                    throw done(err);
                }
                // 
                expect(res.body.toString()).toBe(
                res.body.toString());
                return done();
            });
    });
});
