import AuthorizationMiddleware from '../../authorization/authorization.middleware';

export const decideRole = async (context, input?) => {
  if (!input) {
    return true;
  }

  throw new Error('Not implemented');
};

const DirectiveResolver = {
  async authenticated(next, source, args, context) {
    try {
      Object.assign(context, await AuthorizationMiddleware(context.token));

      if (!decideRole(context, args.role)) {
        throw new Error('User does not have proper rights');
      }

      return next();
    } catch (error) {
      throw error;
    }
  }
};

export default DirectiveResolver;
