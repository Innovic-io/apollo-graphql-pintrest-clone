import * as glob from 'glob';

import { readFileSync } from 'fs';
import { join } from 'path';

import { createGraphQL } from './lib/convert';
import { getAllCollectionsData } from './lib/data.fetch';
import { DatabaseService } from './graphql/common/database.service';

const graphqls = (process.env.NODE_ENV === 'test') ?
  glob.sync(join('./**/*.graphql')) : glob.sync(join('./src/graphql/common/**/*.graphql'));

export const typeDefs = graphqls
  .map((item) => readFileSync(item).toString()).join('');

export async function getDataOnFly() {

  const database = await DatabaseService.getDB();

  const data = await getAllCollectionsData(database);

  return graphqls
    .map((item) => readFileSync(item).toString())
    .concat(createGraphQL(data))
    .join('');
}
