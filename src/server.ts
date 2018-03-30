import * as multer from 'multer';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as socketIo from 'socket.io';
import { join } from 'path';
import * as http from 'http';

import { API_ENDPOINT, GRAPHQL_MIDDLEWARE, PORT } from './server.constants';
import AuthorizationMiddleware from './authorization/authorization.middleware';
import { changeSchema } from './graphql/common/helper.functions';

export let socket;

async function bootstrap() {

  GRAPHQL_MIDDLEWARE.replace(await changeSchema());
  const app = express();

  socket = socketIo(new http.Server(app).listen(PORT));

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
/*
    app.get('/graphi', graphiqlExpress({
      endpointURL: API_ENDPOINT
    }));
*/
}

async function mainFunction() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  await bootstrap();

//  setTimeout(async () => {

  //    GRAPHQL_MIDDLEWARE.replace(await changeSchema());
  //  },
  //  10000);
}

mainFunction();
