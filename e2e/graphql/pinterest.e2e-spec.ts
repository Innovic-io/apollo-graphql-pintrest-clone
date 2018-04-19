import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'supertest';
import 'jest';

import {
  API_ENDPOINT,
  FULL_PINTEREST,
  GRAPHQL_MIDDLEWARE,
  AVAILABLE_SERVICES
} from '../../src/server.constants';
import { IAuthorization } from '../../src/authorization/authorization.interface';
import AuthorizationMiddleware from '../../src/authorization/authorization.middleware';
import { decodeToken } from '../../src/common/cryptography';
import {
  changeSchema,
  getAllServices,
  makeString
} from '../../src/common/helper.functions';
import { IPin } from '../../src/graphql/pins/pin.interface';
import { IBoard } from '../../src/graphql/boards/board.interface';
import * as helpers  from './e2e.tests.helper';

jest.setTimeout(10000);

describe('Pinterest ', () => {
  let db;

  let token;
  let secondToken;
  let boardID;
  let pinID;
  let userID;

  const server = express()
    .use(bodyParser.json(), (req, res, next) => next())
    .post(API_ENDPOINT, AuthorizationMiddleware, GRAPHQL_MIDDLEWARE.handler());

  beforeAll(async () => {
    await getAllServices();
    const resultingSchema = await changeSchema();
    GRAPHQL_MIDDLEWARE.replace(resultingSchema);

    db = AVAILABLE_SERVICES.DatabaseService;

    db.dropDatabase();
  });

  afterAll(() => {
    db.dropDatabase();
  });

  it('should create User', async () => {
    const command = 'createUser';
    const body = {
      query: `mutation {${command}(${makeString(helpers.userObject)})}`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .expect(200);
    token = resource.body.data[command];

    expect(typeof resource.body.data[command]).toBe('string');
  });

  it('should create second User', async () => {
    const command = 'createUser';
    const body = {
      query: `mutation {${command}(${makeString(helpers.secondUserObject)})}`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .expect(200);
    secondToken = resource.body.data[command];

    expect(typeof resource.body.data[command]).toBe('string');
  });

  it('login user', async done => {
    const command = 'loginUser';
    const body = {
      query: `mutation {${command}(${makeString(helpers.loginUserObject)})}`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .expect(200);

    const decodedLogin = decodeToken(
      resource.body.data[command]
    ) as IAuthorization;
    const decodedSignup = decodeToken(token) as IAuthorization;

    expect(typeof resource.body.data[command]).toBe('string');
    expect(decodedLogin._id).toEqual(decodedSignup._id);
    expect(decodedLogin.exp).toBeCloseTo(decodedLogin.exp);

    helpers.header.authorization = `Bearer ${token}`;
    done();
  });

  it('should create board', async () => {
    const command = 'createBoard';
    const body = {
      query: `mutation { ${command}(${makeString(helpers
        .boardObject)})${helpers.boardQuery(' creator { _id }')} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingBoard = resource.body.data[command];

    boardID = resultingBoard ._id;
    userID = resultingBoard.creator._id;
    helpers.setBoadID(boardID);

    helpers.checkBoard(resultingBoard);
    });

  it('should create Pin', async () => {
    const command = 'createPin';
    const body = {
      query: `mutation { ${command}(board: "${boardID}", ${makeString(
        helpers.pinObject
      )}) ${helpers.pinQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    pinID = resource.body.data[command]._id;
    const resultingPin = resource.body.data[command];
    helpers.checkPin(resultingPin);
  });

  it('should get board by ID', async () => {
    const command = 'getBoard';

    const body = {
      query: `{ ${command}(_id  : "${boardID}") ${helpers.boardQuery()}}`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingBoard = resource.body.data[command];
    helpers.checkBoard(resultingBoard);
  });

  it('should get pin by ID', async () => {
    const command = 'getPin';

    const body = {
      query: `{ ${command}(_id: "${pinID}") ${helpers.pinQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingPin = resource.body.data[command];
    helpers.checkPin(resultingPin);
  });

  it('should update pin by ID', async () => {
    const command = 'updatePin';
    const note = 'some New note';

    const body = {
      query: `mutation { ${command}(_id: "${pinID}",
      note: "${note}") ${helpers.pinQuery('note')}
      }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingPin = resource.body.data[command];
    helpers.checkPin(resultingPin);
    expect(resultingPin.note).toEqual(note);
  });

  it('should get user pins', async () => {
    const command = 'getUserPins';

    const body = {
      query: `{ ${command} ${helpers.pinQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const [resultingPin] = resource.body.data[command];
    helpers.checkPin(resultingPin);
  });

  it('should get user boards', async () => {
    const command = 'getUserBoards';

    const body = {
      query: `{ ${command} ${helpers.boardQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    expect(resource.body.data[command] instanceof Array)
      .toBe(true);
    const [resultingBoard] = resource.body.data[command];

    helpers.checkBoard(resultingBoard);
  });

  it('should get pins from board', async () => {
    const command = 'getPinsFromBoard';

    const body = {
      query: `{ ${command} (boardID: "${boardID}") ${helpers.pinQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    expect(resource.body.data[command] instanceof Array)
      .toBe(true);
    expect(resource.body.data[command].length).toBe(1);

    const [resultingPin] = resource.body.data[command];

    helpers.checkPin(resultingPin);
  });

  it("should follow board", async () => {
    const command = 'followBoard';
    const followers = ' followers { username first_name last_name }';
    const body = {
      query: `mutation { ${command}(_id: "${boardID}") ${helpers
        .boardQuery(followers)} }`
    };
    const header = {...helpers.header, authorization: `Bearer ${secondToken}`}
    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingBoard = resource.body.data[command];

    helpers.checkBoard(resultingBoard);

    expect(resultingBoard.followers.length).toBe(2);
    helpers.checkUser(resultingBoard.followers[0]);
    helpers.checkUser(resultingBoard.followers[1], true);
  });

  it("should follow user", async () => {
    const command = 'followUser';
    const followers = ' following { username first_name last_name }';
    const body = {
      query: `mutation { ${command}(_id: "${userID}") ${helpers
        .userQuery(followers)} }`
    };
    const header = {...helpers.header, authorization: `Bearer ${secondToken}`};
    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingUser = resource.body.data[command];

    helpers.checkUser(resultingUser, true);

    expect(resultingUser.following.length).toBe(1);
    helpers.checkUser(resultingUser.following[0]);
  });

  it("should get all user followings", async () => {
    const command = 'getUserFollowings';
    const followers = ' following { username first_name last_name }';
    const body = {
      query: ` { ${command} ${helpers
        .userQuery(followers)} }`
    };
    const header = {...helpers.header, authorization: `Bearer ${secondToken}`};
    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const [ resultingUser ] = resource.body.data[command];

    helpers.checkUser(resultingUser);


  });

  it("should get all user followers", async () => {
    const command = 'getUserFollowers';
    const body = {
      query: ` { ${command} ${helpers
        .userQuery()} }`
    };
    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const [ resultingUser ] = resource.body.data[command];

    helpers.checkUser(resultingUser, true);
  });

  it("should stop following user", async () => {
    const command = 'stopFollowingUser';
    const followers = ' following { username first_name last_name }';
    const body = {
      query: `mutation { ${command}(_id: "${userID}") ${helpers
        .userQuery(followers)} }`
    };

    const header = {...helpers.header, authorization: `Bearer ${secondToken}`};
    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    const resultingUser = resource.body.data[command];

    helpers.checkUser(resultingUser, true);
    expect(resultingUser.following).toBe(null);
  });

  it("should get all user followings after stop", async () => {
    const command = 'getUserFollowings';
    const followers = ' following { username first_name last_name }';
    const body = {
      query: ` { ${command} ${helpers
        .userQuery(followers)} }`
    };
    const header = {...helpers.header, authorization: `Bearer ${secondToken}`};
    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(header)
      .expect(200);

    expect(resource.body.data[command]).toBeNull();
  });

  it('should get board following', async () => {
    const command = 'getBoardFollowing';

    const body = {
      query: `{ ${command} ${helpers.boardQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    expect(resource.body.data[command] instanceof Array)
      .toBe(true);
    expect(resource.body.data[command].length).toBe(1);

    const [resultingBoard] = resource.body.data[command];

    helpers.checkBoard(resultingBoard);
  });

  it('should get board followers', async () => {
    const command = 'getBoardFollowers';

    const body = {
      query: `{ ${command} (boardID: "${boardID}") ${helpers.userQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    expect(resource.body.data[command] instanceof Array)
      .toBe(true);
    expect(resource.body.data[command].length).toBe(2);

    const [resultingUser, secondUser ] = resource.body.data[command];

    helpers.checkUser(resultingUser);
    helpers.checkUser(secondUser, true);
  });

  it('should stop board following', async () => {
    const command = 'stopFollowingBoard';

    const followers = 'followers { username first_name last_name }';
    const body = {
      query: `mutation { ${command} (_id: "${boardID}") ${helpers
        .boardQuery(followers)} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingBoard = resource.body.data[command];

    helpers.checkBoard(resultingBoard);
    expect(resultingBoard.followers.length).toBe(1);
    helpers.checkUser(resultingBoard.followers[0], true);

  });

  it('should get board followers after stop follow', async () => {
    const command = 'getBoardFollowers';

    const body = {
      query: `{ ${command} (boardID: "${boardID}") ${helpers.userQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    expect(resource.body.data[command] instanceof Array)
      .toBe(true);
    expect(resource.body.data[command].length).toBe(1);

    const [resultingUser ] = resource.body.data[command];

    helpers.checkUser(resultingUser, true);
  });

  it('should update board by ID', async () => {
    const command = 'updateBoard';
    const description = 'some New description';

    const body = {
      query: `mutation { ${command}(_id: "${boardID}",
      description: "${description}") ${ helpers.boardQuery('description') } }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingBoard = resource.body.data[command];
    helpers.checkBoard(resultingBoard);
    expect(resultingBoard.description).toEqual(description);

  });

  it('should get user by ID', async () => {
    const command = 'getUser';

    const body = {
      query: `{ ${command} ${helpers.userQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingUser = resource.body.data[command];
    const [resultPin]: IPin[] = resultingUser.pins;
    const [resultBoard]: IBoard[] = resultingUser.boards;

    expect(resultingUser.pins.length).toEqual(1);
    expect(resultPin.name).toEqual(helpers.pinObject.name);

    expect(resultingUser.boards.length).toEqual(1);
    expect(resultBoard.name).toEqual(helpers.boardObject.name);

    helpers.checkUser(resultingUser)
  });

  it('should delete pin by ID', async () => {
    const command = 'deletePin';

    const body = {
      query: `mutation { ${command} (_id: "${pinID}")${helpers.pinQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingPin = resource.body.data[command];
    helpers.checkPin(resultingPin);
  });

  it('should delete board by ID', async () => {
    const command = 'deleteBoard';

    const body = {
      query: `mutation { ${command} (_id: "${boardID}") ${helpers
        .boardQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingBoard = resource.body.data[command];
    helpers.checkBoard(resultingBoard);
  });

  it('should verify boards and pins are gone', async () => {
    const command = 'getUser';

    const body = {
      query: `{ ${command} ${helpers.userQuery()} }`
    };

    const resource = await request(server)
      .post(API_ENDPOINT)
      .send(body)
      .set(helpers.header)
      .expect(200);

    const resultingUser = resource.body.data[command];
    helpers.checkUser(resultingUser);
    expect(resultingUser.pins).toBeNull();
    expect(resultingUser.boards).toBeNull();

  });
});
