import { inject } from 'inversify';

import { IAuthorization } from '../../authorization/authorization.interface';
import { getServiceById } from '../../common/helper.functions';
import { IResolver, SERVICE_ENUM } from '../../common/common.constants';
import { IPin, IPinService } from './pin.interface';
import {
  PIN_CHANGED_TOPIC,
  pubsub
} from '../subscription/subscription.resolver';
import { SERVICE_TYPES } from '../../inversify/inversify.types';
import {
  Mutation,
  Query,
  ResolveProperty,
  Resolver,
  Subscription
} from '../../decorators/resolver.decorator';

let pinService;

// if something need to be verified, Authorization is stored in context
@Resolver('Pin')
export default class PinResolver implements IResolver {
  constructor(
    @inject(SERVICE_TYPES.PinService) injectedPinService: IPinService
  ) {
    pinService = injectedPinService;
  }

  @Query()
  async getPin(parent, { _id }) {
    return await pinService.getByID(_id);
  }

  @Query()
  async getAllPins() {
    const allUsers = await pinService.getAllPins();
    const [single] = allUsers;
    pubsub.publish(PIN_CHANGED_TOPIC, { pinChanged: single.name });
    return allUsers;
  }

  // get pins from authorized user
  @Query()
  async getUserPins(parent, args, context: IAuthorization) {
    return await pinService.getUserPins(context._id);
  }

  @Query()
  async getPinsFromBoard(parent, { boardID }, context: IAuthorization) {
    return await pinService.getPinsFromBoard(boardID, context._id);
  }

  @Mutation()
  async createPin(parent, args, context: IAuthorization) {
    return await pinService.createPin(args, context._id);
  }

  @Mutation()
  async updatePin(parent, args, context: IAuthorization) {
    await pinService.checkPinPermission(args._id, context._id);
    return await pinService.updatePin(args, context._id);
  }

  @Mutation()
  async deletePin(parent, { _id }, context: IAuthorization) {
    return await pinService.deletePin(_id, context._id);
  }

  @ResolveProperty()
  async creator(pin: IPin) {
    if (!pin.creator) {
      return null;
    }

    return await getServiceById(pin.creator, SERVICE_ENUM.USERS);
  }

  @ResolveProperty()
  async board(pin: IPin) {
    if (!pin.board) {
      return null;
    }

    return await getServiceById(pin.board, SERVICE_ENUM.BOARDS);
  }

  @Subscription()
  pinChanged() {
    return {
      subscribe: () => pubsub.asyncIterator(PIN_CHANGED_TOPIC)
    };
  }

  getAll() {}
}
