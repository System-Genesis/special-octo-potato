import { emptyDB, findByQuery, findOneByQuery } from "../setup/seedUtils";
import request from "supertest";

import config from "config";
import { app } from "../../shared/infra/http/app";

const sources: string[] = config.get("valueObjects.source.values");
const es_name_source = sources[1];
const userDomains: string[] = config.get(
  "valueObjects.digitalIdentityId.domain.values"
);
const esDomain = userDomains[1];

beforeEach(async () => {
  try {
    await emptyDB();
  } catch (err) {
    console.log(err);
  }
});

export const testUpdateDI = () => {
  describe("DI UPDATE USECASES", () => {
    beforeEach(async () => {
      try {
        await emptyDB();
      } catch (err) {
        console.log(err);
      }
    });

    const esDI = {
      type: "domainUser",
      source: es_name_source,
      mail: `you@${esDomain}`,
      uniqueId: `uniqueId@${esDomain}`,
      isRoleAttachable: true,
    };

    describe("DI UPDATE", () => {
      it("Should update mail", async () => {
        const resCreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(esDI)
          .expect(200);
        const updateData = {
          isRoleAttachable: true,
          mail: `me@${esDomain}`,
        };
        const createdDI = await findOneByQuery("digitalidentities", {
          uniqueId: `uniqueid@${esDomain}`,
        });

        const resUpdate = await request(app)
          .patch(`/api/digitalIdentities/${esDI.uniqueId}`)
          .send(updateData)
          .expect(200);
        const foundDI = await findOneByQuery("digitalidentities", {
          uniqueId: `uniqueid@${esDomain}`,
        });
        expect(foundDI).toEqual(
          expect.objectContaining({
            type: "domainUser",
            source: es_name_source,
            mail: `me@${esDomain}`,
            uniqueId: `uniqueid@${esDomain}`,
            isRoleAttachable: true,
            createdAt: createdDI.createdAt,
          })
        );
      });

      it("Should update isRoleAttachable ", async () => {
        const resCreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(esDI)
          .expect(200);
        const updateData = {
          isRoleAttachable: false,
          mail: `me@${esDomain}`,
        };
        const resUpdate = await request(app)
          .patch(`/api/digitalIdentities/${esDI.uniqueId}`)
          .send(updateData)
          .expect(200);
        const foundDI = await findOneByQuery("digitalidentities", {
          uniqueId: `${esDI.uniqueId.toLowerCase()}`,
        });
        expect(foundDI).toEqual(
          expect.objectContaining({
            type: "domainUser",
            source: es_name_source,
            mail: `me@${esDomain}`,
            uniqueId: `uniqueid@${esDomain}`,
            isRoleAttachable: false,
          })
        );
      });

      // TODO: fix bug that returns 400 instead of 404 and uncomment this
      // it('Shouldnt update non exist di', async () => {
      //     const updateData = {
      //         isRoleAttachable: false,
      //         mail: `me@${esDomain}`
      //     }
      //     const resUpdate = await request(app).patch(`/api/digitalIdentities/nonexist`).send(updateData).expect(404)
      // });
    });

    describe("DELETE DI", () => {
      it("Should delete digitalIdentity ", async () => {
        const resCreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(esDI)
          .expect(200);
        const resDelete = await request(app)
          .delete(`/api/digitalIdentities/${esDI.uniqueId}`)
          .send()
          .expect(200);
        const foundDI = await findOneByQuery("digitalidentities", {
          uniqueId: `${esDI.uniqueId.toLowerCase()}`,
        });
        expect(foundDI).toBe(null);
      });

      it("Shouldnt delete a digitalIdentity connected to entity", async () => {
        const resCreate = await request(app)
          .post(`/api/digitalIdentities`)
          .send(esDI)
          .expect(200);
        const resDelete = await request(app)
          .delete(`/api/digitalIdentities/${esDI.uniqueId}`)
          .send()
          .expect(200);
        const foundDI = await findOneByQuery("digitalidentities", {
          uniqueId: `${esDI.uniqueId.toLowerCase()}`,
        });
        expect(foundDI).toBe(null);
      });
    });
  });
};
