import { inject } from 'inversify';

import { IUser, IUserService } from './user.interface';
import { IAuthorization } from '../../authorization/authorization.interface';
import { IResolver, USERS_ELEMENT } from '../../common/common.constants';
import {
  pubsub,
  USER_CHANGED_TOPIC
} from '../subscription/subscription.resolver';
import { SERVICE_TYPES } from '../../inversify/inversify.types';
import {
  Query,
  Resolver,
  Mutation,
  ResolveProperty
} from '../../decorators/resolver.decorator';
import { createObjectID } from "../../common/helper.functions";

// if something need to be verified, in context field is
// results of authorization.middleware
let userService;

@Resolver('User')
export default class UserResolver implements IResolver {
  constructor(
    @inject(SERVICE_TYPES.UserService) injectedUserService: IUserService
  ) {
    userService = injectedUserService;
  }

  @Query()
  async getAllUsers() {
    const allUsers = await userService.getAll();
    const [single] = allUsers;
    pubsub.publish(USER_CHANGED_TOPIC, { userChanged: single.username });

    return await userService.getAll();
  }

  @Query()
  async getUser(parent, args, context: IAuthorization) {
    return await userService.getByID(context._id);
  }

  @Query()
  async getUserFollowings(parent, args, context: IAuthorization) {
    return await userService.getFollowing(context._id, USERS_ELEMENT.FOLLOWING);
  }

  @Query()
  async getUserFollowers(parent, args, context: IAuthorization) {
    return await userService.getFollowers(context._id);
  }

  @Mutation()
  async loginUser(parent, { username, password }) {
    return await userService.login(username, password);
  }

  @Mutation()
  async createUser(parent, args: IUser) {
    return await userService.createUser(args);
  }

  @Mutation()
  async followUser(parent, { _id }, context: IAuthorization) {
    return await userService.startFollowingUser(_id, context._id);
  }

  @Mutation()
  async stopFollowingUser(parent, { _id }, context: IAuthorization) {
    return await userService.removeFromSet(
      context._id,
      createObjectID(_id),
      USERS_ELEMENT.FOLLOWING
    );
  }

  @ResolveProperty()
  async following(users: IUser) {
    return await userService.getFollowing(users._id, USERS_ELEMENT.FOLLOWING);
  }

  @ResolveProperty()
  async pins(users: IUser) {
    return await userService.getFollowing(users._id, USERS_ELEMENT.PINS);
  }

  @ResolveProperty()
  async boards(users: IUser) {
    return await userService.getFollowing(users._id, USERS_ELEMENT.BOARDS);
  }

  getAll() {}
}
