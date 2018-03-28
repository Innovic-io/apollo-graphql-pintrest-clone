import { PubSub } from 'graphql-subscriptions';
import { socket } from '../../server';

export const pubsub = new PubSub();

export const USER_CHANGED_TOPIC = 'emmit_change';

pubsub.subscribe(USER_CHANGED_TOPIC, (message) => {
    socket.on('connection', (subSocket) => subSocket.emit(USER_CHANGED_TOPIC, message));
  },
);

const subscriptionResolver = {
  Subscription: {
    userChanged: {
      subscribe: () => pubsub.asyncIterator(USER_CHANGED_TOPIC),
    },
    pinChanged: {
      subscribe: () => pubsub.asyncIterator(USER_CHANGED_TOPIC),
    },
  },
};
