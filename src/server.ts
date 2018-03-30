import * as multer from 'multer';
import * as express from 'express';
import { graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as bodyParser from 'body-parser';

import * as socketIo from 'socket.io';
import { join } from 'path';
import * as http from 'http';

import { API_ENDPOINT, PORT } from './server.constants';
import { getDataOnFly } from './typeDefs';
import pinResolver from './graphql/pins/pin.resolver';
import userResolver from './graphql/user/user.resolver';
import boardResolver from './graphql/boards/board.resolver';
import scalarResolverFunctions from './graphql/scalars/scalars.resolver';
import AuthorizationMiddleware from './authorization/authorization.middleware';
import { IAuthorization } from './authorization/authorization.interface';
import { DynamicMiddleware } from './authorization/dynamic.middleware';

export let socket;

const dinamic = new DynamicMiddleware();

async function bootstrap() {

  dinamic.replace(await changeSchema());
  const app = express();

  socket = socketIo(new http.Server(app).listen(PORT));
  app.use(bodyParser.json(),
    multer().any(),
    (req, res, next) => next());

  app.post(API_ENDPOINT,
    AuthorizationMiddleware,
    dinamic.handler(),
  );

  app.get('/', (request, response) => {
    response.sendFile(join(__dirname, '../client/index.html'));
  });
}

async function mainFunction() {
  if(process.env.NODE_ENV === 'test') {
    return;
  }

  await bootstrap();

  setTimeout(async () => {

    dinamic.replace(await changeSchema());
    },
    10000);
}
let counter = 0;
async function changeSchema() {

  const typeDefs = await getDataOnFly(counter++);
  const schema = makeExecutableSchema({
    resolvers: [ pinResolver, userResolver, boardResolver, scalarResolverFunctions ],
    typeDefs,
  });

  return graphqlExpress((req) => Object.assign({
    schema,
    // tslint:disable-next-line
    context: req['user'] as IAuthorization,
  }));
}

mainFunction();
