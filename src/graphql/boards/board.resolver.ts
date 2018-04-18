import { inject } from 'inversify';

import { IAuthorization } from '../../authorization/authorization.interface';
import { IBoard, IBoardService } from './board.interface';
import { getServiceById } from '../../common/helper.functions';
import { IResolver, SERVICE_ENUM } from '../../common/common.constants';
import { SERVICE_TYPES } from '../../inversify/inversify.types';
import {
  Resolver,
  Query,
  Mutation,
  ResolveProperty
} from '../../decorators/resolver.decorator';

let boardService;

@Resolver('Board')
export default class BoardResolver implements IResolver {
  constructor(
    @inject(SERVICE_TYPES.BoardService) injectedBoardService: IBoardService
  ) {
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

  @ResolveProperty()
  async followers(boards: IBoard) {
    if (!boards.followers) {
      return null;
    }

    return await boardService.getUsers(boards._id, boards.followers);
  }

  @ResolveProperty()
  async creator(boards: IBoard) {
    return await getServiceById(boards.creator, SERVICE_ENUM.USERS);
  }

  @ResolveProperty()
  async collaborators(boards: IBoard) {
    if (!boards.collaborators) {
      return null;
    }

    return await boardService.getUsers(boards._id, boards.collaborators);
  }

  getAll() {}
}
