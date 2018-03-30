import * as glob from 'glob';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { createGraphQL } from './lib/convert';
import { getAllCollectionsData } from './lib/data.fetch';
import { DatabaseService } from './graphql/common/database.service';
import { BSON } from 'bson';

const graphqls = glob.sync(join('./**/*.graphql'));

export async function getDataOnFly(counter) {
  let data;
  if (counter === 0) {
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
