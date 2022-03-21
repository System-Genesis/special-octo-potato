import { PersonalNumber } from "./../../modules/entity/domain/PersonalNumber";
import { emptyDB, findByQuery, findOneByQuery } from "../setup/seedUtils";
import request from "supertest";
import { Types } from "mongoose";
import config from "config";
import { app } from "../../shared/infra/http/app";
import * as mongodb from "mongodb";
import { server } from "./entity.integration.test";
import { DigitalIdentityId } from "../../modules/digitalIdentity/domain/DigitalIdentityId";

const entityTypes: {
  Soldier: string;
  Civilian: string;
  GoalUser: string;
  External: string;
} = config.get("valueObjects.EntityType");

const gUserDomains: string[] = config.get(
  "valueObjects.digitalIdentityId.domain.values"
);
const sources: string[] = config.get("valueObjects.source.values");
const es_name_source = sources[1];
const sf_name_source = sources[2];
const sfDomain = gUserDomains[3];
const akaUnitsMap: any = config.get("valueObjects.source.primaryMap");
const esDomain = gUserDomains[1];
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

export const testUpdateEntity = () => {
  describe("ENTITY UPDATE USECASES", () => {
    describe("VALID UPDATE USECASES", () => {
      beforeEach(async () => {
        try {
          await emptyDB();
        } catch (err) {
          console.log(err);
        }
      });
      const civEntity = {
        firstName: "Tommy",
        entityType: entityTypes.Civilian,
        lastName: "Afek",
        identityCard: "206917817",
      };
      let entityId;
      it("update a VALID civilian entity", async () => {
        const res = await request(app)
          .post(`/api/entities`)
          .send(civEntity)
          .expect(200);
        expect(Object.keys(res.body).length === 1);
        expect(res.body.id).toBeTruthy();
        entityId = Types.ObjectId(res.body.id);
        let foundEntity = await findOneByQuery("entities", {
          _id: entityId,
        });
        expect(foundEntity).toEqual(
          expect.objectContaining({
            firstName: "Tommy",
            lastName: "Afek",
            entityType: entityTypes.Civilian,
          })
        );
        const date = new Date();
        const updateData = {
          entityType: entityTypes.Soldier,
          personalNumber: "123456",
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          serviceType: serviceTypes[1],
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: date,
              },
            },
          },
          rank: ranks[0],
          sex: sexes.Male,
          identityCard: "326034246",
        };
        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData);
        foundEntity = await findOneByQuery("entities", {
          _id: entityId,
        });
        expect(foundEntity).toEqual(
          expect.objectContaining({
            firstName: "Tommy",
            lastName: "Afek",
            identityCard: "326034246",
            entityType: entityTypes.Soldier,
            personalNumber: "123456",
            phone: ["098651414"],
            serviceType: serviceTypes[1],
            rank: ranks[0],
            mobilePhone: ["0547340538"],
            pictures: {
              profile: {
                meta: {
                  path: "he",
                  format: "he",
                  updatedAt: date,
                },
              },
            },
            sex: sexes.Male,
          })
        );
      });

      const goalUserEntity = {
        firstName: "Noam",
        entityType: entityTypes.GoalUser,
        lastName: "Shiloni",
        goalUserId: `nolego@${gUserDomains[0]}`,
      };
      it("update a VALID goal user entity", async () => {
        const res = await request(app)
          .post(`/api/entities`)
          .send(goalUserEntity)
          .expect(200);
        expect(Object.keys(res.body).length === 1);
        expect(res.body.id).toBeTruthy();
        const convertedEntityId = Types.ObjectId(res.body.id);
        let foundEntity = await findOneByQuery("entities", {
          _id: convertedEntityId,
        });
        expect(foundEntity).toEqual(
          expect.objectContaining({
            firstName: "Noam",
            entityType: entityTypes.GoalUser,
            lastName: "Shiloni",
            goalUserId: `nolego@${gUserDomains[0]}`,
          })
        );
        const updateData = {
          goalUserId: `nolego2@${gUserDomains[0]}`
        };
        const resUpdate = await request(app)
          .patch(`/api/entities/${res.body.id}`)
          .send(updateData)
          .expect(200);
        foundEntity = await findOneByQuery("entities", {
          _id: Types.ObjectId(res.body.id),
          
        });
        expect(foundEntity).toEqual(
          expect.objectContaining({
            firstName: "Noam",
            entityType: entityTypes.GoalUser,
            lastName: "Shiloni",
            goalUserId: updateData.goalUserId,
          })
        );
      });

      it("shoudlnt update an invalid entityType", async () => {
        const res = await request(app)
          .post(`/api/entities`)
          .send(civEntity)
          .expect(200);
        expect(Object.keys(res.body).length === 1);
        expect(res.body.id).toBeTruthy();
        entityId = Types.ObjectId(res.body.id);
        let foundEntity = await findOneByQuery("entities", {
          _id: entityId,
        });
        expect(foundEntity).toEqual(
          expect.objectContaining({
            firstName: "Tommy",
            lastName: "Afek",
            entityType: entityTypes.Civilian,
          })
        );
        const updateData = {
          entityType: "agg",
          personalNumber: "123456",
        };
        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData)
          .expect(400);
      });
      describe(`valid aka unit update`, () => {
        it(`Primary belongs to new aka source map`, async () => {
          const soldEntity = {
            firstName: "Noam",
            entityType: entityTypes.Soldier,
            lastName: "Shiloni",
            personalNumber: "8517714",
            identityCard: `206917817`,
            serviceType: serviceTypes[0],
            rank: ranks[0],
            sex: sexes.Male,
            phone: "09-8651414",
            mobilePhone: "054-7340538",
            akaUnit: "sf1",
            pictures: {
              profile: {
                meta: {
                  path: "he",
                  format: "he",
                  updatedAt: new Date(),
                },
              },
            },
          };
          const esDI = {
            type: "domainUser",
            source: es_name_source,
            mail: `you@${esDomain}`,
            uniqueId: `uniqueId@${esDomain}`,
            isRoleAttachable: true,
          };
          const soufDI = {
            type: "domainUser",
            source: sf_name_source,
            mail: `you@${sfDomain}`,
            uniqueId: `uniqueId@${sfDomain}`,
            isRoleAttachable: true,
          };

          const resEntityCreate = await request(app)
            .post(`/api/entities`)
            .send(soldEntity)
            .expect(200);
          expect(Object.keys(resEntityCreate.body).length === 1);
          expect(resEntityCreate.body.id).toBeTruthy();
          const entityId = resEntityCreate.body.id;
          const resEsDICreate = await request(app)
            .post(`/api/digitalIdentities`)
            .send(esDI)
            .expect(200);
          const resSfDiCreate = await request(app)
            .post(`/api/digitalIdentities`)
            .send(soufDI)
            .expect(200);
          const resConnectES = await request(app)
            .put(`/api/entities/${entityId}/digitalIdentity/${esDI.uniqueId}`)
            .send()
            .expect(200);
          const resConnectSF = await request(app)
            .put(`/api/entities/${entityId}/digitalIdentity/${soufDI.uniqueId}`)
            .send()
            .expect(200);
          let foundDIEs = await findOneByQuery("digitalidentities", {
            uniqueId: `uniqueid@${esDomain}`,
          });
          expect(foundDIEs).toEqual(
            expect.objectContaining({
              entityId: Types.ObjectId(entityId),
            })
          );
          let foundDISf = await findOneByQuery("digitalidentities", {
            uniqueId: `uniqueid@${sfDomain}`,
          });
          expect(foundDISf).toEqual(
            expect.objectContaining({
              entityId: Types.ObjectId(entityId),
            })
          );

          const updateData = { akaUnit: "es1" };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(200);
          const foundEntity = await findOneByQuery("entities", {
            _id: Types.ObjectId(entityId),
          });
          expect(foundEntity.primaryDigitalIdentityId).toEqual(
            DigitalIdentityId.create(esDI.uniqueId)._unsafeUnwrap().toValue()
          );
        });
      });
    });

    describe(`INVALID update cases`, () => {
      beforeEach(async () => {
        try {
          await emptyDB();
        } catch (err) {
          console.log(err);
        }
      });
      describe(`shouldnt update personal number`, () => {
        beforeEach(async () => {
          try {
            await emptyDB();
          } catch (err) {
            console.log(err);
          }
        });
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
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const soldEntity2 = {
          firstName: "Noasm",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517715",
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651424",
          mobilePhone: "054-7340534",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        it(`invalid value personal number update`, async () => {
          const res = await request(app)
            .post(`/api/entities`)
            .send(soldEntity)
            .expect(200);
          let entityId = res.body.id;
          const updateData = { personalNumber: `8517713214` };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(400);
          expect(resUpdate.body.message).toEqual(
            expect.stringContaining(
              `invalid personal number: ${updateData.personalNumber}`
            )
          );
        });
        it(`personal number already exists update`, async () => {
          const res = await request(app)
            .post(`/api/entities`)
            .send(soldEntity)
            .expect(200);
          const res2 = await request(app)
            .post(`/api/entities`)
            .send(soldEntity2)
            .expect(200);

          let entityId = res.body.id;
          const updateData = {
            personalNumber: `${soldEntity2.personalNumber}`,
          };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(400);
          expect(resUpdate.body.message).toEqual(
            expect.stringContaining(
              `personal number: ${updateData.personalNumber} already belogns to another entity`
            )
          );
        });
      });

      describe(`shouldnt update identity card`, () => {
        beforeEach(async () => {
          try {
            await emptyDB();
          } catch (err) {
            console.log(err);
          }
        });
        const soldEntity = {
          firstName: "Noam",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517714",
          identityCard: `206917817`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const soldEntity2 = {
          firstName: "Noasm",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517715",
          identityCard: `211381371`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651424",
          mobilePhone: "054-7340534",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        it(`invalid value identity card update`, async () => {
          const res = await request(app)
            .post(`/api/entities`)
            .send(soldEntity)
            .expect(200);
          let entityId = res.body.id;
          const updateData = { identityCard: `2222222222` };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(400);
          expect(resUpdate.body.message).toEqual(
            expect.stringContaining(
              `invalid identity card: ${updateData.identityCard}`
            )
          );
        });
        it(`identity card already exists update`, async () => {
          const res = await request(app)
            .post(`/api/entities`)
            .send(soldEntity)
            .expect(200);
          const res2 = await request(app)
            .post(`/api/entities`)
            .send(soldEntity2)
            .expect(200);

          let entityId = res.body.id;
          const updateData = { identityCard: `${soldEntity2.identityCard}` };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(400);
          expect(resUpdate.body.message).toEqual(
            expect.stringContaining(
              `identity card: ${updateData.identityCard} already belogns to another entity`
            )
          );
        });
      });

      describe(`shouldnt update goal user id`, () => {
        beforeEach(async () => {
          try {
            await emptyDB();
          } catch (err) {
            console.log(err);
          }
        });
        const goalUserEntity = {
          firstName: "Noam",
          entityType: entityTypes.GoalUser,
          lastName: "Shiloni",
          goalUserId: `nolego@${gUserDomains[0]}`,
        };

        const goalUserEntity2 = {
          firstName: "Noam",
          entityType: entityTypes.GoalUser,
          lastName: "Shiloni",
          goalUserId: `nolego2@${gUserDomains[0]}`,
        };
        it(`invalid value goal user id update`, async () => {
          const res = await request(app)
            .post(`/api/entities`)
            .send(goalUserEntity)
            .expect(200);
          let entityId = res.body.id;
          const updateData = { goalUserId: `2222222222` };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(400);
          expect(resUpdate.body.message).toEqual(
            expect.stringContaining(
              `invalid digital identity unique id: ${updateData.goalUserId}`
            )
          );
        });
        it(`invalid goal user id already exists update`, async () => {
          const res = await request(app)
            .post(`/api/entities`)
            .send(goalUserEntity)
            .expect(200);
          const res2 = await request(app)
            .post(`/api/entities`)
            .send(goalUserEntity2)
            .expect(200);

          let entityId = res.body.id;
          const updateData = { goalUserId: `${goalUserEntity2.goalUserId}` };

          const resUpdate = await request(app)
            .patch(`/api/entities/${entityId}`)
            .send(updateData)
            .expect(400);
          expect(resUpdate.body.message).toEqual(
            expect.stringContaining(
              `GoalUser Id: ${updateData.goalUserId} already belogns to another entity`
            )
          );
        });
      });

      it(`invalid service type value update`, async () => {
        const soldEntity = {
          firstName: "Noam",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517714",
          identityCard: `206917817`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const res = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        const entityId = res.body.id;

        const updateData = { serviceType: "invalid service type" };

        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData)
          .expect(400);
        expect(resUpdate.body.message).toEqual(
          expect.stringContaining(
            `invalid service Type: ${updateData.serviceType}`
          )
        );
      });

      it(`invalid rank value update`, async () => {
        const soldEntity = {
          firstName: "Noam",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517714",
          identityCard: `206917817`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const res = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        const entityId = res.body.id;

        const updateData = { rank: "invalid rank type" };

        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData)
          .expect(400);
        expect(resUpdate.body.message).toEqual(
          expect.stringContaining(`invalid rank: ${updateData.rank}`)
        );
      });

      it(`invalid sex value update`, async () => {
        const soldEntity = {
          firstName: "Noam",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517714",
          identityCard: `206917817`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const res = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        const entityId = res.body.id;

        const updateData = { sex: "invalid sex type" };

        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData)
          .expect(400);
        expect(resUpdate.body.message).toEqual(
          expect.stringContaining(`${updateData.sex} is invalid Sex`)
        );
      });

      it(`invalid phone value update`, async () => {
        const soldEntity = {
          firstName: "Noam",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517714",
          identityCard: `206917817`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const res = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        const entityId = res.body.id;

        const updateData = { phone: "invalid phone type" };

        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData)
          .expect(400);
        expect(resUpdate.body.message).toEqual(
          expect.stringContaining(`invalid phone: ${updateData.phone}`)
        );
      });

      it(`invalid mobile phone value update`, async () => {
        const soldEntity = {
          firstName: "Noam",
          entityType: entityTypes.Soldier,
          lastName: "Shiloni",
          personalNumber: "8517714",
          identityCard: `206917817`,
          serviceType: serviceTypes[0],
          rank: ranks[0],
          sex: sexes.Male,
          phone: "09-8651414",
          mobilePhone: "054-7340538",
          pictures: {
            profile: {
              meta: {
                path: "he",
                format: "he",
                updatedAt: new Date(),
              },
            },
          },
        };
        const res = await request(app)
          .post(`/api/entities`)
          .send(soldEntity)
          .expect(200);
        const entityId = res.body.id;

        const updateData = { mobilePhone: "invalid mobile phone type" };

        const resUpdate = await request(app)
          .patch(`/api/entities/${entityId}`)
          .send(updateData)
          .expect(400);
        expect(resUpdate.body.message).toEqual(
          expect.stringContaining(
            `invalid mobile phone: ${updateData.mobilePhone}`
          )
        );
      });
    });
  });
};
