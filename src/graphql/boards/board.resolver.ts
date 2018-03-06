import BoardService from './board.service';
import { IAuthorization } from '../../authorization/authorization.interface';
import IBoard from './board.interface';
import { getServiceById } from '../common/helper.functions';
import { SERVICE_ENUM } from '../common/common.constants';

const boardService = new BoardService();

const boardResolver = {
  Query: {
    async getBoard(parent, { _id }) {
      return await boardService.getByID(_id);
    },

    async getBoardFollowing(parent, args, context: IAuthorization) {

      return await boardService.getBoardFollowing(context._id);
    },
    async getUserBoards(parent, args, context: IAuthorization) {

      return await boardService.getCreators(context._id);
    },
  },
  Mutation: {
    async createBoard(parent, args, context: IAuthorization) {
      return await boardService.createBoard(args, context._id);
    },

    async updateBoard(parent, args, context: IAuthorization) {
      return await boardService.updateBoard(args, context._id);
    },

    async deleteBoard(parent, {_id}, context: IAuthorization ) {
      return await boardService.deleteBoard(_id, context._id);
    },

    async startFollowingBoard(parent, {_id}, context: IAuthorization) {
      return await boardService.startFollowingBoard(_id, context._id);
    },

    async stopFollowingBoard(parent, {_id}, context: IAuthorization) {
      return await boardService.stopFollowingBoard(_id, context._id);
    },
  },

  Board: {

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
  },
};

export default boardResolver;
