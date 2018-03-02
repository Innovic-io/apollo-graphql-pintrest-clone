import * as webToken from 'jsonwebtoken';

import { createObjectID } from '../graphql/common/helper.functions';
import { privateKey } from '../server.constants';

const AuthorizationMiddleware = (req, res, next) => {

  // @TODO
  // how to not implement middleware in case of login/signup?
  // and how to provide it in graphiql
  if (req.body.query.indexOf('loginUser') >= 0 || req.body.query.indexOf('createUser') >= 0) {
    return next();
  }

  if (!!req.headers.referer && req.headers.referer.indexOf('graphiql')) {

    req.user = {
      _id: createObjectID('5a97d0457f847303067fb15d'),
      username: 'user1',
      password: 'pass',
    };

    return next();
  }

  if (!req.headers.authorization) {
    throw new Error('Token not provided');
  }

  const [bearer, token] = req.headers.authorization.split(' ');

  const decodedToken = webToken.verify(token.toString(), privateKey);
  decodedToken._id = createObjectID(decodedToken._id);

  req.user = decodedToken;
  return next();
};

export default AuthorizationMiddleware;
