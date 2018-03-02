import { ObjectID } from 'mongodb';

export default interface IBoard {
  _id: ObjectID;
  name: string;
  url: string;
  description: string;
  creator: ObjectID;
  created_at: Date;
  numberOfPins: number;
  followers: ObjectID[];
  collaborators: ObjectID[];
  image: Blob;
}
