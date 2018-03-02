import { ObjectID, Collection } from 'mongodb';

import { WRONG_ID_FORMAT_ERROR } from './common.constants';
import UserService from '../user/user.service';
import PinService from '../pins/pin.service';
import BoardService from '../boards/board.service';

export const createObjectID = (id?) => {

  if (!!id && !ObjectID.isValid(id)) {
    throw new Error(WRONG_ID_FORMAT_ERROR);
  }

  return new ObjectID(id);
};

export const findByElementKey = async <T> (database: Collection, elementKey: string, searchValue: any) => {

  return await database.findOne<T>({[elementKey]: searchValue});
};

export const getServiceById = async (_id, serviceName: string) => {

  let service;
  switch (serviceName.toLocaleLowerCase()) {
    case 'users':
      service = await new UserService();
      break;

    case 'pins':
      service = await new PinService();
      break;

    case 'boards':
      service = await new BoardService();
      break;

    default:
      throw new Error('Not supported');
  }

  return await service.getByID(_id);
};
