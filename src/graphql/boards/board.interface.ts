import { ObjectID } from 'mongodb';

import IUser from '../user/user.interface';

export default interface IBoard {
  id: ObjectID;
  name: string;
  url: string;
  description: string;
  creator: IUser;
  created_at: Date;
  numberOfPins: number;
  followers: number;
  users: IUser[];
  collaborators: IUser[];
  image: Blob;
}
