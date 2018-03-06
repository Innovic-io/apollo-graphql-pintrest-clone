import UserService from './user.service';
import IUser from './user.interface';
import { IAuthorization } from '../../authorization/authorization.interface';
import { USERS_ELEMENT } from '../common/common.constants';

const userService = new UserService();

// if something need to be verified, in context field is
// results of authorization.middleware

const userResolver = {
  Query: {

    async getAllUsers(parent, args) {

      return await userService.getAll();
    },

    async getUser(parent, { }, context: IAuthorization) {

      return await userService.getByID(context._id);
    },

    async getUserFollowings(parent, {}, context: IAuthorization) {

      return await userService.getFollowing(context._id, USERS_ELEMENT.FOLLOWING);
    },

    async getUserFollowers(parent, {}, context: IAuthorization) {

      return await userService.getFollowers(context._id);
    },
  },

  Mutation: {

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
  },

  User: {

    async following(users: IUser) {

      return await userService.getFollowing(users._id, USERS_ELEMENT.FOLLOWING);
    },

    async pins(users: IUser) {

      return await userService.getFollowing(users._id, USERS_ELEMENT.PINS);
    },

    async boards(users: IUser) {

      return await userService.getFollowing(users._id, USERS_ELEMENT.BOARDS);
    },
  },
};
export default userResolver;
