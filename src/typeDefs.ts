import * as glob from 'glob';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createFromDB } from 'm2gql';
import { BSON } from 'bson';

import { DATABASE_URI } from './server.constants';

const graphqls = glob.sync(join('./**/*.graphql'));

export async function getDataOnFly(companyID?: string) {
  let data;

  if (!companyID) {

    data = await getLoadedData();

  } else {

    data = await createFromDB(DATABASE_URI, '', '', companyID);

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
        writeFileSync(dataFileURL, new BSON().serialize(resultingData));
        return resultingData;
      });
  }
  const BSONResult = new BSON().deserialize(readFileSync(dataFileURL));

  return Object.values(BSONResult).join('');
}
