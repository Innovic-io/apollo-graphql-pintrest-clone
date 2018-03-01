import { Db, MongoClient } from 'mongodb';
import { DB_NAME, DATABASE_URI } from '../../server.constants';

export class DatabaseService {
  private static database: Db;

  private constructor() {}

  private static async initializeConnection() {
    const connection = await MongoClient.connect(DATABASE_URI);

    this.database = connection.db(DB_NAME);
  }

  static async getDB() {

    if (!this.database) {
      await this.initializeConnection();
    }

    return this.database;
  }
}
