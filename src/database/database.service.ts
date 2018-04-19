import { MongoClient } from 'mongodb';
const MongoInMemory = require('mongo-in-memory');

import {
  DB_NAME,
  DATABASE_URI,
  DB_TESTING,
  DB_PORT
} from '../server.constants';
import { IDatabase, IDatabaseService } from './interfaces/database.interface';
import { Service } from '../decorators/service.decorator';

export let inMemoryMongo;

@Service()
export class DatabaseService implements IDatabaseService {
  private database: IDatabase;

  private async initializeConnection() {
    let connection;

    if (process.env.NODE_ENV === 'test') {
      inMemoryMongo = new MongoInMemory(DB_PORT);
      this.database = await inMemoryMongo.getConnection(DB_TESTING);
    } else {
      connection = await MongoClient.connect(DATABASE_URI);
      this.database = connection.db(DB_NAME);
    }
  }

  async getDB(): Promise<IDatabase> {
    if (!this.database) {
      await this.initializeConnection();
    }

    return this.database;
  }
}
