import { Collection, ObjectID } from 'mongodb';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import {
  addCreator, createObjectID, findByElementKey, getServiceById, removeCreator,
} from '../../common/helper.functions';
import { DOES_NOT_EXIST, ALREADY_EXIST_ERROR, PERMISSION_DENIED, SERVICE_ENUM } from '../../common/common.constants';
import { IPin, IPinService } from './pin.interface';
import { USERS_ELEMENT } from '../../common/common.constants';
import { SERVICE_TYPES } from '../../inversify/inversify.types';
import { IDatabaseService } from '../../database/interfaces/database.interface';

/**
 * Service to control data of Pin type and Pin collection
 */
@injectable()
export default class PinService implements IPinService {

  private collectionName =  SERVICE_ENUM.PINS;
  private database: Collection;

  constructor(
    @inject(SERVICE_TYPES.DatabaseService) injectedDatabase: IDatabaseService,
  ) {

    injectedDatabase.getDB()
      .then((value) => this.database = value.collection(this.collectionName) );
  }

  async getByID(pinID: ObjectID | string): Promise<IPin> {

    return await findByElementKey<IPin>(this.database, '_id', createObjectID(pinID));

  }

  /**
   * Get all Pins Authorized user created
   *
   * @param {string | ObjectID} _id
   * @returns {Promise<IPin[]>}
   */
  async getUserPins(_id: string | ObjectID): Promise<IPin[]> {

    const result = await this.database.find<IPin>({creator: createObjectID(_id)});

    return result.toArray();
  }

  async getAllPins(): Promise<IPin[]> {

    const result = await this.database.find({});

    return result.toArray();
  }

  /**
   * Create new Pin as authorized User
   *
   * @param {IPin} newPin
   * @param {ObjectID} creator
   * @returns {Promise<IPin>}
   */
  async createPin(newPin: IPin, creator: ObjectID): Promise<IPin> {

    if (!await getServiceById(creator, SERVICE_ENUM.USERS)) {
      throw new Error(DOES_NOT_EXIST('Creator '));
    }

    if (await findByElementKey<IPin>(this.database, 'name', newPin.name)) {
      throw new Error(ALREADY_EXIST_ERROR('Name'));
    }

    if (!await getServiceById(createObjectID(newPin.board), SERVICE_ENUM.BOARDS)) {
      throw new Error(DOES_NOT_EXIST('Board '));
    }

    const insertPin: IPin = {
      ...newPin,
      creator,
      created_at: newPin.created_at || new Date(),
      board: createObjectID(newPin.board),
    };

    const inserted = await this.database.insertOne(insertPin);

    const [ resultingObject ]: IPin[] = inserted.ops;

    await addCreator(resultingObject.creator, resultingObject._id, USERS_ELEMENT.PINS);

    return resultingObject;
  }

  /**
   * Update pin if User have permission and Pin exist
   *
   * @param {IPin} sentPin
   * @param {ObjectID} creatorID
   * @returns {Promise<IPin>}
   */
  async updatePin(sentPin: IPin, creatorID: ObjectID): Promise<IPin> {

    await this.checkPinPermission(sentPin._id, creatorID);

    const exist = await findByElementKey<IPin>(this.database, '_id', createObjectID(sentPin._id));

    if (!exist) {
      throw new Error(DOES_NOT_EXIST('Pin with sent ID '));
    }

    if (!!sentPin.board) {
      sentPin.board = createObjectID(sentPin.board);
    }

    delete sentPin._id;

    const result = await this.database
      .findOneAndUpdate({_id: exist._id},
      { $set: sentPin },
      { returnOriginal: false },
    );

    return result.value;
  }

  async deletePin(_id: string | ObjectID, creatorID: ObjectID): Promise<IPin> {

    await this.checkPinPermission(_id, creatorID);

    const result = await this.database.findOneAndDelete({
      _id: createObjectID(_id),
    });

    await removeCreator(creatorID, createObjectID(_id), USERS_ELEMENT.PINS);

    return result.value;
  }

  /**
   * Get authorized users pins from given board
   *
   * @param {string | ObjectID} boardID
   * @param {ObjectID} creator
   * @returns {Promise<IPin>}
   */
  async getPinsFromBoard(boardID: string | ObjectID, creator: ObjectID): Promise<IPin[]> {

    const result = await this.database
      .find<IPin>({creator, board: createObjectID(boardID)});

    return result.toArray();
  }

  /**
   * Check if Authorized user have right to perform action
   *
   * @param {ObjectID} _id
   * @param {ObjectID} creator
   * @returns {Promise<{valid: boolean; creator: ObjectID}>}
   */
  async checkPinPermission(_id: ObjectID | string, creator: ObjectID) {

    const result = await findByElementKey<IPin>(this.database,
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
