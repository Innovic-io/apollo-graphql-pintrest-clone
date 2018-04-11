import { Collection, ObjectID } from 'mongodb';
import { graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import { SERVICE_ENUM, USERS_ELEMENT, WRONG_ID_FORMAT_ERROR, WRONG_USERNAME_AND_PASSWORD } from './common.constants';
import { IUser, IUserResolver, IUserService } from '../graphql/user/user.interface';
import { comparePasswords, generateToken } from './cryptography';
import { getDataOnFly } from '../typeDefs';
import { IAuthorization } from '../authorization/authorization.interface';
import { rootContainer } from '../inversify/inversify.config';
import { RESOLVER_TYPES, SERVICE_TYPES } from '../inversify/inversify.types';
import { IDatabaseService } from '../database/interfaces/database.interface';
import { IBoardResolver } from '../graphql/boards/board.interface';
import { IScalarsResolver } from '../graphql/scalars/scalars.interface';
import { IPinResolver } from '../graphql/pins/pin.interface';

const userService = rootContainer.get<IUserService>(SERVICE_TYPES.UserService);

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

  const db = await rootContainer
    .get<IDatabaseService>(SERVICE_TYPES.DatabaseService)
    .getDB();

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

export const changeSchema = async () => {
  const resolvers = [
    rootContainer.get<IUserResolver>(RESOLVER_TYPES.UserResolver).getAll(),
    rootContainer.get<IBoardResolver>(RESOLVER_TYPES.BoardResolver).getAll(),
    rootContainer.get<IPinResolver>(RESOLVER_TYPES.PinResolver).getAll(),
    rootContainer.get<IScalarsResolver>(RESOLVER_TYPES.ScalarResolver).getAll(),
  ];
  return graphqlExpress(
    async (req: any) => {

      const schema = await makeSchemaOnFly(req.headers.company, resolvers);
      return Object.assign({
        schema,
        context: req.user as IAuthorization,
      });
    },
  );
};

const makeSchemaOnFly = async (companyID, resolvers) => {
  const typeDefs = await getDataOnFly(companyID);

  return makeExecutableSchema({
    resolvers,
    typeDefs,
  });
};
