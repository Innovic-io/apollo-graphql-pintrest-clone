import { FULL_PINTEREST } from '../../src/server.constants';

export const loginUserObject = { username: 'Username', password: 'password' };
export const userObject = {
  ...loginUserObject,
  first_name: 'Mirko',
  last_name: 'Markovic'
};

export const secondUserObject = {
  username: 'secondUserName',
  password: 'password',
  first_name: 'Marko',
  last_name: 'Mirkovic'
};

export const boardObject = {
  name: 'Unique Name',
  description: 'Board description'
};
export const pinObject = { name: 'Unique name', note: 'Note for this pin' };
export let boardID;

export const setBoadID = id => (boardID = id);

export const boardQuery = (additionalField = '') =>
  `{ _id name creator { username first_name } ${additionalField} }`;

export const pinQuery = (additionalField = '') =>
  `{ _id name ${additionalField}
  creator { username first_name } 
  board { _id name }}`;

export const userQuery = (additionalField = '') =>
  `{ username first_name last_name ${additionalField}
          pins { name _id }
          boards { name _id }  } `;

export let header = { authorization: '', company: FULL_PINTEREST };
// @ts-ignore

export const checkUser = (singleUser, secondUser = false) => {
  if (secondUser) {
    expect(singleUser.first_name).toEqual(secondUserObject.first_name);
    expect(singleUser.username).toEqual(secondUserObject.username);
    expect(singleUser.last_name).toEqual(secondUserObject.last_name);
  } else {
    expect(singleUser.first_name).toEqual(userObject.first_name);
    expect(singleUser.username).toEqual(userObject.username);
    expect(singleUser.last_name).toEqual(userObject.last_name);
  }
};

export const checkBoard = singleBoard => {
  expect(singleBoard.creator.username).toEqual(userObject.username);
  expect(singleBoard.creator.first_name).toEqual(userObject.first_name);
  expect(singleBoard.name).toEqual(boardObject.name);
};

export const checkPin = singlePin => {
  expect(singlePin.creator.username).toEqual(userObject.username);
  expect(singlePin.creator.first_name).toEqual(userObject.first_name);
  expect(singlePin.name).toEqual(pinObject.name);
  expect(singlePin.board.name).toEqual(boardObject.name);
  expect(singlePin.board._id).toEqual(boardID);
};
