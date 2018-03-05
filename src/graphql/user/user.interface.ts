import { ObjectID } from 'mongodb';

export default interface IUser {
  _id?: ObjectID;
  username: string;
  password: string;
  salt?: string;
  first_name: string;
  last_name: string;
  bio?: string; // text from "About you" section
  created_at?: Date;
  following?: string[];
  boards?: ObjectID[];
  pins?: ObjectID[];
  image?: Blob;
}
