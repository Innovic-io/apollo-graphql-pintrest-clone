import { Collection, ObjectID } from 'mongodb';

import { SERVICE_ENUM, USERS_ELEMENT, WRONG_ID_FORMAT_ERROR, WRONG_USERNAME_AND_PASSWORD } from './common.constants';
import UserService from '../user/user.service';
import IUser from '../user/user.interface';
import { DatabaseService } from './database.service';
import { comparePasswords, generateToken } from './cryptography';
import { getDataOnFly } from '../../typeDefs';
import { makeExecutableSchema } from 'graphql-tools';
import { IAuthorization } from '../../authorization/authorization.interface';
import { graphqlExpress } from 'apollo-server-express';
import scalarResolverFunctions from '../scalars/scalars.resolver';
import pinResolver from '../pins/pin.resolver';
import boardResolver from '../boards/board.resolver';
import userResolver from '../user/user.resolver';

let database;

DatabaseService
  .getDB()
  .then((value) => database = value);

/**
 * Make Object ID from id provided
 *
 * @param {string | ObjectID} id
 * @returns {ObjectID}
 */
export const createObjectID = (id?: string | ObjectID) => {

  if (!!id && !ObjectID.isValid(id)) {
    throw new Error(WRONG_ID_FORMAT_ERROR);
  }

  return new ObjectID(id);
};

/**
 *
 * Get one result from collection by elementKey
 *
 * @param {Collection} sentDatabase
 * @param {string} elementKey
 * @param searchValue
 *
 * @returns {Promise<Service>}
 */
export const findByElementKey = async <Service> (sentDatabase: Collection, elementKey: string, searchValue: any): Promise<Service> => {

  return await sentDatabase.findOne<Service>({ [ elementKey ]: searchValue });
};

/**
 * Call function for getting by ID from Service provided
 *
 * @param {ObjectID} _id
 * @param {SERVICE_ENUM} serviceName
 * @returns {Promise<any>}
 */
export const getServiceById = async <T> (_id: ObjectID, serviceName: SERVICE_ENUM): Promise<T> => {

  const db = await DatabaseService.getDB();
  return await db.collection(serviceName)
    .findOne<T>({ _id });
};

/**
 * Add value to user collection Array
 *
 * @param {ObjectID} creatorID
 * @param {ObjectID} value
 * @param {USERS_ELEMENT} type
 * @returns {Promise<IUser>}
 */
export const addCreator = async (creatorID: ObjectID, value: ObjectID, type: USERS_ELEMENT): Promise<IUser> => {

  const userService = await new UserService();

  return await userService.addToSet(creatorID, value, type);
};

/**
 * remove element from Array in user collection
 *
 * @param {ObjectID} userID
 * @param {ObjectID} valueToRemove
 * @param {USERS_ELEMENT} arrayName
 * @returns {Promise<IUser>}
 */
export const removeCreator = async (userID: ObjectID, valueToRemove: ObjectID, arrayName: USERS_ELEMENT): Promise<IUser> => {

  const userService = await new UserService();

  return await userService.removeFromSet(userID, valueToRemove, arrayName);
};

export const makeString = (receivedObject) => {
  return Object
    .keys(receivedObject)
    .map((objectKey) => `${objectKey}:"${receivedObject[ objectKey ]}"`)
    .join(',');
};

export const makeToken = async (user: IUser, password: string): Promise<string> => {

  if (!user || !await comparePasswords(password, user.salt, user.password)) {
    throw new Error(WRONG_USERNAME_AND_PASSWORD);
  }

  return await generateToken({ _id: user._id });
};

let readFromDatabase = false;
export const changeSchema = async (passedTypes?) => {
  const typeDefs = passedTypes || await getDataOnFly(readFromDatabase);
  readFromDatabase = !readFromDatabase;

  const schema = makeExecutableSchema({
    resolvers: [ pinResolver, userResolver, boardResolver, scalarResolverFunctions ],
    typeDefs,
  });

  return {
    middleware: graphqlExpress(
      (req) => Object.assign({
        schema,
        // tslint:disable-next-line
        context: req[ 'user' ] as IAuthorization,
      })),
    schema,
  };
};
