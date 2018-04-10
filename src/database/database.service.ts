import { MongoClient } from 'mongodb';

import { DB_NAME, DATABASE_URI, TEST_DATABASE_URI, DB_TESTING } from '../server.constants';
import { injectable } from 'inversify';
import { IDatabase, IDatabaseService } from './interfaces/database.interface';

@injectable()
export class DatabaseService implements IDatabaseService {
  private database: IDatabase;

  private async initializeConnection() {
    let connection;

    if (process.env.NODE_ENV === 'test') {

      connection = await MongoClient.connect(TEST_DATABASE_URI);

      this.database = connection.db(DB_TESTING);
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
