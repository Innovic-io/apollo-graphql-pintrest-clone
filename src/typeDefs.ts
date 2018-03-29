import * as glob from 'glob';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { createGraphQL } from './lib/convert';
import { getAllCollectionsData } from './lib/data.fetch';
import { DatabaseService } from './graphql/common/database.service';
import { BSON } from 'bson';

const graphqls = (process.env.NODE_ENV === 'test') ?
  glob.sync(join('./**/*.graphql')) : glob.sync(join('./src/graphql/common/**/*.graphql'));

export const typeDefs = graphqls
  .map((item) => readFileSync(item).toString()).join('');

export async function getDataOnFly() {

  const data = await getLoadedData();

  return graphqls
    .map((item) => readFileSync(item).toString())
    .concat(createGraphQL(data))
    .join('');
}

async function getLoadedData() {
  const dataFileURL = join(__dirname, 'data.bson');

  if (!existsSync(dataFileURL)) {

    const database = await DatabaseService.getDB();

    const data = await getAllCollectionsData(database);
    writeFileSync(dataFileURL, new BSON().serialize(data));
    return data;
  } else {

    const dataFromBSON = new BSON().deserialize(readFileSync(dataFileURL));

    return Object.values(dataFromBSON);
  }
}
