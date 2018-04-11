import { ObjectID } from 'mongodb';
import { USERS_ELEMENT } from '../../common/common.constants';

export interface IUser {
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

export interface IUserService {
  getByID(userID: string | ObjectID): Promise<IUser>;
  getUserByUsername(username: string): Promise<IUser>;
  createUser(newUser: IUser): Promise<string>;
  createdBoard(boardID: ObjectID, followerID: ObjectID): Promise<IUser>;
  addToSet(_id: ObjectID, elementToAdd: any, elementColumn: USERS_ELEMENT): Promise<IUser>;
  startFollowingUser(_id: string, followerID: ObjectID): Promise<IUser>;
  getFollowing(_id: string | ObjectID, type: USERS_ELEMENT): Promise<IUser[]>;
  getFollowers(_id: string | ObjectID): Promise<IUser[]>;
  removeFromSet(_id: ObjectID, elementToRemove: string | ObjectID, columnName: USERS_ELEMENT): Promise<IUser>;
  getAll(): Promise<IUser[]>;
  login(username: string, password: string): Promise<string>;
}

export interface IUserResolver {
  setQuery(): IUserResolver;
  setSubscriptions(): IUserResolver;
  setUser(): IUserResolver;
  setMutation(): IUserResolver;
  getAll();
}
