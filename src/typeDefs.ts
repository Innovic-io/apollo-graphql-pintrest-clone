import * as glob from 'glob';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createFromDB } from 'mongodb-to-graphql2';

import { DATABASE_URI } from './server.constants';

const graphqls = glob.sync(join('./**/*.graphql'));

export async function getDataOnFly(readFromDatabase: boolean) {
  let data;

  if (!readFromDatabase) {

    data = await getLoadedData();

  } else {

    data = await createFromDB(DATABASE_URI);

  }
  return graphqls
    .map((item) => readFileSync(item).toString())
    .concat(data)
    .join('');
}

async function getLoadedData() {
  const dataFileURL = join(__dirname, 'data.bson');

  if (!existsSync(dataFileURL)) {

    return await createFromDB(DATABASE_URI)
      .then((resultingData) => {
        writeFileSync(dataFileURL, resultingData);
        return resultingData;
      });
  }
  return readFileSync(dataFileURL);
}
