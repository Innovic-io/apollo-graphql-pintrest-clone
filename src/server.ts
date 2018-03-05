import * as multer from 'multer';
import * as express from 'express';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as bodyParser from 'body-parser';
import * as requestPromise from 'request-promise';

import { API_ENDPOINT, API_VERSION, MONITOR_NAME, PM2_PORT, PORT } from './server.constants';
import typeDefs from './typeDefs';
import pinResolver from './graphql/pins/pin.resolver';
import userResolver from './graphql/user/user.resolver';
import boardResolver from './graphql/boards/board.resolver';
import scalarResolverFunctions from './graphql/scalars/scalars.resolver';
import AuthorizationMiddleware from './authorization/authorization.middleware';
import { IAuthorization } from './authorization/authorization.interface';

const schema = makeExecutableSchema({
  resolvers: [ pinResolver, userResolver, boardResolver, scalarResolverFunctions ],
  typeDefs,
});

async function bootstrap() {

  const app = express();

  app.use(bodyParser.json(),
    multer().any(),
    (req, res, next) => next());

  await startMonitor(app);

  app.post(API_ENDPOINT,
    AuthorizationMiddleware,
    graphqlExpress((req) => Object.assign({
      schema,
      // tslint:disable-next-line
      context: req['user'] as IAuthorization,
    })),

  );

  await app.listen(+PORT || 3000);
}

function startMonitor(app) {
  app.get(`${API_ENDPOINT}/${MONITOR_NAME}`, async (req, res) => {
    const [ host ] = req.headers.host.split(':');

    return await requestPromise({
      uri: `${req.protocol.trim()}://${host}:${PM2_PORT}`,
    });
  });
}

bootstrap();
