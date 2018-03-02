import { ObjectID } from 'mongodb';
import IBoard from '../boards/board.interface';

export default interface IPin {
  _id?: ObjectID;
  name: string;
  link: string; // The URL of the webpage where the Pin was created.
  url: string; // The URL of the Pin on Pinterest.
  creator: ObjectID;
  board: IBoard; // The board that Pin is on
  created_at: Date;
  note: string; // User-entered description
  color: string; // Dominant color in hex code format
  numberOfRepins: number;
  comments: string[];
  media: Blob;
}
