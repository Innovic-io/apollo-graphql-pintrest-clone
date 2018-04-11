import * as glob from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createFromDB } from 'm2gql';

import { DATABASE_URI, DB_NAME, DB_TESTING, FULL_PINTEREST, TEST_DATABASE_URI } from './server.constants';

const graphqls = glob.sync(join('./**/*.graphql'));

let fetchedData;

export async function getDataOnFly(companyName?: string) {

  let databaseURI = DATABASE_URI;
  let data;

  if (process.env.NODE_ENV === 'test') {
    databaseURI = TEST_DATABASE_URI.replace(DB_TESTING, DB_NAME);

    if (!fetchedData) {
      companyName = companyName || FULL_PINTEREST;
      fetchedData = await createFromDB({databaseURI, companyName});
    }
  }

  data = fetchedData || await createFromDB({databaseURI, companyName});

  return graphqls
    .map((item) => readFileSync(item).toString())
    .concat(data)
    .join('');
}
