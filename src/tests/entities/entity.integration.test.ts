import { testUpdateEntity } from "./entityUpdate.integration.spec";
import { testConnectEntity } from "./entityConnect.integration.spec";
import { connect } from "../../shared/infra/mongoose/connection";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { emptyDB, findByQuery, findOneByQuery } from "../setup/seedUtils";
import * as http from "http";
import { start as startServer, app } from "../../shared/infra/http/app";

import { testCreateEntity } from "./entityCreate.integration.spec";
//import { testUpdateGroup } from './entityCreate.integration.spec'

export let server: http.Server;
let replset: MongoMemoryReplSet;
beforeAll(async () => {
  try {
    server = await startServer();
    replset = await MongoMemoryReplSet.create({
      replSet: {
        name: "rs0",
        dbName: "kartoffelTest",
        storageEngine: "wiredTiger",
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

describe("Sequentially run groups tests", () => {
  //testCreateEntity();
  //testUpdateEntity();
  testConnectEntity();
  afterAll(async () => {
    await server.close();
  });
});
