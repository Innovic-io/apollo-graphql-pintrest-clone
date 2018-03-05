import { Observable } from 'rxjs/Observable';
import { Collection, ObjectID } from 'mongodb';
import 'rxjs/add/observable/forkJoin';

import IUser from './user.interface';
import { createObjectID, findByElementKey, getServiceById } from '../common/helper.functions';
import { DOES_NOT_EXIST, ALREADY_EXIST_ERROR, SERVICE_ENUM } from '../common/common.constants';
import { DatabaseService } from '../common/database.service';
import { hashPassword, generateToken, comparePasswords, IHashedPassword } from '../common/cryptography';
import { USERS_ELEMENT } from './user.contants';

/**
 * Service to control data of Board type
 */
export default class UserService {

  private collectionName =  SERVICE_ENUM.USERS;
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

    if (await findByElementKey<IUser>(this.database, 'username', newUser.username)) {
      throw Error(ALREADY_EXIST_ERROR('Username'));
    }

    const hashedPassword: IHashedPassword = await hashPassword(newUser.password);

    const inputUser = {...newUser,
      password: hashedPassword.hash,
      salt: hashedPassword.salt,
      created_at: newUser.created_at || new Date(),
    };

    const inserted = await this.database.insertOne(inputUser);

    const [ resultingObject ] = inserted.ops as IUser[];

    return this.makeToken(resultingObject, newUser.password);
  }

  async createdBoard(boardID: ObjectID, followerID: ObjectID) {

    const result = await this.database
      .findOneAndUpdate(
        { _id: followerID },
        { $addToSet: { boards: boardID}},
        { returnOriginal: false },
      );

    return result.value;
  }

  async addToSet(_id: ObjectID, elementToAdd: any, elementColumn: USERS_ELEMENT): Promise<IUser> {

    const result = await this.database
      .findOneAndUpdate(
        { _id },
        { $addToSet: { [elementColumn]: elementToAdd }},
        { returnOriginal: false },
      );

    return result.value;

  }

  async startFollowingUser(_id: string, followerID: ObjectID) {

    const followee = await this.getByID(createObjectID(_id));

    if (!followee) {
      throw new Error(DOES_NOT_EXIST('Followee'));
    }

    return await this.addToSet(createObjectID(followerID), followee._id, USERS_ELEMENT.FOLLOWING);
  }

  async getFollowing(_id: string | ObjectID, type: USERS_ELEMENT) {

    const arrElem: SERVICE_ENUM = (type === USERS_ELEMENT.FOLLOWING) ? (SERVICE_ENUM.USERS) : SERVICE_ENUM[type.toUpperCase()];

    const user = await this.getByID(createObjectID(_id));

    if (!user || !user[type]) {
      return null;
    }

    const result = user[type]
      .map(async (oneID) => await getServiceById(oneID, arrElem));

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

  async removeFromSet(_id: string | ObjectID, followerID: ObjectID, type: USERS_ELEMENT) {

    const result = await this.database
      .findOneAndUpdate({_id: followerID},
        {
        $pull: { [type]: {$in: [ createObjectID(_id) ]} },
      });

    return result.value;
  }

  async getAll() {

    const result = await this.database.find({});
    return result.toArray();
  }

  async login(username: string, password: string) {

    const user = await this.database.findOne<IUser>({ username });

    return await this.makeToken(user, password);
  }

  private async makeToken(user: IUser, password: string) {

    if (!user || !await comparePasswords(password, user.salt, user.password)) {
      throw new Error('Wrong username or password');
    }

    return await generateToken({ _id: user._id });
  }
}
