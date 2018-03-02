import UserService from './user.service';
import IUser from './user.interface';
import { IAuthorization } from '../../authorization/authorization.interface';

const userService = new UserService();

// if something need to be verified, in context field is
// results of authorization.middleware

const userResolver = {
  Query: {

    async getAllUsers(parent, args) {

      return await userService.getAll();
    },

    async getUser(parent, { _id }) {

      return await userService.getByID(_id);
    },

    async getUserFollowings(parent, {}, context: IAuthorization) {

      return await userService.getFollowing(context._id, 'following');
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

    async createFollowingUser(parent, { _id }, context: IAuthorization) {

      return await userService.startFollowingUser(_id, context._id);
    },

    async deleteFollowingUser(parent, {_id }, context: IAuthorization) {

      return await userService.removeFollowing(_id, context._id);
    },
  },

  User: {

    async following(users: IUser) {

      return await userService.getFollowing(users._id, 'following');
    },

    async boards(users: IUser) {

      return await userService.getFollowing(users._id, 'boards');

    },
  },
};
export default userResolver;
