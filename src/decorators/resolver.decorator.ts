import { overrideInjectable } from './helper.decorator';

const resolverQueries = {
  Query: {},
  Mutation: {},
  Subscription: {},
  Resolver: {},
};

let scalars = {};

enum RESOLVE_TYPE {
  QUERY = 'Query',
  MUTATION = 'Mutation',
  SUBSCRIPTION = 'Subscription',
  RESOLVER = 'Resolver',
}

function clearResolverQueries(typeToResolve) {
  resolverQueries.Query = {};
  resolverQueries.Subscription = {};
  resolverQueries.Mutation = {};
  resolverQueries.Resolver = {};
  delete resolverQueries[typeToResolve];
}

export const Scalar = () => (target) => {
  overrideInjectable(target);
  const resolved = {...scalars};

  target.prototype.getAll = () => resolved;
  scalars = {};
  return target;
};

export function Resolver(typeToResolve: string) {
  resolverQueries[typeToResolve] = resolverQueries.Resolver;
  delete resolverQueries.Resolver;
  return (target) => {

    overrideInjectable(target);
    const resolved = {...resolverQueries};
    target.prototype.getAll = () => resolved;
    clearResolverQueries(typeToResolve);
    return target;
  };
}

export const Query = (functionName?: string) =>
  (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.QUERY, functionName || propertyKey, descriptor);

export const Mutation = (functionName?: string) =>
  (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.MUTATION, functionName || propertyKey, descriptor);

export const Subscription = (subscriptionName?: string) =>
  (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.SUBSCRIPTION, subscriptionName || propertyKey, descriptor);

export const ResolveProperty = (functionName?: string) =>
  (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.RESOLVER, functionName || propertyKey, descriptor);

export const ScalarItem = (scalarType) =>
  (target, propertyKey) => scalars[propertyKey] = scalarType;

const functionReturn = (resolveType: string, propertyKey: string, descriptor: PropertyDescriptor) => Object.assign(
  resolverQueries[resolveType],
  {[propertyKey]: descriptor.value});
