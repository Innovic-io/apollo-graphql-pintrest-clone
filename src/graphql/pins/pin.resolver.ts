import { inject, injectable } from 'inversify';

import { IAuthorization } from '../../authorization/authorization.interface';
import { getServiceById } from '../../common/helper.functions';
import { SERVICE_ENUM } from '../../common/common.constants';
import { IPin, IPinResolver, IPinService } from './pin.interface';
import { PIN_CHANGED_TOPIC, pubsub } from '../subscription/subscription.resolver';
import { SERVICE_TYPES } from '../../inversify/inversify.types';

let pinService;

// if something need to be verified, Authorization is stored in context
@injectable()
export default class PinResolver implements IPinResolver {
  private Query;
  private Mutation;
  private Subscription;
  private Pin;

  constructor(
    @inject(SERVICE_TYPES.PinService) injectedPinService: IPinService,
  ) {
    this.setQuery();
    this.setMutation();
    this.setPin();
    this.setSubscription();
    pinService = injectedPinService;
  }

  setQuery() {
    this.Query = {

      async getPin(parent, { _id }) {
        return await pinService.getByID(_id);
      },

      async getAllPins() {

        const allUsers = await pinService.getAllPins();
        const [ single ] = allUsers;
        pubsub.publish(PIN_CHANGED_TOPIC, { pinChanged: single });
        return allUsers;
      },

      // get pins from authorized user
      async getUserPins(parent, args, context: IAuthorization) {
        return await pinService.getUserPins(context._id);
      },

      async getPinsFromBoard(parent, { boardID }, context: IAuthorization) {
        return await pinService.getPinsFromBoard(boardID, context._id);
      },
    };

    return this;
  }

  setMutation() {
    this.Mutation = {

      async createPin(parent, args, context: IAuthorization) {
        return await pinService.createPin(args, context._id);
      },

      async updatePin(parent, args, context: IAuthorization) {
        await pinService.checkPinPermission(args._id, context._id);
        return await pinService.updatePin(args, context._id);
      },

      async deletePin(parent, { _id }, context: IAuthorization) {
        return await pinService.deletePin(_id, context._id);
      },
    };
    return this;
  }

  setPin() {
    this.Pin = {

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
    };
    return this;
  }

  setSubscription() {
    this.Subscription = {
      pinChanged: {
        subscribe: () => pubsub.asyncIterator(PIN_CHANGED_TOPIC),
      },
    };

    return this;
  }

  getAll() {
    return {
      Query: this.Query,
      Mutation: this.Mutation,
      Pin: this.Pin,
      Subscription: this.Subscription,
    };
  }
}
