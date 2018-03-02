import BoardService from './board.service';
import { IAuthorization } from '../../authorization/authorization.interface';

const boardService = new BoardService();

const boardResolver = {
  Query: {},
  Mutation: {
    async createBoard(parent, args) {
      return await boardService.createBoard(args);
    },
    async updateBoard(parent, args, context: IAuthorization) {
      return await boardService.updateBoard(args, context._id);
    },
    async deleteBoard(parent, {_id}, context: IAuthorization ) {
      return await boardService.deleteBoard(_id, context._id);
    },
  },
};

export default boardResolver;
