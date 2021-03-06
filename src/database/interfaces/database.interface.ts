import { Db } from 'mongodb';

// tslint:disable-next-line
export interface IDatabase extends Db {}

export interface IDatabaseService {
  getDB(): Promise<IDatabase>;
}
