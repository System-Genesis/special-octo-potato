/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */

import * as mongoose from 'mongoose';
import conn from '../../shared/infra/mongoose/connection';

const dbConnection = conn;

// const allEntitiesDB = require('../../../mongo-seed/entityDNs');
// const allGroupsDB = require('../../../mongo-seed/organizationGroupsDNs');
// const allRolesDB = require('../../../mongo-seed/roleDNs');
// const allDIsDB = require('../../../mongo-seed/digitalIdentitiesDNs');

const createEntityFromMock = (mockEntity: any) => {
    return {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(mockEntity.createdAt),
        updatedAt: new Date(mockEntity.updatedAt),
        ...mockEntity,
    };
};
const createRoleFromMock = (mockEntity: any) => {
    return {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(mockEntity.createdAt),
        updatedAt: new Date(mockEntity.updatedAt),
        ...mockEntity,
    };
};
const createDIFromMock = (mockEntity: any) => {
    return {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(mockEntity.createdAt),
        updatedAt: new Date(mockEntity.updatedAt),
        ...mockEntity,
    };
};
const createGroupFromMock = (mockEntity: any) => {
    return {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(mockEntity.createdAt),
        updatedAt: new Date(mockEntity.updatedAt),
        ...mockEntity,
    };
};

export const seedCollection = async <T>(dataJson: any[], createFromMockFunc: (arg0: any) => any, dataModel: mongoose.Model<T>) => {
    const mappedData = dataJson.map((obj) => createFromMockFunc(obj));
    return dataModel.insertMany(mappedData);
};

export const seedDB = async () => {
    // await seedCollection(allEntitiesDB, createEntityFromMock, EntityModel);
    // await seedCollection(allRolesDB, createRoleFromMock, RoleModel);
    // await seedCollection(allGroupsDB, createGroupFromMock, GroupModel);
    // await seedCollection(allDIsDB, createDIFromMock, DigitalIdentityModel);
};

export const findByQuery = async (collectionName: string, query: Object) => {
    const collection = dbConnection.collection(collectionName);
    const res = await collection.find(query).toArray();
    return res;
};

export const findOneByQuery = async (collectionName: string, query: Object) => {
    const collection = dbConnection.collection(collectionName);
    const res = await collection.findOne(query);
    return res;
};
export const insert = async (collectionName: string, doc: Object) => {
    const collection = dbConnection.collection(collectionName);
    const res = await collection.insertOne(doc);
    return res;
};

export const emptyDB = async () => {
    const rolesCollection = dbConnection.collection('roles');
    const entitiesCollection = dbConnection.collection('entities');
    const groupsCollection = dbConnection.collection('groups');
    const digitalIdentitiesCollection = dbConnection.collection('digitalidentities');
    try {
        await rolesCollection.remove({});
        await entitiesCollection.remove({});
        await groupsCollection.remove({});
        await digitalIdentitiesCollection.remove({});
    } catch (err) {}
};

export const isEmptyDB = async () => {
    const rolesCollection = dbConnection.collection('roles');
    const entitiesCollection = dbConnection.collection('entities');
    const groupsCollection = dbConnection.collection('groups');
    const digitalIdentitiesCollection = dbConnection.collection('digitalIdentities');
    const EntityLength = await entitiesCollection.count({});
    const RoleLength = await rolesCollection.count({});
    const GroupLength = await groupsCollection.count({});
    const DigitalIdentityLength = await digitalIdentitiesCollection.count({});
    return EntityLength > 0 && RoleLength > 0 && GroupLength && DigitalIdentityLength > 0;
};
