import * as crypto from 'crypto';
import { decode, sign, verify } from 'jsonwebtoken';
import { privateKey } from '../../server.constants';

interface ITokenConfig {
  secret: string;
  token_expiration: string;
}

const config: ITokenConfig =  {
  secret: privateKey,
  token_expiration: '45 days',
};

const salt: string = crypto.randomBytes(128).toString('base64');

const diggest: string = 'sha256';

export const LENGTH: number = 64;

// timeout in ms for comparePassword / hashPassword
const timeout: number = 500;

/**
 * Cryptographic hash of passed input value.
 *
 * Authentication is done with NodeJS implementation of JSON Web Token ( JWT ) standards.
 *
 * @link https://en.wikipedia.org/wiki/JSON_Web_Token
 * @link http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
 *
 * Implementation
 *
 * - Library used: https://github.com/auth0/node-jsonwebtoken
 * - Algorithm used for signing ( from node package crypto ): pbkdf2
 *
 * @link https://en.wikipedia.org/wiki/PBKDF2
 *
 * @param input
 * @param callback
 */
export interface IHashedPassword {
  hash: string;
  salt: string;
}

/**
 * Hash password with pbkdf2 algorithm
 *
 * @param input
 * @return Promise<IHashedPassword>
 */
export function hashPassword(input: string): Promise<IHashedPassword> {

  return new Promise<IHashedPassword>((resolve: (data) => void, reject: (data) => void) => {

    crypto.pbkdf2(input, salt, 10000, LENGTH, diggest, (err?: Error, hash?: Buffer) => {
      if (err) {
        reject(err);
      } else {
        // return hexadecimal representation of hash
        setTimeout(() => { resolve({hash: hash.toString('hex'), salt}); }, timeout);
      }
    });
  });
}

/**
 * Test current user password against one from input filed.
 *
 * @param input     Password from input
 * @param salted     Salt used to generate old password
 * @param match     User current password
 * @return Promise<boolean>
 */
export function comparePasswords(input: string, salted: string, match: string): Promise<boolean> {

  return new Promise<boolean>((resolve: (data) => void, reject: (data) => void) => {

    crypto.pbkdf2(input, salted, 10000, LENGTH, diggest, (err: Error, hash: Buffer) => {
      if (err) {
        reject(err);
      } else {
        setTimeout(() => { resolve((hash.toString('hex') === match) as boolean); }, timeout);
      }
    });
  });
}

/**
 * Generate security token based on input hash
 *
 * Expiring in 45 days.
 *
 * @param hash
 * @param expires
 * @returns string
 */
export function generateToken(hash: {}, expires?: string): string {

  return (typeof hash === 'object') ? sign(hash, config.secret, { expiresIn: expires || config.token_expiration }) : '';
}

/**
 * Verify validity of token.
 *
 * @param token
 * @param secret
 */
export function verifyToken(token: string, secret: string): Promise<{}> {

  return new Promise<{}>((resolve: (data) => void, reject: (data) => void) => {
    // call verify function from jsonwebtoken
    verify(token, secret, (err: Error, decoded: {}) => {
      if (err) {
        reject('Invalid token');
      } else {
        resolve(decoded);
      }
    });
  });
}

/**
 * Decode token into readable object.
 *
 * @param token
 * @returns {any}
 */
export function decodeToken(token: string): {}  {
  return decode(token);
}
