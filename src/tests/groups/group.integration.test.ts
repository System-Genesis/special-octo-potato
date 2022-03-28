import { testMoveGroup } from './groupMove.integration.spec';
import { connect } from '../../shared/infra/mongoose/connection';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import * as http from 'http';
import { start as startServer, app } from '../../shared/infra/http/app';

import { testCreateGroup } from './groupCreate.integration.spec'
import { testUpdateGroup } from './groupUpdate.integration.spec'

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



describe('Sequentially run groups tests', () => {
   testCreateGroup()
   testUpdateGroup()
   testMoveGroup()
})