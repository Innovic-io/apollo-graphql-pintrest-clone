import { ObjectID } from 'mongodb';

export interface IAuthorization {
  _id: ObjectID;
  username: string;
  password: string;
  iat?: number;
  exp?: number;
}
