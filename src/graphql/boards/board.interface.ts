import { ObjectID } from 'mongodb';
import { IUser } from '../user/user.interface';

export interface IBoard {
  _id: ObjectID;
  name: string;
  url: string;
  description: string;
  creator: ObjectID;
  created_at: Date;
  followers: ObjectID[];
  collaborators: ObjectID[];
  image: Blob;
}

export interface IBoardService {
  getByID(boardID: string | ObjectID): Promise<IBoard>;
  startFollowingBoard(_id: string | ObjectID, followerID: ObjectID): Promise<IBoard>;
  getBoardFollowing(_id: ObjectID): Promise<IBoard[]>;
  stopFollowingBoard(_id: string | ObjectID, creatorID: ObjectID): Promise<IBoard>;
  createBoard(newBoard: IBoard, creatorID: ObjectID | string): Promise<IBoard>;
  updateBoard(sendBoard: IBoard, creatorID: ObjectID): Promise<IBoard>;
  deleteBoard(_id: ObjectID | string, creatorID: ObjectID): Promise<IBoard>;
  checkBoardPermission(_id: ObjectID | string, creator: ObjectID);
  getUsers(_id: ObjectID, users: ObjectID[]): Promise<IUser[]>;
  getCreators(_id: ObjectID): Promise<IBoard[]>;
}

export interface IBoardResolver {
  getAll()
}
