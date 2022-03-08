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

const gUserDomains: string[] = config.get(
  "valueObjects.digitalIdentityId.domain.values"
);
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
    describe("VALID CREATIONS USECASES", () => {
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
      it("connect entity to sf_name di", async () => {
        const res = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        expect(Object.keys(res.body).length === 1);
        expect(res.body.id).toBeTruthy();
        entityId = Types.ObjectId(res.body.id);
        const foundEntity = await findOneByQuery("entities", {
          _id: entityId,
        });
        expect(foundEntity).toEqual(
          expect.objectContaining({
            firstName: "Noam",
            lastName: "Shiloni",
            entityType: entityTypes.Soldier,
            personalNumber: "8517714",
            serviceType: serviceTypes[0],
            rank: ranks[0],
            sex: sexes.Male,
            phone: ["098651414"],
            mobilePhone: ["0547340538"],
          })
        );
      });

    });
  });
};
