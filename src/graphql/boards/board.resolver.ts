import { inject, injectable } from 'inversify';

import { IAuthorization } from '../../authorization/authorization.interface';
import { IBoard, IBoardResolver, IBoardService } from './board.interface';
import { getServiceById } from '../../common/helper.functions';
import { SERVICE_ENUM } from '../../common/common.constants';
import { SERVICE_TYPES } from '../../inversify/inversify.types';

let boardService;

let queries = {};
let mutations = {};
let board = {

  async followers(boards: IBoard) {

    if (!boards.followers) {
      return null;
    }

    return await boardService.getUsers(boards._id, boards.followers);
  },

  async creator(boards: IBoard) {

    return await getServiceById(boards.creator, SERVICE_ENUM.USERS);
  },

  async collaborators(boards: IBoard) {

    if (!boards.collaborators) {
      return null;
    }

    return await boardService.getUsers(boards._id, boards.collaborators);
  },
};

const resolverQueries = {
  Query: {},
  Mutation: {},
  Subscription: {},
};

function Resolver(typeToResolve: string) {
  resolverQueries[typeToResolve] = board;
  return (target) => {

    const types = Reflect.getMetadata('design:paramtypes', target) || [];
    Reflect.defineMetadata('inversify:paramtypes', types, target);

    target.prototype.getAll = () => resolverQueries;

    return target;
  };
}

function Query() {

  return (target, propertyKey: string, descriptor: PropertyDescriptor) => Object.assign(
    resolverQueries.Query,
    {[ propertyKey ]: descriptor.value});
}

function Mutation() {

  return (target, propertyKey: string, descriptor: PropertyDescriptor) => Object.assign(
    resolverQueries.Mutation,
    {[ propertyKey ]: descriptor.value});
}

@Resolver('Board')
// @injectable()
export default class BoardResolver implements IBoardResolver {

  constructor( @inject(SERVICE_TYPES.BoardService) injectedBoardService: IBoardService ) {

    boardService = injectedBoardService;
  }

  @Query()
  async getBoard(parent, { _id }) {
    return await boardService.getByID(_id);
  }

  @Query()
  async getBoardFollowing(parent, args, context: IAuthorization) {

    return await boardService.getBoardFollowing(context._id);
  }

  @Query()
  async getUserBoards(parent, args, context: IAuthorization) {
    return await boardService.getCreators(context._id);
  }

  @Mutation()
  async createBoard(parent, args, context: IAuthorization) {
    return await boardService.createBoard(args, context._id);
  }

  @Mutation()
  async updateBoard(parent, args, context: IAuthorization) {
    return await boardService.updateBoard(args, context._id);
  }

  @Mutation()
  async deleteBoard(parent, { _id }, context: IAuthorization) {
    return await boardService.deleteBoard(_id, context._id);
  }

  @Mutation()
  async followBoard(parent, { _id }, context: IAuthorization) {
    return await boardService.startFollowingBoard(_id, context._id);
  }

  @Mutation()
  async stopFollowingBoard(parent, { _id }, context: IAuthorization) {
    return await boardService.stopFollowingBoard(_id, context._id);
  }

  getAll() {}
}
