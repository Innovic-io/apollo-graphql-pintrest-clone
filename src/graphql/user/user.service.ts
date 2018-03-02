import { Observable } from 'rxjs/Observable';
import { Collection, ObjectID } from 'mongodb';
import 'rxjs/add/observable/forkJoin';
import * as webToken from 'jsonwebtoken';

import IUser from './user.interface';
import { createObjectID, findByElementKey } from '../common/helper.functions';
import { DOES_NOT_EXIST, ALREADY_EXIST_ERROR } from '../common/common.constants';
import { DatabaseService } from '../common/database.service';
import { privateKey } from '../../server.constants';

export default class UserService {

  private collectionName = 'users';
  private database: Collection;

  constructor() {
    DatabaseService.getDB().then((value) => this.database = value.collection(this.collectionName));
  }

  async getByID(userID: string | ObjectID): Promise<IUser> {

    return await findByElementKey<IUser>(this.database, '_id', createObjectID(userID));
  }

  async getUserByUsername(username: string): Promise<IUser>  {

    return await findByElementKey<IUser>(this.database, 'username', username);
  }

  async createUser(newUser: IUser) {

    if (await findByElementKey(this.database, 'username', newUser.username)) {
      throw Error(ALREADY_EXIST_ERROR('Username'));
    }

    if (!newUser.created_at) {

      newUser.created_at = new Date();
    }

    const inserted = await this.database.insertOne(newUser);

    const [ resultingObject ] = inserted.ops as IUser[];

    return resultingObject;
  }

  async startFollowingBoard(boardID: string | ObjectID, followerID: ObjectID) {

  }

  async startFollowingUser(_id: string, followerID: ObjectID) {

    const followee = await findByElementKey<IUser>(this.database, '_id', createObjectID(_id));

    if (!followee) {
      throw new Error(DOES_NOT_EXIST('Followee'));
    }

    const result = await this.database
      .findOneAndUpdate(
      { _id: followerID },
      { $addToSet: { following: createObjectID(_id)}},
      { returnOriginal: false },
      );

    return result.value;
  }

  async getFollowing(_id, type: string) {

    const user = await this.getByID(createObjectID(_id));

    if (!user || !user[type]) {
      return null;
    }

    const result = user[type]
      .map(async (oneUserID) => await this.getByID(oneUserID));

    return await Observable.forkJoin(result).toPromise();
  }

  async getFollowers(_id: string | ObjectID) {

    const result = await this.database
      .find(
        {
          following: { $in: [ createObjectID(_id) ]},
        });

    return result.toArray();
  }

  async removeFollowing(_id: string, followerID: ObjectID) {

    const result = await this.database
      .findOneAndUpdate({_id: followerID},
        {
        $pull: { following: {$in: [ createObjectID(_id) ]} },
      });

    return result.value;
  }

  async getAll() {

    const result = await this.database.find({});
    return result.toArray();
  }

  async login(username: string, password: string) {

    const user = await this.database.findOne<IUser>({username, password});

    return webToken.sign({
      username: user.username,
      password: user.password,
      _id: user._id
    }, privateKey, { expiresIn: 60 * 60 });
  }
}
