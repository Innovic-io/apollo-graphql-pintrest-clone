import { Collection, ObjectID } from 'mongodb';
import { Observable } from 'rxjs/Observable';

import { DatabaseService } from '../common/database.service';
import IBoard from './board.interface';
import {
  addCreator,
  createObjectID,
  findByElementKey,
  getServiceById,
  removeCreator,
} from '../common/helper.functions';
import {
  ALREADY_EXIST_ERROR,
  DOES_NOT_EXIST,
  PERMISSION_DENIED,
  SERVICE_ENUM,
  USERS_ELEMENT,
} from '../common/common.constants';
import IUser from '../user/user.interface';

/**
 * Service to control data of Board type and Board collection
 */
export default class BoardService {

  private collectionName = SERVICE_ENUM.BOARDS;
  private database: Collection;

  constructor() {

    DatabaseService.getDB()
      .then((value) => {
        this.database = value.collection(this.collectionName);
      });
  }

  async getByID(boardID: string | ObjectID): Promise<IBoard> {

    return await findByElementKey<IBoard>(this.database, '_id', createObjectID(boardID));
  }

  /**
   * Add User with followerID to array 'followers'
   *
   * @param {string | ObjectID} _id
   * @param {ObjectID} followerID
   * @returns {Promise<IBoard>}
   */
  async startFollowingBoard(_id: string | ObjectID, followerID: ObjectID): Promise<IBoard> {

    const result = await this.database.findOneAndUpdate({_id: createObjectID(_id)},
      { $addToSet: { followers: followerID } },
      { returnOriginal: false });

    return result.value;
  }

  /**
   * Get all boards which user with _id follows
   *
   * @param {ObjectID} _id
   * @returns {Promise<IBoard[]>}
   */
  async getBoardFollowing(_id: ObjectID): Promise<IBoard[]> {

    const result = await this.database.find<IBoard>({ followers: { $in: [ _id ] } });

    return result.toArray();
  }

  async stopFollowingBoard(_id: string | ObjectID, creatorID: ObjectID) {

    const result = await this.database.findOneAndUpdate({_id: createObjectID(_id)},
      { $pull: { followers: {$in: [creatorID] } } },
    );

    return result.value;
  }

  async createBoard(newBoard: IBoard, creatorID: ObjectID | string) {

    creatorID = createObjectID(creatorID);

    if (!await getServiceById(creatorID, SERVICE_ENUM.USERS)) {
      throw new Error(DOES_NOT_EXIST('Creator '));
    }

    if (await findByElementKey<IBoard>(this.database, 'name', newBoard.name)) {
      throw new Error(ALREADY_EXIST_ERROR('Name'));
    }

    const insertBoard: IBoard = {
      ...newBoard,
      creator: creatorID,
      followers: [creatorID],
      collaborators: [creatorID],
      created_at: newBoard.created_at || new Date(),
    };

    const inserted = await this.database.insertOne(insertBoard);
    const [ resultingObject ]: IBoard[] = inserted.ops;

    await addCreator(resultingObject.creator, resultingObject._id, USERS_ELEMENT.BOARDS);

    return resultingObject;
  }

  async updateBoard(sendBoard: IBoard, creatorID: ObjectID) {

      await this.checkBoardPermission(sendBoard._id, creatorID);

      const exist = await findByElementKey<IBoard>(this.database, '_id', createObjectID(sendBoard._id));

      if (!exist) {
        throw new Error(DOES_NOT_EXIST('Board with sent id '));
      }

      delete sendBoard._id;

      const result = await this.database
        .findOneAndUpdate({_id: exist._id},
          { $set: sendBoard },
          { returnOriginal: false },
        );

      return result.value;
  }

  async deleteBoard(_id: ObjectID | string, creatorID: ObjectID) {

    await this.checkBoardPermission(_id, creatorID);

    const result = await this.database
      .findOneAndDelete({_id: createObjectID(_id)});

    await removeCreator(creatorID, createObjectID(_id), USERS_ELEMENT.BOARDS);

    return result.value;
  }

  /**
   * Check if authorized user have permission on board
   *
   * @param _id
   * @param creator
   * @returns {Promise<{valid: boolean; creator: ObjectID}>}
   */
  async checkBoardPermission(_id, creator) {

    const result = await findByElementKey<IBoard>(this.database,
      '_id', createObjectID(_id));

    if (!result.creator.equals(creator)) {
      throw new Error(PERMISSION_DENIED);
    }

    return {
      valid: true,
      creator,
    };
  }

  /**
   * get All users info by ID
   *
   * @param {ObjectID} _id
   * @param {ObjectID[]} users
   * @returns {Promise<IUser[]>}
   */
  async getUsers(_id: ObjectID, users: ObjectID[]): Promise<IUser[]> {

    if (!users) {
      return null;
    }

    const result = users
      .map( async (userIndex) => await getServiceById<IUser>(userIndex, SERVICE_ENUM.USERS));

    return await Observable.forkJoin(result).toPromise();
  }

  /**
   * Get all boards which User with _id created.
   *
   * @param {ObjectID} _id
   * @returns {Promise<IBoard[]>}
   */
  async getCreators(_id: ObjectID): Promise<IBoard[]> {
    const result = await this.database.find<IBoard>({ creator: _id });

    return result.toArray();
  }
}
