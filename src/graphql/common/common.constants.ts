export const ALREADY_EXIST_ERROR = (value) => `${value} already exist`;
export const WRONG_ID_FORMAT_ERROR = 'Sent ID is not in valid format';
export const DOES_NOT_EXIST = (value) => `${value} does not exist`;
export const PERMISSION_DENIED = 'Permission denied';

export enum ServerEnum {
  USERS = 'users',
  PINS = 'pins',
  BOARDS = 'boards',
}
