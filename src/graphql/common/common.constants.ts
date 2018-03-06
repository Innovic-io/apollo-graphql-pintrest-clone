export const ALREADY_EXIST_ERROR = (value) => `${value} already exist`;
export const WRONG_ID_FORMAT_ERROR = 'Sent ID is not in valid format';
export const DOES_NOT_EXIST = (value) => `${value} does not exist`;
export const PERMISSION_DENIED = 'Permission denied';
export const WRONG_USERNAME_AND_PASSWORD = 'Wrong username or password';

// enum of all available services
export enum SERVICE_ENUM {
  USERS = 'users',
  PINS = 'pins',
  BOARDS = 'boards',
}

export enum USERS_ELEMENT {
  FOLLOWING = 'following',
  BOARDS = 'boards',
  PINS = 'pins',
}
