import AuthorizationMiddleware from '../../authorization/authorization.middleware';

const DirectiveResolver = {
  async authenticated(next, source, args, context) {
    try {
      Object.assign(context, await AuthorizationMiddleware(context.token));

      if (!!args.required && !context[args.required]) {
        throw new Error('User does not have proper rights');
      }

      return next();
    } catch (error) {
      throw error;
    }
  }
};

export default DirectiveResolver;
