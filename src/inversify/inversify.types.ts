export const SERVICE_TYPES = {
  BoardService: Symbol.for('IBoardService'),
  PinService: Symbol.for('IPinService'),
  UserService: Symbol.for('IUserService'),
  DatabaseService: Symbol.for('IDatabaseService'),
};

export const RESOLVER_TYPES = {
  UserResolver: Symbol.for('IUserResolver'),
  PinResolver: Symbol.for('IPinResolver'),
  BoardResolver: Symbol.for('IBoardResolver'),
  ScalarResolver: Symbol.for('IScalarsResolver'),
};
