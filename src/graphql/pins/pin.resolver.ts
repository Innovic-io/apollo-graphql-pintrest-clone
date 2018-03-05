import PinService from './pin.service';
import { IAuthorization } from '../../authorization/authorization.interface';
import { getServiceById } from '../common/helper.functions';
import { SERVICE_ENUM } from '../common/common.constants';
import IPin from './pin.interface';

const pinService = new PinService();

// if something need to be verified, in context field is
// results of authorization.middleware

const pinResolver = {
  Query: {

    async getPin(parent, { pin }) {
      return await pinService.getByID(pin);
    },

    async getAllPins() {
      return await pinService.getAllPins();
    },

    async getUserPins(parent, {}, context: IAuthorization) {
      return await pinService.getUserPins(context._id);
    },

    async getPinsFromBoard(parent, {board}, context: IAuthorization) {
      return await pinService.getPinsFromBoard(board, context._id);
    },
  },

  Mutation: {

    async createPin(parent, args, context: IAuthorization ) {
      return await pinService.createPin(args, context._id);
    },

    async updatePin(parent, args, context: IAuthorization) {
      await pinService.checkPinPermission(args._id, context._id);
      return await pinService.updatePin(args, context._id);
    },

    async deletePin(parent, {_id}, context: IAuthorization) {
      return await pinService.deletePin(_id, context._id);
    },
  },

  Pin: {

    async creator(pin: IPin) {
      if (!pin.creator) {
        return null;
      }

      return await getServiceById(pin.creator, SERVICE_ENUM.USERS);
    },

    async board(pin: IPin) {
      if (!pin.board) {
        return null;
      }

      return await getServiceById(pin.board, SERVICE_ENUM.BOARDS);
    },
  },
};

export default pinResolver;
