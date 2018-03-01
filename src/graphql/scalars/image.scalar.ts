import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const parseValue = (value) => (value); // value from the client

const serialize = (value) => { // value sent to the client
  value.buffer = value.buffer.toString('base64');
  return value;
};

const parseLiteral = (ast) => null; // ast is always string format

const ImageScalarType = new GraphQLScalarType({
  name: 'ImageScalar',
  description: 'Image manipulating scalar',
  parseValue, serialize, parseLiteral,
});

export default ImageScalarType;
