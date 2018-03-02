import * as glob from 'glob';

import { readFileSync } from 'fs';
import { join } from 'path';


const graphqls = glob.sync(join('/home/node/app/src/graphql/**/*.graphql'));

const typeDefs = graphqls.map((item) => readFileSync(item).toString()).join('');

export default typeDefs;
