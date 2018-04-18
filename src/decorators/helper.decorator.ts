export const overrideInjectable = target => {
  const types = Reflect.getMetadata('design:paramtypes', target) || [];
  Reflect.defineMetadata('inversify:paramtypes', types, target);
};
