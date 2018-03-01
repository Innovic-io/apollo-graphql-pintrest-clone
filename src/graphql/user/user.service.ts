import { Observable } from 'rxjs/Observable';
import { Collection, ObjectID } from 'mongodb';
import 'rxjs/add/observable/forkJoin';

import IUser from './user.interface';
import { createObjectID, findByElementKey } from '../common/helper.functions';
import { DOES_NOT_EXIST, ALREADY_EXIST_ERROR } from '../common/common.constants';
import { DatabaseService } from '../common/database.service';

export default class UserService {

  private collectionName = 'users';
  private database: Collection;

  constructor() {
    DatabaseService.getDB().then((value) => this.database = value.collection(this.collectionName));
  }

  async getUserByID(userID: string | ObjectID): Promise<IUser> {

    return await findByElementKey<IUser>(this.database, '_id', createObjectID(userID)) as IUser;
  }

  async getUserByUsername(username: string): Promise<IUser>  {

    return await findByElementKey(this.database, 'username', username) as IUser;
  }

  async createUser(newUser: IUser) {

    if (await findByElementKey(this.database, 'username', newUser.username)) {
      throw Error(ALREADY_EXIST_ERROR('Username'));
    }

    if (!newUser.created_at) {

      newUser.created_at = new Date();
    }

    const inserted = await this.database.insertOne(newUser);

    const [ resultingObject ] = inserted.ops;

    return resultingObject;
  }

  async startFollowing(_id: string, followerID: string) {

    const followee = await findByElementKey<IUser>(this.database, '_id', createObjectID(_id));

    if (!followee) {
      throw new Error(DOES_NOT_EXIST('Followee'));
    }

    const result = await this.database
      .findOneAndUpdate(
      { _id: createObjectID(followerID) },
      { $addToSet: { following: createObjectID(_id)}},
      { returnOriginal: false },
      );

    return result.value;
  }

  async getFollowing(_id) {

    const user = await this.getUserByID(createObjectID(_id));

    // @TODO if there is no user, return user?
    if (!user) {
      return user;
    }

    // @TODO if there is no user following, return user following?
    if (!user.following) {
      return user.following;
    }

    const result = user
      .following
      .map(async (oneUserID) => await this.getUserByID(oneUserID));

    return await Observable.forkJoin(result).toPromise();
  }

  async getFollowers(_id: string) {

    const result = await this.database
      .find(
        {
          following: { $in: [ createObjectID(_id) ]},
        });

    return result.toArray();
  }

  async removeFollowing(_id: string, followerID: string) {

    const result = await this.database
      .findOneAndUpdate({_id: createObjectID(followerID)},
        {
        $pull: { following: {$in: [ createObjectID(_id) ]} },
      });

    return result.value;
  }

  async getAll() {

    const result = await this.database.find({});

    return result.toArray();
  }
}
