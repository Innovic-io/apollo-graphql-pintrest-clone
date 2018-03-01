import { ObjectID } from 'bson';
import { WRONG_ID_FORMAT_ERROR } from './common.constants';
import { Collection } from 'mongodb';

export const createObjectID = (id?) => {

  if (!!id && !ObjectID.isValid(id)) {
    throw new Error(WRONG_ID_FORMAT_ERROR);
  }

  return new ObjectID(id);
};

export const findByElementKey = async <T> (database: Collection, elementKey: string, searchValue: any) => {

  return await database
    .findOne({[elementKey]: searchValue}) as T;
};
