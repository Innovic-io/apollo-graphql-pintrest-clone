import PinService from './pin.service';
import { IAuthorization } from '../../authorization/authorization.interface';
import { getServiceById } from '../common/helper.functions';
import { ServerEnum } from '../common/common.constants';

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
  },

  Mutation: {

    async createPin(parent, args ) {
      return await pinService.createPin(args);
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

    async creator(pin) {
      if (!pin.creator) {
        return null;
      }

      return await getServiceById(pin.creator, ServerEnum.USERS);
    },
  },
};

export default pinResolver;
