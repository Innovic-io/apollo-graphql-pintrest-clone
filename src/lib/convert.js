// tslint:disable-next-line
const { isValid } = require('./object.id');

let graphQL = [];

const userCalls = [ 'creator', 'followers', 'collaborators', 'following' ];

function filterOutDistinctKeys(data) {
  let items = [ data ];
  if (!!data && data instanceof Array) {
    items = data || [];
  }

  const distinctItems = [];
  const input = [];

  items
    .forEach((element) => Object.keys(element)
      .filter((objectKey) => !!element[ objectKey ])
      .forEach((objectKey) => input.push({[ objectKey ]: element[ objectKey ]})));

  const item = Object.assign({}, ...input);
  for (const key of Object.keys(item)) {
    const dataKey = toCamelCase(key);
    const dataType = makeType(item[ key ], key);

    if (distinctItems.findIndex((singleItem) => singleItem.dataKey === dataKey) < 0) {
      distinctItems.push({dataKey, dataType});
    }
  }

  return distinctItems;
}

function makeType(element, key) {

  switch (typeof element) {
    case 'string':
      return 'String';

    case 'number':
      // tslint:disable-next-line
      return (element === (element | 0)) ? 'Int' : 'Float';

    case 'boolean':
      return 'Boolean';

    case 'object': {

      if (element instanceof Date) {

        return 'Date';
      }

      if (element instanceof Array) {
        const [ arrayElement ] = element;
        if(!arrayElement) {
          return undefined;
        }

        return `[ ${makeType(arrayElement, key)} ]`;
      }

      if (isValid(element)) {
        if (key.toLocaleLowerCase() === '_id') {
          return 'ID';
        }

        if (userCalls.includes(key.toLocaleLowerCase())) {
          return 'User';
        }
      }

      return capitilize(toSingular(key));
    }
    default:
      return element;
  }
}

function capitilize(name) {
  return name[ 0 ].toUpperCase() + name.slice(1).toLowerCase();
}

function fistSmallLetter(name) {
  return name[ 0 ].toLowerCase() + name.slice(1);
}

function toCamelCase(name) {
  const fragmented = name.split(' ');

  if (fragmented.length === 1) {
    return fistSmallLetter(name);
  }

  const uppercase = fragmented.map((piece) => capitilize(piece));
  uppercase[ 0 ] = uppercase[ 0 ].toLowerCase();

  return uppercase.join('');
}

function createGraphQLType(typeName, data) {
  return `type ${capitilize(typeName)} {\n${data.map((item) => `\t${item.dataKey}: ${item.dataType}`).join('\n')}\n}`;
}

function addSubTypes(collectionData) {

  let single;

  if (collectionData instanceof Array) {
    [ single ] = collectionData;
  } else {
    single = collectionData;
  }
  if (!single) {
    return '';
  }
  const result = Object
    .keys(single)
    .filter((key) => typeof single[ key ] === 'object')
    .filter((key) => !isValid(single[ key ]))
    .filter((key) => !userCalls.includes(key))
    .filter((key) => !(single[ key ] instanceof Date))
    .map((key) => createGraphQLType(key, filterOutDistinctKeys(single[ key ])))
    .join('');

  if (!graphQL.includes(result)) {
    return result;
  }
}

function createGraphQL(collectionData) {
  graphQL = [];

  if (collectionData instanceof Array) {
    collectionData
      .forEach((collection) => graphQL.push(...helperFunction(collection)));
  } else {
    graphQL.push(...helperFunction(collectionData));
  }

  return graphQL
    .filter((element) => !!element)
    .join('\n\n');
}

function helperFunction(collection) {

  return [].concat(...Object.keys(collection)
    .map((collectionKey) => [].concat(addSubTypes(collection[ collectionKey ]),
      createGraphQLType(toSingular(collectionKey), filterOutDistinctKeys(collection[ collectionKey ]))),
    ));
}

function toSingular(entryCollection) {

  const collection = entryCollection.toLocaleLowerCase();

  switch (collection) {

    case 'objects':
      return 'object';

    case 'companies':
      return 'company';

    case 'complexes':
      return 'complex';

    default: {
      if (collection.endsWith('s')) {
        return collection.substring(0, collection.length - 1);
      }
      return collection;
    }
  }
}

module.exports = {
  createGraphQL
};
