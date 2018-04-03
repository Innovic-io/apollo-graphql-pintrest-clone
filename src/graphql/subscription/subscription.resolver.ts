import { PubSub } from 'graphql-subscriptions';
import { socket } from '../../server';

export const pubsub = new PubSub();

export const USER_CHANGED_TOPIC = 'user_change';
export const PIN_CHANGED_TOPIC = 'pin_change';

pubsub.subscribe(USER_CHANGED_TOPIC, (message) => socket.emit(USER_CHANGED_TOPIC, message));
pubsub.subscribe(PIN_CHANGED_TOPIC, (message) => socket.emit(PIN_CHANGED_TOPIC, message));

const subscriptionResolver = {
  Subscription: {
    userChanged: { subscribe: () => pubsub.asyncIterator(USER_CHANGED_TOPIC) },
    pinChanged: { subscribe: () => pubsub.asyncIterator(PIN_CHANGED_TOPIC) },
  },
};

export default subscriptionResolver;
