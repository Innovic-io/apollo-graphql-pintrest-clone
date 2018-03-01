import UserService from './user.service';
import IUser from './user.interface';

const userService = new UserService();

const userResolver = {
  Query: {

    async getAllUsers(parent) {

      return await userService.getAll();
    },

    async getUser(parent, { _id }) {

      return await userService.getUserByID(_id);
    },

    async getUserFollowings(parent, { _id }) {

      return await userService.getFollowing(_id);
    },

    async getUserFollowers(parent, { _id }) {

      return await userService.getFollowers(_id);
    },
  },

  Mutation: {

    async createUser(parent, args: IUser) {

      return await userService.createUser(args);
    },

    async createFollowingUser(parent, { followerID, _id }) {

      return await userService.startFollowing(_id, followerID);
    },

    async deleteFollowingUser(parent, { followerID, _id }) {

      return await userService.removeFollowing(_id, followerID);
    },
  },

  User: {

    async following(users) {

      return await userService.getFollowing(users._id);
    },

    async boards(users) {

    },
  },
};
export default userResolver;
