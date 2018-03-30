const { isValid, ObjectID } = require('./object.id');

let entireCollectionData;

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
      .filter((objectKey) => objectKey !== 'relations')
      .forEach((objectKey) =>
        input.push({[ objectKey ]: element[ objectKey ]})
      )
    );

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
        if (!arrayElement) {
          return;
        }

        return `[ ${makeType(arrayElement, key)} ]`;
      }

      if (isValid(element)) {
        element = new ObjectID(element);

        if (key.toLocaleLowerCase() === '_id' || key.toLocaleLowerCase() === 'id') {

          return 'ID';
        }

        if (!entireCollectionData) {

          return capitilize(key);
        }

        const isExistingSubType = entireCollectionData
          .map((collectionNames) => Object
            .keys(collectionNames)
            .map((collectionKey) => subTypeName(collectionNames[ collectionKey ], collectionKey, element))
            .join(''),
          )
          .filter((foundCollections) => !!foundCollections && foundCollections.length > 0);


        if (isExistingSubType.length > 1) {
          throw new Error('More that one collection found');
        }

        if (isExistingSubType.length === 1) {
          return capitilize(toSingular(isExistingSubType.join('')));
        }
      }

      if (!entireCollectionData) {

        return capitilize(key);
      }

      let collectionArray = [ entireCollectionData ];

      if (entireCollectionData instanceof Array) {
        collectionArray = entireCollectionData;
      }

      const type = collectionArray
        .map((singleElement) => {
          const [ elementKey ] = Object.keys(singleElement);

          if (singleElement[ elementKey ] instanceof Array) {

            return (!!singleElement[ elementKey ]
              .find((objectElement) => {
                if (isValid(element)) {
                  return objectElement._id.equals(element);
                }

                if(!objectElement._id) {
                  return;
                }

                return objectElement._id.equals(element._id);
              })) ? elementKey : undefined;
          }
        })
        .filter((objectKeys) => !!objectKeys);

      const [ references ] = type;

      if (!!references) {
        return capitilize(toSingular(references));
      }

      return capitilize(toSingular(key));
    }
    default:
      return element;
  }
}

function subTypeName(entireCollection, collectionKey, element = '') {

  if (entireCollection instanceof Date) {
    return;
  }

  if (entireCollection instanceof Array) {

    const foundCollection = entireCollection.find((singleElement) => {

      if (isValid(singleElement)) {
        return singleElement.equals(element);
      }

      if (!singleElement._id) {
        return true
      }
      return singleElement._id.equals(element);
    });

    return (!!foundCollection) ? collectionKey : undefined;
  }

  if (!entireCollection || !entireCollection._id) {

    return typeof collectionKey;
  }

  return collectionKey;
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

  const toPrint = data
    .filter((item) => !!item.dataType)
    .map((item) => `\t${item.dataKey}: ${item.dataType}`)
    .join('\n');

  return `type ${capitilize(typeName)} {\n${toPrint}\n}`;
}

function addSubTypes(collectionData) {

  if(!collectionData) {
    return;
  }

  const collectionArray = (collectionData instanceof Array) ?
    collectionData : [ collectionData ];

  if (collectionArray.length === 0) {
    return;
  }

  return [].concat(...collectionArray
    .map((single) => Object
      .keys(single)
      .filter((key) => typeof single[ key ] === 'object')
      .filter((key) => !isValid(single[ key ]))
      .filter((key) => !!single[ key ])
      .filter((key) => !!subTypeName(single[ key ], key))
      .filter((key) => !(single[ key ] instanceof Date))
      .map((key) => createGraphQLType(
        toSingular(key),
        filterOutDistinctKeys(single[ key ]))
      ),
    )
    .filter((listOfResults) => listOfResults.length > 0),
  );
}

function createGraphQL(collectionData) {
  const graphQL = [];
  entireCollectionData = collectionData;

  if (collectionData instanceof Array) {
    collectionData
      .forEach((collection) => graphQL.push(...helperFunction(collection)));
  } else {
    graphQL.push(...helperFunction(collectionData));
  }

  const finalGraph = [];
  graphQL
    .filter((element) => !!element)
    .map((element) => {
      const typeName = element.substring(0, element.indexOf(' {'));
      if(!finalGraph.find((elemen) => element.length >= elemen.length && elemen.startsWith(typeName)) ) {
        finalGraph.push(element);
      }
    });

  return finalGraph
    .join('\n\n');
}

function helperFunction(collection) {

  return [].concat(...Object.keys(collection)
    .filter((collectionKey) => !!collection[collectionKey])
    .map((collectionKey) => [].concat(
      createGraphQLType(
        toSingular(collectionKey),
        filterOutDistinctKeys(collection[ collectionKey ]),
      ),
      addSubTypes(collection[ collectionKey ]),
      )
    ),
  );
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
  addSubTypes,
  capitilize,
  createGraphQL,
  createGraphQLType,
  filterOutDistinctKeys,
  fistSmallLetter,
  makeType,
  toCamelCase,
  toSingular,
};
