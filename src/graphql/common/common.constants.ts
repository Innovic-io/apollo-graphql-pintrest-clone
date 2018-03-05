export const ALREADY_EXIST_ERROR = (value) => `${value} already exist`;
export const WRONG_ID_FORMAT_ERROR = 'Sent ID is not in valid format';
export const DOES_NOT_EXIST = (value) => `${value} does not exist`;
export const PERMISSION_DENIED = 'Permission denied';

// enum of all available services
export enum SERVICE_ENUM {
  USERS = 'users',
  PINS = 'pins',
  BOARDS = 'boards',
}
