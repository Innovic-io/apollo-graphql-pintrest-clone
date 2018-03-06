import { config } from 'dotenv';

config();

process.env.IMPORT_DATA = 'FALSE';

// if process is not run in DOCKER enviroment
// use localhost to mongodb connection
if (!process.env.DOCKER) {
  process.env.DB_HOST = 'localhost';
}
