import { GraphQLScalarType, Kind } from 'graphql';

const parseValue = (value) =>  new Date(value);
const serialize = (value) => new Date(value);
const parseLiteral = (ast) => {

  if (ast.kind === Kind.INT) {
    return parseInt(ast.value, 10); // ast value is always in string format
  }

  if (ast.kind === Kind.STRING) {
    return new Date(ast.value).toISOString();
  }

  return null;
};

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue,
  serialize,
  parseLiteral,
});

export default DateType;
