import { createObjectID } from '../graphql/common/helper.functions';
import { privateKey } from '../server.constants';
import { verifyToken } from '../graphql/common/cryptography';
import { IAuthorization } from './authorization.interface';

const AuthorizationMiddleware = async (req, res, next) => {

  try {

    if (req.body.query.indexOf('loginUser') >= 0 || req.body.query.indexOf('createUser') >= 0) {
      return next();
    }

    if (!req.headers.authorization) {

      throw new Error('Token not provided');
    }

    const [bearer, token] = req.headers.authorization.split(' ');

    const decodedToken: IAuthorization = await verifyToken(token, privateKey) as IAuthorization;

    decodedToken._id = createObjectID(decodedToken._id);

    req.user = decodedToken;
    return next();

  } catch (error) {

    return next(error.message || error);
  }
};

export default AuthorizationMiddleware;
