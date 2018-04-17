import * as multer from 'multer';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as socketIo from 'socket.io';
import { join } from 'path';
import { Server } from 'http';

import { API_ENDPOINT, GRAPHQL_MIDDLEWARE, PORT } from './server.constants';
import AuthorizationMiddleware from './authorization/authorization.middleware';
import {changeSchema, getAllServices} from './common/helper.functions';

export let socket: socketIo.Server;

async function bootstrap() {

  await getAllServices();

  const changedSchema = await changeSchema();
  GRAPHQL_MIDDLEWARE.replace(changedSchema);

  const app = express();
  const server = new Server(app)
    .listen(PORT);

  socket = socketIo(server);

  app.use(bodyParser.json(),
    multer().any(),
    (req, res, next) => next());

  app.post(API_ENDPOINT,
    AuthorizationMiddleware,
    GRAPHQL_MIDDLEWARE.handler(),
  );

  app.get('/', (request, response) => {
    response.sendFile(join(__dirname, '../client/index.html'));
  });
}

async function mainFunction() {

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  await bootstrap();
}

mainFunction();
