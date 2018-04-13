const resolverQueries = {
  Query: {},
  Mutation: {},
  Subscription: {},
  Resolver: {},
};

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

export function Resolver(typeToResolve: string) {
  resolverQueries[typeToResolve] = resolverQueries.Resolver;
  delete resolverQueries.Resolver;
  return (target) => {

    const types = Reflect.getMetadata('design:paramtypes', target) || [];
    Reflect.defineMetadata('inversify:paramtypes', types, target);
    const resolved = {...resolverQueries};
    target.prototype.getAll = () => resolved;
    clearResolverQueries(typeToResolve);
    return target;
  };
}

export function Query(functionName?: string) {

  return (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.QUERY, functionName || propertyKey, descriptor);
}

export function Mutation(functionName?: string) {

  return (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.MUTATION, functionName || propertyKey, descriptor);
}

export function Subscription(subscriptionName?: string) {

  return (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.SUBSCRIPTION, subscriptionName || propertyKey, descriptor);
}

export function ResolveProperty(functionName?: string) {

  return (target, propertyKey: string, descriptor: PropertyDescriptor) =>
    functionReturn(RESOLVE_TYPE.RESOLVER, functionName || propertyKey, descriptor);
}

const functionReturn = (resolveType: string, propertyKey: string, descriptor: PropertyDescriptor) => Object.assign(
  resolverQueries[resolveType],
  {[ propertyKey ]: descriptor.value});
