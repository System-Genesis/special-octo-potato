import { emptyDB, findByQuery, findOneByQuery } from '../setup/seedUtils';
import request from 'supertest';
import { Types } from 'mongoose';
import config from 'config';
import { app } from '../../shared/infra/http/app';
import * as mongodb from 'mongodb';
import { server } from './entity.integration.test';

const entityTypes: {
    Soldier: string;
    Civilian: string;
    GoalUser: string;
    External: string;
} = config.get('valueObjects.EntityType');

const gUserDomains: string[] = config.get('valueObjects.digitalIdentityId.domain.values');
const organizations: string[] = config.get('valueObjects.organizations.values');
const serviceTypes: string[] = config.get('valueObjects.serviceType.values');
const ranks: string[] = config.get('valueObjects.rank.values');
const sexes: {
    Male: string;
    Female: string;
} = config.get('valueObjects.Sex');
const digitalIdentityIdDomains: string[] = config.get('valueObjects.digitalIdentityId.domain.values');

beforeEach(async () => {
    try {
        await emptyDB();
    } catch (err) {
        console.log(err);
    }
});

export const testCreateEntity = () => {
    describe('ENTITY CREATE USECASES', () => {
        describe('VALID CREATIONS USECASES', () => {
            const civEntity = {
                firstName: 'Tommy',
                entityType: entityTypes.Civilian,
                lastName: 'Afek',
                identityCard: '206917817',
            };
            let entityId;
            it('create a VALID civilian entity', async () => {
                const civEntity2 = { ...civEntity };
                civEntity2.identityCard = '039341136';
                const res = await request(app).post(`/api/entities`).send(civEntity2).expect(200);
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                entityId = Types.ObjectId(res.body.id);
                const foundEntity = await findOneByQuery('entities', {
                    _id: entityId,
                });
                expect(foundEntity).toEqual(
                    expect.objectContaining({
                        firstName: 'Tommy',
                        lastName: 'Afek',
                        entityType: entityTypes.Civilian,
                        identityCard: '39341136',
                    }),
                );
            });
            it('create a VALID civilian entity', async () => {
                const res = await request(app).post(`/api/entities`).send(civEntity).expect(200);
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                entityId = Types.ObjectId(res.body.id);
                const foundEntity = await findOneByQuery('entities', {
                    _id: entityId,
                });
                expect(foundEntity).toEqual(
                    expect.objectContaining({
                        firstName: 'Tommy',
                        lastName: 'Afek',
                        entityType: entityTypes.Civilian,
                    }),
                );
            });
            // TODO: organize all entities to another file
            const soldEntity = {
                firstName: 'Noam',
                entityType: entityTypes.Soldier,
                lastName: 'Shiloni',
                personalNumber: '8517714',
                serviceType: serviceTypes[0],
                rank: ranks[0],
                sex: sexes.Male,
                phone: '09-8651414',
                mobilePhone: '054-7340538',
                pictures: {
                    profile: {
                        meta: {
                            path: 'he',
                            format: 'he',
                            updatedAt: new Date(),
                        },
                    },
                },
            };
            it('create a VALID soldier entity', async () => {
                const res = await request(app).post(`/api/entities`).send(soldEntity).expect(200);
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                entityId = Types.ObjectId(res.body.id);
                const foundEntity = await findOneByQuery('entities', {
                    _id: entityId,
                });
                expect(foundEntity).toEqual(
                    expect.objectContaining({
                        firstName: 'Noam',
                        lastName: 'Shiloni',
                        entityType: entityTypes.Soldier,
                        personalNumber: '8517714',
                        serviceType: serviceTypes[0],
                        rank: ranks[0],
                        sex: sexes.Male,
                        phone: ['098651414'],
                        mobilePhone: ['0547340538'],
                    }),
                );
            });

            const goalUserEntity = {
                firstName: 'Noam',
                entityType: entityTypes.GoalUser,
                lastName: 'Shiloni',
                personalNumber: '8517714',
                goalUserId: `nolego@${gUserDomains[0]}`,
            };
            it('create a VALID goaluser entity', async () => {
                const res = await request(app).post(`/api/entities`).send(goalUserEntity).expect(200);
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                entityId = Types.ObjectId(res.body.id);
                const foundEntity = await findOneByQuery('entities', {
                    _id: entityId,
                });
                expect(foundEntity).toEqual(
                    expect.objectContaining({
                        firstName: 'Noam',
                        lastName: 'Shiloni',
                        entityType: entityTypes.GoalUser,
                        personalNumber: '8517714',
                        goalUserId: `nolego@${gUserDomains[0]}`,
                    }),
                );
            });

            const employeeOrgEntity = {
                firstName: 'Noam',
                entityType: entityTypes.External,
                lastName: 'Shiloni',
                employeeNumber: '321412',
                organization: organizations[0],
            };
            it('create a VALID employee org entity', async () => {
                const res = await request(app).post(`/api/entities`).send(employeeOrgEntity).expect(200);
                expect(Object.keys(res.body).length === 1);
                expect(res.body.id).toBeTruthy();
                entityId = Types.ObjectId(res.body.id);
                const foundEntity = await findOneByQuery('entities', {
                    _id: entityId,
                });
                expect(foundEntity).toEqual(
                    expect.objectContaining({
                        firstName: 'Noam',
                        lastName: 'Shiloni',
                        entityType: entityTypes.External,
                        employeeNumber: '321412',
                        organization: organizations[0],
                    }),
                );
            });
        });
        describe('INVALID CREATIONS', () => {
            const soldInvalidEntityType = {
                firstName: 'noam',
                entityType: 'not good entity type',
                personalNumber: '8517714',
            };
            it('Invalid by entity type error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldInvalidEntityType).expect(400);
                // TODO: map error titles / find out the called error
                expect(res.body.message).toEqual(expect.stringContaining(`not good entity type is invalid EntityType`));
            });

            const soldInvalidPersonalNumberValue = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714321321',
            };
            let soldInvalidPersonalNumberExisted = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714',
            };
            describe('Invalid by personal number error', () => {
                beforeEach(async () => {
                    try {
                        await emptyDB();
                    } catch (err) {
                        console.log(err);
                    }
                });
                it('Invalid value object error', async () => {
                    const res = await request(app).post(`/api/entities`).send(soldInvalidPersonalNumberValue).expect(400);
                    expect(res.body.message).toEqual(expect.stringContaining(`invalid personal number: 8517714321321`));
                });
                it('already existed error', async () => {
                    await request(app).post(`/api/entities`).send(soldInvalidPersonalNumberExisted).expect(200);
                    const res = await request(app).post(`/api/entities`).send(soldInvalidPersonalNumberExisted).expect(400);
                    expect(res.body.message).toEqual(
                        expect.stringContaining(
                            `personal number: ${soldInvalidPersonalNumberExisted.personalNumber} already belogns to another entity`,
                        ),
                    );
                });
            });

            const civInvalidIDValue = {
                firstName: 'noam',
                entityType: entityTypes.Civilian,
                identityCard: '8517714321321',
            };
            let civInvalidIDExisted = {
                firstName: 'noam',
                entityType: entityTypes.Civilian,
                identityCard: '206917817',
            };
            describe('Invalid by identity card error', () => {
                beforeEach(async () => {
                    try {
                        await emptyDB();
                    } catch (err) {
                        console.log(err);
                    }
                });
                it('Invalid value object error', async () => {
                    const res = await request(app).post(`/api/entities`).send(civInvalidIDValue).expect(400);
                    expect(res.body.message).toEqual(expect.stringContaining(`invalid identity card: 8517714321321`));
                });
                it('already existed error', async () => {
                    await request(app).post(`/api/entities`).send(civInvalidIDExisted).expect(200);
                    const res = await request(app).post(`/api/entities`).send(civInvalidIDExisted).expect(400);
                    expect(res.body.message).toEqual(
                        expect.stringContaining(`identity card: ${civInvalidIDExisted.identityCard} already belogns to another entity`),
                    );
                });
            });

            const civInvalidGoalUserIdValue = {
                firstName: 'noam',
                entityType: entityTypes.Civilian,
                identityCard: '206917817',
                goalUserId: `312${digitalIdentityIdDomains[0]}321`,
            };
            let civInvalidGoalUserIdExisted = {
                firstName: 'noam',
                entityType: entityTypes.GoalUser,
                goalUserId: `312@${digitalIdentityIdDomains[0]}`,
            };
            describe('Invalid by goal user id error', () => {
                beforeEach(async () => {
                    try {
                        await emptyDB();
                    } catch (err) {
                        console.log(err);
                    }
                });
                it('Invalid value object error', async () => {
                    const res = await request(app).post(`/api/entities`).send(civInvalidGoalUserIdValue).expect(400);
                    expect(res.body.message).toEqual(
                        expect.stringContaining(`invalid digital identity unique id: ${civInvalidGoalUserIdValue.goalUserId}`),
                    );
                });
                it('already existed error', async () => {
                    await request(app).post(`/api/entities`).send(civInvalidGoalUserIdExisted).expect(200);
                    const res = await request(app).post(`/api/entities`).send(civInvalidGoalUserIdExisted).expect(400);
                    expect(res.body.message).toEqual(
                        expect.stringContaining(`GoalUser Id: ${civInvalidGoalUserIdExisted.goalUserId} already belogns to another entity`),
                    );
                });
            });

            const externalEntityNoOrg = {
                firstName: 'noam',
                entityType: entityTypes.External,
                employeeNumber: '21321',
            };
            const externalEntityInvalidOrg = {
                firstName: 'noam',
                entityType: entityTypes.External,
                employeeNumber: '21321',
                organization: 'haha',
            };
            const externalEntityInvalidEmpNumber = {
                firstName: 'noam',
                entityType: entityTypes.External,
                employeeNumber: '32',
                organization: organizations[0],
            };
            const externalEntityAlreadyExisted = {
                firstName: 'noam',
                entityType: entityTypes.External,
                employeeNumber: '323123',
                organization: organizations[0],
            };
            describe('Invalid by external user error', () => {
                beforeEach(async () => {
                    try {
                        await emptyDB();
                    } catch (err) {
                        console.log(err);
                    }
                });
                it('Missing organization value error', async () => {
                    const res = await request(app).post(`/api/entities`).send(externalEntityNoOrg).expect(400);
                    expect(res.body.message).toEqual(expect.stringContaining(`Employee creation must supply organization`));
                });
                it('Invalid organization value error', async () => {
                    const res = await request(app).post(`/api/entities`).send(externalEntityInvalidOrg).expect(400);
                    expect(res.body.message).toEqual(expect.stringContaining(`Invalid organization ${externalEntityInvalidOrg.organization}`));
                });
                it('Employee number value error', async () => {
                    const res = await request(app).post(`/api/entities`).send(externalEntityInvalidEmpNumber).expect(400);
                    expect(res.body.message).toEqual(
                        expect.stringContaining(`invalid employee id: ${externalEntityInvalidEmpNumber.employeeNumber}`),
                    );
                });
                it('already existed error', async () => {
                    await request(app).post(`/api/entities`).send(externalEntityAlreadyExisted).expect(200);
                    const res = await request(app).post(`/api/entities`).send(externalEntityAlreadyExisted).expect(400);
                    expect(res.body.message).toEqual(
                        expect.stringContaining(
                            `Employee Number: ${externalEntityAlreadyExisted.employeeNumber} already belogns to another entity in organization ${externalEntityAlreadyExisted.organization}`,
                        ),
                    );
                });
            });

            const soldInvalidServiceType = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714',
                serviceType: 'you are haha',
            };
            it('Invalid by service type error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldInvalidServiceType).expect(400);
                expect(res.body.message).toEqual(expect.stringContaining(`invalid service Type: ${soldInvalidServiceType.serviceType}`));
            });

            const soldInvalidRank = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714',
                rank: `invalid rank`,
            };
            it('Invalid by rank error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldInvalidRank).expect(400);
                expect(res.body.message).toEqual(expect.stringContaining(`invalid rank: ${soldInvalidRank.rank}`));
            });

            const soldInvalidSex = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714',
                sex: `invalid sex`,
            };
            it('Invalid by sex error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldInvalidSex).expect(400);
                expect(res.body.message).toEqual(expect.stringContaining(`${soldInvalidSex.sex} is invalid Sex`));
            });

            const soldInvalidPhone = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714',
                phone: `050321`,
            };
            it('Invalid by phone error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldInvalidPhone).expect(400);
                expect(res.body.message).toEqual(expect.stringContaining(`invalid phone: ${soldInvalidPhone.phone}`));
            });

            const soldInvalidMobilePhone = {
                firstName: 'noam',
                entityType: entityTypes.Soldier,
                personalNumber: '8517714',
                mobilePhone: `050430`,
            };
            it('Invalid by mobile phone error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldInvalidMobilePhone).expect(400);
                expect(res.body.message).toEqual(expect.stringContaining(`invalid mobile phone: ${soldInvalidMobilePhone.mobilePhone}`));
            });

            const soldEntityInvalidState = {
                firstName: 'Noam',
                entityType: entityTypes.Soldier,
                lastName: 'Shiloni',
                serviceType: serviceTypes[0],
                rank: ranks[0],
                sex: sexes.Male,
                phone: '09-8651414',
                mobilePhone: '054-7340538',
            };
            it('Invalid by entity or error(forbidden), error', async () => {
                const res = await request(app).post(`/api/entities`).send(soldEntityInvalidState).expect(400);
                expect(res.body.message).toEqual(expect.stringContaining(`${entityTypes.Soldier} missing required field: personalNumber`));
            });
        });
    });
};
