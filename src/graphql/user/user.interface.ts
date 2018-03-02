import { ObjectID } from 'mongodb';
import IBoard from '../boards/board.interface';

export default interface IUser {
  _id?: ObjectID;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  bio?: string; // text from "About you" section
  created_at?: Date;
  numberOfPins?: number;
  following?: string[];
  boards?: IBoard[];
  image?: Blob;
}
