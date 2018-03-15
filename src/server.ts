import * as multer from 'multer';
import * as express from 'express';
import { graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as bodyParser from 'body-parser';

import { API_ENDPOINT, PORT } from './server.constants';
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

bootstrap();
