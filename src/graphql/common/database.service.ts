import { Db, MongoClient } from 'mongodb';

import { DB_NAME, DATABASE_URI, TEST_DATABASE_URI, DB_TESTING } from '../../server.constants';

export class DatabaseService {
  private static database: Db;

  private constructor() {}

  private static async initializeConnection() {
    let connection;

    if (process.env.NODE_ENV === 'test') {

      connection = await MongoClient.connect(TEST_DATABASE_URI);

      this.database = connection.db(DB_TESTING);
    } else {

      connection = await MongoClient.connect(DATABASE_URI);
      this.database = connection.db(DB_NAME);
    }
  }

  static async getDB() {

    if (!this.database) {
      await this.initializeConnection();
    }

    return this.database;
  }
}
