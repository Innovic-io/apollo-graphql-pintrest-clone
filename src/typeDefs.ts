import * as glob from 'glob';
import { BSON } from 'bson';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { createGraphQL } from './lib/convert';
import { getAllCollectionsData } from './lib/data.fetch';
import { DatabaseService } from './graphql/common/database.service';

const graphqls = glob.sync(join('./**/*.graphql'));

export async function getDataOnFly(readFromDatabase: boolean) {
  let data;
  if (!readFromDatabase) {

    data = await getLoadedData();
  } else {

    const database = await DatabaseService.getDB();
    data = await getAllCollectionsData(database);
  }

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
  }

  const dataFromBSON = new BSON().deserialize(readFileSync(dataFileURL));

  return Object.values(dataFromBSON);
}
