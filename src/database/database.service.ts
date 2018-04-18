import { MongoClient } from 'mongodb';
import { MongodHelper } from 'mongodb-prebuilt';

import { DB_NAME, DATABASE_URI, TEST_DATABASE_URI, DB_TESTING , PORT, DB_VOLUME_LOCATION} from '../server.constants';
import { IDatabase, IDatabaseService } from './interfaces/database.interface';
import { Service } from '../decorators/service.decorator';

@Service()
export class DatabaseService implements IDatabaseService {
  private database: IDatabase;

  private async initializeConnection() {
    let connection;

    if (process.env.NODE_ENV === 'test') {

    //  const mongoHelper = new MongodHelper(
    //    [
    //      '--dbpath', `${DB_VOLUME_LOCATION}`,
    //      '--port', PORT,
    //      '--storageEngine', 'inMemory'
    //    ]);
      // @TODO
      // runServer, but how get database out of it?
      // await mongoHelper.mongoBin.run());

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
