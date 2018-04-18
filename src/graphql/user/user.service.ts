import { Observable } from 'rxjs/Observable';
import { Collection, ObjectID } from 'mongodb';
import 'rxjs/add/observable/forkJoin';

import { IUser, IUserService } from './user.interface';
import {
  createObjectID,
  findByElementKey,
  getServiceById,
  makeToken
} from '../../common/helper.functions';
import {
  ALREADY_EXIST_ERROR,
  DOES_NOT_EXIST,
  SERVICE_ENUM,
  USERS_ELEMENT
} from '../../common/common.constants';
import { hashPassword, IHashedPassword } from '../../common/cryptography';
import { Service } from '../../decorators/service.decorator';
import { AVAILABLE_SERVICES } from '../../server.constants';

/**
 * Service to control data of Board type
 */
@Service()
export default class UserService implements IUserService {
  private collectionName = SERVICE_ENUM.USERS;
  database: Collection;

  constructor() {
    this.database = AVAILABLE_SERVICES.DatabaseService.collection(
      this.collectionName
    );
  }

  async getByID(userID: string | ObjectID): Promise<IUser> {
    return await findByElementKey<IUser>(
      this.database,
      '_id',
      createObjectID(userID)
    );
  }

  async getUserByUsername(username: string): Promise<IUser> {
    return await findByElementKey<IUser>(this.database, 'username', username);
  }

  async createUser(newUser: IUser) {
    if (
      await findByElementKey<IUser>(this.database, 'username', newUser.username)
    ) {
      throw Error(ALREADY_EXIST_ERROR('Username'));
    }

    const hashedPassword: IHashedPassword = await hashPassword(
      newUser.password
    );

    const inputUser = {
      ...newUser,
      password: hashedPassword.hash,
      salt: hashedPassword.salt,
      created_at: newUser.created_at || new Date()
    };

    const inserted = await this.database.insertOne(inputUser);

    const [resultingObject] = inserted.ops as IUser[];

    return await makeToken(resultingObject, newUser.password);
  }

  /**
   * Add Board to User
   *
   * @param {ObjectID} boardID
   * @param {ObjectID} followerID
   * @returns {Promise<IUser>}
   */
  async createdBoard(boardID: ObjectID, followerID: ObjectID): Promise<IUser> {
    const result = await this.database.findOneAndUpdate(
      { _id: followerID },
      { $addToSet: { boards: boardID } },
      { returnOriginal: false }
    );

    return result.value;
  }

  /**
   * Add elementToAdd in elementColumn Array of User
   *
   * @param {ObjectID} _id
   * @param elementToAdd
   * @param {USERS_ELEMENT} elementColumn
   * @returns {Promise<IUser>}
   */
  async addToSet(
    _id: ObjectID,
    elementToAdd: any,
    elementColumn: USERS_ELEMENT
  ): Promise<IUser> {
    const result = await this.database.findOneAndUpdate(
      { _id },
      { $addToSet: { [elementColumn]: elementToAdd } },
      { returnOriginal: false }
    );

    return result.value;
  }

  async startFollowingUser(_id: string, followerID: ObjectID): Promise<IUser> {
    const followee = await this.getByID(createObjectID(_id));

    if (!followee) {
      throw new Error(DOES_NOT_EXIST('Followee'));
    }

    return await this.addToSet(
      createObjectID(followerID),
      followee._id,
      USERS_ELEMENT.FOLLOWING
    );
  }

  /**
   * Get all Users which authorized User follow
   *
   * @param {string | ObjectID} _id
   * @param {USERS_ELEMENT} type
   * @returns {Promise<IUser[]>}
   */
  async getFollowing(
    _id: string | ObjectID,
    type: USERS_ELEMENT
  ): Promise<IUser[]> {
    const arrElem: SERVICE_ENUM =
      type === USERS_ELEMENT.FOLLOWING
        ? SERVICE_ENUM.USERS
        : SERVICE_ENUM[type.toUpperCase()];

    const user = await this.getByID(createObjectID(_id));

    if (!user || !user[type]) {
      return null;
    }

    const result = user[type].map(
      async oneID => await getServiceById(oneID, arrElem)
    );

    return await Observable.forkJoin<IUser>(result).toPromise();
  }

  /**
   * Get all Users which follow authorized User
   *
   * @param {string | ObjectID} _id
   * @returns {Promise<any>}
   */
  async getFollowers(_id: string | ObjectID): Promise<IUser[]> {
    const result = await this.database.find<IUser>({
      following: { $in: [createObjectID(_id)] }
    });

    return result.toArray();
  }

  /**
   * In Authorized user columnName Remove elementToRemove
   *
   * @param {string | ObjectID} elementToRemove
   * @param {ObjectID} _id
   * @param {USERS_ELEMENT} columnName
   * @returns {Promise<IUser>}
   */
  async removeFromSet(
    _id: ObjectID,
    elementToRemove: string | ObjectID,
    columnName: USERS_ELEMENT
  ): Promise<IUser> {
    const result = await this.database.findOneAndUpdate(
      { _id },
      {
        $pull: { [columnName]: { $in: [createObjectID(elementToRemove)] } }
      }
    );

    return result.value;
  }

  async getAll() {
    const result = await this.database.find<IUser>({});
    return result.toArray();
  }

  async login(username: string, password: string) {
    const user = await this.database.findOne<IUser>({ username });

    return await makeToken(user, password);
  }
}
