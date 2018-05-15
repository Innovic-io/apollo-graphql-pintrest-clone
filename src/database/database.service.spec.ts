import { MongoClient } from 'mongodb';
import { DatabaseService } from './database.service';
import { DB_TESTING, TEST_DATABASE_URI } from '../server.constants';

describe('Database service', () => {
  it('should connect To Database', async () => {
    const example = DatabaseService;
    const connection = await MongoClient.connect(TEST_DATABASE_URI);
    const database = connection.db(DB_TESTING);
    const db = await example.prototype.getDB();
    const db2 = await example.prototype.getDB();

    expect(db.databaseName).toEqual(database.databaseName);
    expect(db2).toEqual(db);
  });
});
