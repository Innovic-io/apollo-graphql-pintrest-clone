import { Collection, ObjectID } from 'mongodb';

import { createObjectID, findByElementKey } from '../common/helper.functions';
import { DOES_NOT_EXIST, ALREADY_EXIST_ERROR } from '../common/common.constants';
import { DatabaseService } from '../common/database.service';
import IPin from './pin.interface';
import UserService from '../user/user.service';

export default class PinService {

  private collectionName = 'pins';
  private database: Collection;

  constructor() {

    DatabaseService.getDB()
      .then((value) => {
        this.database = value.collection(this.collectionName);
      });
  }

  async getCreatorById(_id) {

    // @TODO double await? :)
    return await (await new UserService()).getUserByID(_id);
  }

  async getPin(pinID: ObjectID | string): Promise<IPin> {

    return await findByElementKey(this.database, '_id', createObjectID(pinID)) as IPin;

  }

  async createPin(newPin: IPin) {

    if (!await this.getCreatorById(newPin.creator)) {
      throw new Error(DOES_NOT_EXIST('Creator '));
    }

    if (await findByElementKey<IPin>(this.database, 'name', newPin.name)) {
      throw new Error(ALREADY_EXIST_ERROR('Name'));
    }

    newPin.creator = createObjectID(newPin.creator);

    if (!newPin.created_at) {
      newPin.created_at = new Date();
    }

    const inserted = await this.database.insertOne(newPin);
    const [ resultingObject ] = inserted.ops;

    return resultingObject;
  }

  async getAllPins() {

    const result = await this.database.find({});

    return result.toArray();
  }

  async updatePin(sentPin: IPin) {

    const exist = await findByElementKey<IPin>(this.database, '_id', createObjectID(sentPin._id));

    if (!exist) {
      throw new Error(DOES_NOT_EXIST('Pin with sent id '));
    }

    delete sentPin._id;

    const result = await this.database
      .findOneAndUpdate({_id: exist._id},
      { $set: sentPin },
      { returnOriginal: false },
    );

    return result.value;
  }

  async deletePin(_id: string | ObjectID) {

    const result = await this.database.findOneAndDelete({_id: createObjectID(_id)});

    return result.value;
  }

  async getUserPins(_id: string | ObjectID) {

    const result = await this.database.find({creator: createObjectID(_id)});

    return result.toArray();
  }
}
