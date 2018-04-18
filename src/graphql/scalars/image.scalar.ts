import { GraphQLScalarType, Kind } from 'graphql';

const parseValue = value => value; // value from the client

const serialize = value => {
  // value sent to the client
  value.buffer = value.buffer.toString('base64');
  return value;
};

const parseLiteral = ast => ast.value; // ast is always string format

const ImageScalarType = new GraphQLScalarType({
  name: 'ImageScalar',
  description: 'Image manipulating scalar',
  parseValue,
  serialize,
  parseLiteral,
});

export default ImageScalarType;
