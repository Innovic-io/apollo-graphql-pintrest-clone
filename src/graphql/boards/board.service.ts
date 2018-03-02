import { Collection, ObjectID } from 'mongodb';

import { DatabaseService } from '../common/database.service';
import IBoard from './board.interface';
import { createObjectID, findByElementKey, getServiceById } from '../common/helper.functions';
import { ALREADY_EXIST_ERROR, DOES_NOT_EXIST, PERMISSION_DENIED, ServerEnum } from '../common/common.constants';
import UserService from '../user/user.service';

export default class BoardService {
  private collectionName = 'boards';
  private database: Collection;

  constructor() {

    DatabaseService.getDB()
      .then((value) => {
        this.database = value.collection(this.collectionName);
      });
  }
// @TODO add board to users boards
  async createBoard(newBoard: IBoard) {

    if (!await getServiceById(newBoard.creator, ServerEnum.USERS)) {
      throw new Error(DOES_NOT_EXIST('Creator '));
    }

    if (await findByElementKey<IBoard>(this.database, 'name', newBoard.name)) {
      throw new Error(ALREADY_EXIST_ERROR('Name'));
    }

    newBoard.creator = createObjectID(newBoard.creator);
    newBoard.collaborators.push(createObjectID(newBoard.creator));

    if (!newBoard.created_at) {
      newBoard.created_at = new Date();
    }

    const inserted = await this.database.insertOne(newBoard);
    const [ resultingObject ]: IBoard[] = inserted.ops;

    const usersService = await new UserService();
    usersService.startFollowingBoard(resultingObject._id, resultingObject.creator);

    return resultingObject;
  }

  async updateBoard(sendBoard: IBoard, creatorID: ObjectID) {

      await this.checkBoardPermission(sendBoard._id, creatorID);

      const exist = await findByElementKey<IBoard>(this.database, '_id', createObjectID(sendBoard._id));

      if (!exist) {
        throw new Error(DOES_NOT_EXIST('Pin with sent id '));
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

    return result.value;
  }

// class specific helper functions
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
}
