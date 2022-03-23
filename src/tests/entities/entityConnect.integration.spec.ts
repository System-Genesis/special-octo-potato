import { emptyDB, findByQuery, findOneByQuery } from "../setup/seedUtils";
import request from "supertest";
import { Types } from "mongoose";
import config from "config";
import { app } from "../../shared/infra/http/app";
import * as mongodb from "mongodb";
import { server } from "./entity.integration.test";

const entityTypes: {
  Soldier: string;
  Civilian: string;
  GoalUser: string;
  External: string;
} = config.get("valueObjects.EntityType");

const sources: string[] = config.get("valueObjects.source.values");
const es_name_source = sources[1];
const ads_name_source = sources[7];
const userDomains: string[] = config.get(
  "valueObjects.digitalIdentityId.domain.values"
);
const esDomain = userDomains[1];
const adsDomain = userDomains[0];
const organizations: string[] = config.get("valueObjects.organizations.values");
const serviceTypes: string[] = config.get("valueObjects.serviceType.values");
const ranks: string[] = config.get("valueObjects.rank.values");
const sexes: {
  Male: string;
  Female: string;
} = config.get("valueObjects.Sex");

afterAll(async () => {
  await server.close();
});

export const testConnectEntity = () => {
  describe("ENTITY CONNECT DI USECASES", () => {
    describe("VALID connections USECASES", () => {
      beforeEach(async () => {
        try {
          await emptyDB();
        } catch (err) {
          console.log(err);
        }
      });

      let entityId;
      const soldEntity = {
        firstName: "Noam",
        entityType: entityTypes.Soldier,
        lastName: "Shiloni",
        personalNumber: "8517714",
        serviceType: serviceTypes[0],
        rank: ranks[0],
        sex: sexes.Male,
        phone: "09-8651414",
        mobilePhone: "054-7340538",
      };

      const esDI = {
        type: "domainUser",
        source: es_name_source,
        mail: `you@${esDomain}`,
        uniqueId: `uniqueId@${esDomain}`,
        isRoleAttachable: true,
      };

      it("connect and disconnect entity to es_name di", async () => {
        const resEntityCreate = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        expect(Object.keys(resEntityCreate.body).length === 1);
        expect(resEntityCreate.body.id).toBeTruthy();
        const entityId = resEntityCreate.body.id;
        const resDICreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(esDI)
          .expect(200);
        const resConnectES = await request(app)
          .put(`/api/entities/${entityId}/digitalIdentity/${esDI.uniqueId}`)
          .send()
          .expect(200);
        let foundDI = await findOneByQuery("digitalidentities", {
          uniqueId: `uniqueid@${esDomain}`,
        });
        expect(foundDI).toEqual(
          expect.objectContaining({
            entityId: Types.ObjectId(entityId),
          })
        );
        const resDisConnectES = await request(app)
          .delete(`/api/entities/${entityId}/digitalIdentity/${esDI.uniqueId}`)
          .send()
          .expect(200);
        foundDI = await findOneByQuery("digitalidentities", {
          uniqueId: `uniqueid@${esDomain}`,
        });
        expect(foundDI).toEqual(
          expect.not.objectContaining({
            entityId: Types.ObjectId(entityId),
          })
        );
      });
    });

    describe(`invalid connections uses`, () => {
      beforeEach(async () => {
        try {
          await emptyDB();
        } catch (err) {
          console.log(err);
        }
      });

      let entityId;
      const soldEntity = {
        firstName: "Noam",
        entityType: entityTypes.Soldier,
        lastName: "Shiloni",
        personalNumber: "8517714",
        serviceType: serviceTypes[0],
        rank: ranks[0],
        sex: sexes.Male,
        phone: "09-8651414",
        mobilePhone: "054-7340538",
      };
      const esDI = {
        type: "domainUser",
        source: es_name_source,
        mail: `you@${esDomain}`,
        uniqueId: `uniqueId@${esDomain}`,
        isRoleAttachable: true,
      };
      const adsDI = {
        type: "domainUser",
        source: ads_name_source,
        mail: `you@${adsDomain}`,
        uniqueId: `uniqueId@${adsDomain}`,
        isRoleAttachable: true,
      };
      it(`Should return uid value error`, async () => {
        const resEntityCreate = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        expect(Object.keys(resEntityCreate.body).length === 1);
        expect(resEntityCreate.body.id).toBeTruthy();
        const entityId = resEntityCreate.body.id;
        const invalidUID = `12321dd`;
        const resConnectES = await request(app)
          .put(`/api/entities/${entityId}/digitalIdentity/${invalidUID}`)
          .send()
          .expect(400);
        expect(resConnectES.body.message).toEqual(
          expect.stringContaining(
            `invalid digital identity unique id: ${invalidUID}`
          )
        );
      });
      it(`Should return entity not found error`, async () => {
        let fakeEntityId = `623b01b9bfc3cbea7b085986`;
        let uid = `uniqueId@${esDomain}`;
        const resConnectES = await request(app)
          .put(`/api/entities/${fakeEntityId}/digitalIdentity/${uid}`)
          .send()
          .expect(404);
        expect(resConnectES.body.message).toEqual(
          expect.stringContaining(
            `resource entity: ${fakeEntityId} does not exist`
          )
        );
      });

      it(`Should return di not found error`, async () => {
        const resEntityCreate = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        expect(Object.keys(resEntityCreate.body).length === 1);
        expect(resEntityCreate.body.id).toBeTruthy();
        const entityId = resEntityCreate.body.id;
        let uid = `uniqueId@${esDomain}`;
        const resConnectES = await request(app)
          .put(`/api/entities/${entityId}/digitalIdentity/${uid}`)
          .send()
          .expect(400);
        expect(resConnectES.body.message).toEqual(
          expect.stringContaining(
            `resource digital identity: ${uid} does not exist`
          )
        );
      });

      it(`Should return must have upn in order to be connected error`, async () => {
        const resEntityCreate = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        expect(Object.keys(resEntityCreate.body).length === 1);
        expect(resEntityCreate.body.id).toBeTruthy();
        const entityId = resEntityCreate.body.id;
        const resDICreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(adsDI)
          .expect(200);
        const resConnectES = await request(app)
          .put(`/api/entities/${entityId}/digitalIdentity/${adsDI.uniqueId}`)
          .send()
          .expect(400);

        expect(resConnectES.body.message).toEqual(
          expect.stringContaining(
            "digital identity must have upn in order to be connected"
          )
        );
      });

      it(`Should return logic error`, async () => {
        const resEntityCreate = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        expect(Object.keys(resEntityCreate.body).length === 1);
        expect(resEntityCreate.body.id).toBeTruthy();
        const entityId = resEntityCreate.body.id;
        const resDICreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(adsDI)
          .expect(200);
        const resConnectES = await request(app)
          .put(`/api/entities/${entityId}/digitalIdentity/${adsDI.uniqueId}`)
          .send({ upn: "something" })
          .expect(200);
        const resConnectES2 = await request(app)
          .put(`/api/entities/${entityId}/digitalIdentity/${adsDI.uniqueId}`)
          .send({ upn: "something" })
          .expect(400);
        expect(resConnectES2.body.message).toEqual(
          expect.stringContaining(
            `digital identity ${adsDI.uniqueId.toLowerCase()} is already connected to entity`
          )
        );
      });
    });
  });
};
