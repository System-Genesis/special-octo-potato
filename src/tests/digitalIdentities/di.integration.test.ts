import { testUpdateDI } from './diUpdate.integration.spec';
import { connect } from '../../shared/infra/mongoose/connection';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import * as http from 'http';
import { start as startServer, app } from '../../shared/infra/http/app';

import { testCreateDI } from './diCreate.integration.spec'


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



describe('Sequentially run digitalIdentities tests', () => {
   testCreateDI()
   testUpdateDI()
})