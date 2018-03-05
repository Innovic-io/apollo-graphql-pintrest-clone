import { ObjectID } from 'mongodb';

export interface IAuthorization {
  _id: ObjectID;
  iat?: number;
  exp?: number;
}
