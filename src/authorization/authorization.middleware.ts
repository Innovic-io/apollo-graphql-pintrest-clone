import { createObjectID } from '../common/helper.functions';
import { privateKey } from '../server.constants';
import { verifyToken } from '../common/cryptography';
import { IAuthorization } from './authorization.interface';

const AuthorizationMiddleware = async sentToken => {
  if (!sentToken) {
    throw new Error('Token not provided');
  }

  const [, token] = sentToken.split(' ');

  const decodedToken: IAuthorization = (await verifyToken(
    token,
    privateKey
  )) as IAuthorization;

  decodedToken._id = createObjectID(decodedToken._id);

  return decodedToken;
};

export default AuthorizationMiddleware;
