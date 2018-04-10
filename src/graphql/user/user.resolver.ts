import { inject, injectable } from 'inversify';

import { IUser, IUserResolver, IUserService } from './user.interface';
import { IAuthorization } from '../../authorization/authorization.interface';
import { USERS_ELEMENT } from '../../common/common.constants';
import { pubsub, USER_CHANGED_TOPIC } from '../subscription/subscription.resolver';
import { SERVICE_TYPES } from '../../inversify/inversify.types';

// if something need to be verified, in context field is
// results of authorization.middleware
let userService;

@injectable()
export default class UserResolver implements IUserResolver {
  private Query;
  private Mutation;
  private User;
  private Subscription;

  constructor(
    @inject(SERVICE_TYPES.UserService) injectedUserService: IUserService
  ) {
    this.setQuery();
    this.setMutation();
    this.setSubscriptions();
    this.setUser();
    userService = injectedUserService;
  }

  setQuery() {
    this.Query = {
      async getAllUsers() {

        const allUsers = await userService.getAll();
        const [ single ] = allUsers;
        pubsub.publish(USER_CHANGED_TOPIC, { userChanged: single.username });

        return await userService.getAll();
      },

      async getUser(parent, {}, context: IAuthorization) {

        return await userService.getByID(context._id);
      },

      async getUserFollowings(parent, {}, context: IAuthorization) {

        return await userService.getFollowing(context._id, USERS_ELEMENT.FOLLOWING);
      },

      async getUserFollowers(parent, {}, context: IAuthorization) {

        return await userService.getFollowers(context._id);
      },
    };

    return this;
  }

  setMutation() {
    this.Mutation = {
      async loginUser(parent, { username, password }) {

        return await userService.login(username, password);
      },

      async createUser(parent, args: IUser) {

        return await userService.createUser(args);
      },

      async followUser(parent, { _id }, context: IAuthorization) {

        return await userService.startFollowingUser(_id, context._id);
      },

      async stopFollowingUser(parent, {_id }, context: IAuthorization) {

        return await userService.removeFromSet(_id, context._id, USERS_ELEMENT.FOLLOWING);
      },
    };

    return this;
  }

  setUser() {
    this.User = {
      async following(users: IUser) {

        return await userService.getFollowing(users._id, USERS_ELEMENT.FOLLOWING);
      },

      async pins(users: IUser) {

        return await userService.getFollowing(users._id, USERS_ELEMENT.PINS);
      },

      async boards(users: IUser) {

        return await userService.getFollowing(users._id, USERS_ELEMENT.BOARDS);
      },
    };

    return this;
  }

  setSubscriptions() {
    this.Subscription = {
      userChanged: { subscribe: () => pubsub.asyncIterator(USER_CHANGED_TOPIC) },
    };

    return this;
  }

  getAll() {
    return {
      Query: this.Query,
      Mutation: this.Mutation,
      User: this.User,
      Subscription: this.Subscription,
    };
  }
}
