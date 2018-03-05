import { Collection, ObjectID } from 'mongodb';

import {
  addCreator, createObjectID, findByElementKey, getServiceById,
  removeCreator,
} from '../common/helper.functions';
import { DOES_NOT_EXIST, ALREADY_EXIST_ERROR, PERMISSION_DENIED, SERVICE_ENUM } from '../common/common.constants';
import { DatabaseService } from '../common/database.service';
import IPin from './pin.interface';
import { USERS_ELEMENT } from '../user/user.contants';

/**
 * Service to control data of Pin type and Pin collection
 */
export default class PinService {

  private collectionName =  SERVICE_ENUM.PINS;
  private database: Collection;

  constructor() {

    DatabaseService.getDB()
      .then((value) => {
        this.database = value.collection(this.collectionName);
      });
  }

  async getByID(pinID: ObjectID | string): Promise<IPin> {

    return await findByElementKey<IPin>(this.database, '_id', createObjectID(pinID));

  }

  async getUserPins(_id: string | ObjectID) {

    const result = await this.database.find({creator: createObjectID(_id)});

    return result.toArray();
  }

  async getAllPins() {

    const result = await this.database.find({});

    return result.toArray();
  }

  async createPin(newPin: IPin, creator: ObjectID) {

    if (!await getServiceById(creator, SERVICE_ENUM.USERS)) {
      throw new Error(DOES_NOT_EXIST('Creator '));
    }

    if (await findByElementKey<IPin>(this.database, 'name', newPin.name)) {
      throw new Error(ALREADY_EXIST_ERROR('Name'));
    }

    if (!await getServiceById(newPin.board, SERVICE_ENUM.BOARDS)) {
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

  async updatePin(sentPin: IPin, creatorID: ObjectID) {

    await this.checkPinPermission(sentPin._id, creatorID);

    const exist = await findByElementKey<IPin>(this.database, '_id', createObjectID(sentPin._id));

    if (!exist) {
      throw new Error(DOES_NOT_EXIST('Pin with sent id '));
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

  async deletePin(_id: string | ObjectID, creatorID: ObjectID) {

    await this.checkPinPermission(_id, creatorID);

    const result = await this.database.findOneAndDelete({
      _id: createObjectID(_id),
    });

    await removeCreator(creatorID, createObjectID(_id), USERS_ELEMENT.PINS);

    return result.value;
  }

  async getPinsFromBoard(boardID: string | ObjectID, creator: ObjectID) {

    const result = await this.database.find({creator, board: createObjectID(boardID)});

    return result.toArray();
  }

  async checkPinPermission(_id, creator) {

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
