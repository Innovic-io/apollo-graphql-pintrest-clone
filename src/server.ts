import * as multer from 'multer';
import * as express from 'express';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';

import { API_ENDPOINT, API_VERSION, PORT } from './server.constants';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './typeDefs';
import * as bodyParser from 'body-parser';
import pinResolver from './graphql/pins/pin.resolver';
import userResolver from './graphql/user/user.resolver';
import boardResolver from './graphql/boards/board.resolver';
import scalarResolverFunctions from './graphql/scalars/scalars.resolver';

const schema = makeExecutableSchema({
  resolvers: [ pinResolver, userResolver, boardResolver, scalarResolverFunctions ],
  typeDefs,
});

async function bootstrap() {

  const app = express();

  app.use(bodyParser.json(), multer().any(), (req, res, next) => next());

  app.post(API_ENDPOINT, graphqlExpress({
      schema,
    }));

  app.get(`${API_ENDPOINT}/graphiql`, graphiqlExpress({ endpointURL: API_ENDPOINT }));

  await app.listen(+PORT || 3000);
}

bootstrap();
