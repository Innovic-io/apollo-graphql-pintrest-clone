import { inject, injectable } from 'inversify';

import { IAuthorization } from '../../authorization/authorization.interface';
import { IBoard, IBoardResolver, IBoardService } from './board.interface';
import { getServiceById } from '../../common/helper.functions';
import { SERVICE_ENUM } from '../../common/common.constants';
import { SERVICE_TYPES } from '../../inversify/inversify.types';

let boardService;

@injectable()
export default class BoardResolver implements IBoardResolver {
  private Query;
  private Mutation;
  private Board;

  constructor(
    @inject(SERVICE_TYPES.BoardService) injectedBoardService: IBoardService
  ) {

    this.setQuery();
    this.setMutation();
    this.setBoard();

    boardService = injectedBoardService;
  }

  setQuery() {
    this.Query = {
      async getBoard(parent, { _id }) {
        return await boardService.getByID(_id);
      },

      async getBoardFollowing(parent, args, context: IAuthorization) {

        return await boardService.getBoardFollowing(context._id);
      },
      async getUserBoards(parent, args, context: IAuthorization) {

        return await boardService.getCreators(context._id);
      },
    };
    return this;
  }

  setMutation() {
    this.Mutation = {
      async createBoard(parent, args, context: IAuthorization) {
        return await boardService.createBoard(args, context._id);
      },

      async updateBoard(parent, args, context: IAuthorization) {
        return await boardService.updateBoard(args, context._id);
      },

      async deleteBoard(parent, { _id }, context: IAuthorization) {
        return await boardService.deleteBoard(_id, context._id);
      },

      async followBoard(parent, { _id }, context: IAuthorization) {
        return await boardService.startFollowingBoard(_id, context._id);
      },

      async stopFollowingBoard(parent, { _id }, context: IAuthorization) {
        return await boardService.stopFollowingBoard(_id, context._id);
      },
    };
    return this;
  }

  setBoard() {
    this.Board = {

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
    return this;
  }

  getAll() {
    return {
      Query: this.Query,
      Mutation: this.Mutation,
      Board: this.Board,
    };
  }
}
