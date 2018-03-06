import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'supertest';
import { graphqlExpress } from 'apollo-server-express';

import { API_ENDPOINT } from '../../src/server.constants';
import { IAuthorization } from '../../src/authorization/authorization.interface';
import AuthorizationMiddleware from '../../src/authorization/authorization.middleware';
import { makeExecutableSchema } from 'graphql-tools';
import pinResolver from '../../src/graphql/pins/pin.resolver';
import boardResolver from '../../src/graphql/boards/board.resolver';
import typeDefs from '../../src/typeDefs';
import scalarResolverFunctions from '../../src/graphql/scalars/scalars.resolver';
import userResolver from '../../src/graphql/user/user.resolver';
import { DatabaseService } from '../../src/graphql/common/database.service';
import { makeString } from '../../src/graphql/common/helper.functions';
import IUser from '../../src/graphql/user/user.interface';
import IPin from '../../src/graphql/pins/pin.interface';
import IBoard from '../../src/graphql/boards/board.interface';

jest.setTimeout(100000);

describe('Pinterest ', () => {

  const schema = makeExecutableSchema({
    resolvers: [ pinResolver, userResolver, boardResolver, scalarResolverFunctions ],
    typeDefs,
  });

  let server;
  let token;
  let boardID;
  let pinID;

  const loginUserObject = { username: 'Username', password: 'password' };
  const userObject = {...loginUserObject, first_name: 'Mirko', last_name: 'Markovic' };

  const loginString = makeString(loginUserObject);

  const allUser =  makeString(userObject);

  const boardObject = {name: 'Unique Name',description: 'Board description'};
  const boardString = makeString(boardObject);

  const pinObject = { name: 'Unique name', note: 'Note for this pin' };
  const pinString = makeString(pinObject);

  let header = {authorization: ''};
  // @ts-ignore
  beforeAll( async () => {
    server = express()
        .post(
          API_ENDPOINT,
          bodyParser.json(),
          AuthorizationMiddleware,
          graphqlExpress((req) => Object.assign({ schema, context: req['user'] as IAuthorization }))
        );
      const db = await DatabaseService.getDB();
      db.dropDatabase();
    }
  );

  it('should create User', async () => {
    const command = 'createUser';
    const body = {
      query :`mutation {${command}(${allUser})}`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .expect(200);
    token = resource.body.data[command];

    expect(typeof resource.body.data[command]).toBe('string');
  });

  it('login user', async (done) => {
    const command = 'loginUser';
    const body = {
      query :`mutation {${command}(${loginString})}`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .expect(200);

    expect(typeof resource.body.data[command]).toBe('string');
    header.authorization = `Bearer ${token}`;
    done()
  });

  it('should create board', async () => {
    const command = 'createBoard';
    const body = {
      query :`mutation { ${command}(${boardString}) {
		_id name creator { username first_name } } }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    boardID = resource.body.data[command]._id;

    const resultingBoard = resource.body.data[command];

    expect(resultingBoard.creator.username).toEqual(userObject.username);
    expect(resultingBoard.creator.first_name).toEqual(userObject.first_name);
    expect(resultingBoard.name).toEqual(boardObject.name);
  });

  it('should create Pin', async () => {
    const command = 'createPin';
    const body = { query :
        `mutation { ${command}(board: "${boardID}", ${pinString}) 
          { 
            _id name created_at 
            board {  created_at description name} 
            creator { username first_name } 
          }
        }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    pinID = resource.body.data[command]._id;
    const resultingPin = resource.body.data[command];

    expect(resultingPin.creator.username).toEqual(userObject.username);
    expect(resultingPin.name).toEqual(pinObject.name);
    expect(resultingPin.board.name).toEqual(boardObject.name);
  });

  it('should get board by ID', async () => {
    const command = 'getBoard';

    const body = {
      query :`{ ${command}(_id  : "${boardID}") 
        { 
          _id name
          creator { username first_name } 
        } 
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingBoard = resource.body.data[command];

    expect(resultingBoard.creator.username).toEqual(userObject.username);
    expect(resultingBoard.creator.first_name).toEqual(userObject.first_name);
    expect(resultingBoard.name).toEqual(boardObject.name);
  });

  it('should get pin by ID', async () => {
    const command = 'getPin';

    const body = {
      query :`{ ${command}(_id: "${pinID}") 
        { 
          _id name
          creator { username first_name } 
          board { _id name }
        } 
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingPin = resource.body.data[command];

    expect(resultingPin.creator.username).toEqual(userObject.username);
    expect(resultingPin.creator.first_name).toEqual(userObject.first_name);
    expect(resultingPin.name).toEqual(pinObject.name);
    expect(resultingPin.board.name).toEqual(boardObject.name);
    expect(resultingPin.board._id).toEqual(boardID);
  });

  it('should get user by ID', async () => {
    const command = 'getUser';

    const body = {
      query :`{ ${command} 
        { 
          username first_name last_name
          pins { name _id }
          boards { name _id }  
        } 
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingUser = resource.body.data[command];
    const [ resultPin ]: IPin[] = resultingUser.pins;
    const [ resultBoard ]: IBoard[] = resultingUser.boards;

    expect(resultingUser.pins.length).toEqual(1);
    expect(resultPin.name).toEqual(pinObject.name);

    expect(resultingUser.boards.length).toEqual(1);
    expect(resultBoard.name).toEqual(boardObject.name);

    expect(resultingUser.first_name).toEqual(userObject.first_name);
    expect(resultingUser.last_name).toEqual(userObject.last_name);
  });

  it('should delete pin by ID', async () => {
    const command = 'deletePin';

    const body = {
      query :`mutation { ${command} (_id: "${pinID}")
        { 
          name note
          board { name }
          creator { username first_name last_name }   
        } 
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingPin = resource.body.data[command];
    const creator: IUser = resultingPin.creator;
    const board: IBoard = resultingPin.board;

    expect(resultingPin.name).toEqual(pinObject.name);

    expect(board.name).toEqual(boardObject.name);

    expect(creator.first_name).toEqual(userObject.first_name);
    expect(creator.last_name).toEqual(userObject.last_name);
  });

  it('should delete board by ID', async () => {
    const command = 'deleteBoard';

    const body = {
      query :`mutation { ${command} (_id: "${boardID}")
        { 
          name description
          creator { username first_name last_name }   
        } 
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingBoard = resource.body.data[command];
    const creator: IUser = resultingBoard.creator;

    expect(resultingBoard.name).toEqual(boardObject.name);

    expect(creator.first_name).toEqual(userObject.first_name);
    expect(creator.last_name).toEqual(userObject.last_name);
  });

  it('should verify boards and pins are gone', async () => {
    const command = 'getUser';

    const body = {
      query :`{ ${command}
        { 
          username first_name last_name
          pins { name _id }
          boards { name _id }  
        } 
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingUser = resource.body.data[command];

    expect(resultingUser.pins).toBe(null);
    expect(resultingUser.boards).toBe(null);

    expect(resultingUser.first_name).toEqual(userObject.first_name);
    expect(resultingUser.last_name).toEqual(userObject.last_name);
  });
});
