import * as multer from 'multer';
import * as express from 'express';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import * as dotenv from 'dotenv';

dotenv.config();

import mainResolver from './resolvers/pinterest.resolver';
import { API_ENDPOINT, API_VERSION, PORT, RESOURCE_NAME } from './constants';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './typeDefs';
import * as bodyParser from 'body-parser';

const schema = makeExecutableSchema({
  resolvers: [ mainResolver ],
  typeDefs: typeDefs,
});

async function bootstrap() {

  const resolvers = mainResolver;
  const app = express();
  app.use(bodyParser.json(), multer().any(), (req, res, next) => next());
  app.post(API_ENDPOINT, graphqlExpress({
      schema,
    }));

  app.get(`${API_ENDPOINT}/graphiql`, graphiqlExpress({ endpointURL: API_ENDPOINT })); // if you want GraphiQL enabled

  console.log('rumning');
  await app.listen(+PORT || 3000);
}

bootstrap();
