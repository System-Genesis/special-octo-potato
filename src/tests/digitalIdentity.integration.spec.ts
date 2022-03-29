import { findByQuery, findOneByQuery, emptyDB } from '../tests/setup/seedUtils';
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-mutable-exports */
import request from 'supertest';
import * as http from 'http';
import { app } from '../shared/infra/http/app';
import { startApp } from '../index';

let server: http.Server;
beforeAll(async () => {
    try {
        server = await startApp;
        await emptyDB();
    } catch (err) {}
});
afterAll(async () => {
    await server.close();
});

const digitalIdentity = {
    type: 'domainUser',
    source: 'es',
    mail: 'you@sirutim.com',
    uniqueId: 'uniqueId@sirutim.com',
    isRoleAttachable: true,
};

describe('POST Digital identity ', () => {
    it('create a VALID DI ', (done) => {
        request(app)
            .post(`/api/digitalidentities`)
            .send(digitalIdentity)
            .expect(200)
            .end(async (err: any, res: any) => {
                if (err) {
                    throw done(err);
                }
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                const foundDI = await findOneByQuery('digitalidentities', { uniqueId: 'uniqueId@sirutim.com' });
                expect(foundDI.uniqueId).toBe('uniqueId@sirutim.com');
                return done();
            });
    });
});
