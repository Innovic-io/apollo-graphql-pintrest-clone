import { ObjectID } from 'mongodb';

export interface IPin {
  _id?: ObjectID;
  name: string;
  link: string; // The URL of the webpage where the Pin was created.
  url: string; // The URL of the Pin on Pinterest.
  creator: ObjectID;
  board: ObjectID; // The board that Pin is on
  created_at: Date;
  note: string; // User-entered description
  color: string; // Dominant color in hex code format
  comments: string[];
  media: Blob;
}

export interface IPinService {
  getByID(pinID: ObjectID | string): Promise<IPin>;
  getUserPins(_id: string | ObjectID): Promise<IPin[]>;
  getAllPins(): Promise<IPin[]>;
  createPin(newPin: IPin, creator: ObjectID): Promise<IPin>;
  updatePin(sentPin: IPin, creatorID: ObjectID): Promise<IPin>;
  deletePin(_id: string | ObjectID, creatorID: ObjectID): Promise<IPin>;
  getPinsFromBoard(
    boardID: string | ObjectID,
    creator: ObjectID
  ): Promise<IPin[]>;
  checkPinPermission(_id: ObjectID | string, creator: ObjectID);
}
