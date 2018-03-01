import PinService from './pin.service';

const pinService = new PinService();

const pinResolver = {
  Query: {
    async getPin(parent, { pin }) {

      return await pinService.getPin(pin);
    },

    async getAllPins() {

      return await pinService.getAllPins();
    },
    async getUserPins(parent, {_id}) {
      return await pinService.getUserPins(_id);
    },
  },

  Mutation: {

    async createPin(parent, args ) {

      return await pinService.createPin(args);
    },
    async updatePin(parent, args) {

      return await pinService.updatePin(args);
    },
    async deletePin(parent, {_id}) {
      return await pinService.deletePin(_id);
    },
  },

  Pin: {
    async creator(pin) {
      if (!pin.creator) {
        return null;
      }

      return  await pinService.getCreatorById(pin.creator);
    },
  },
};

export default pinResolver;
