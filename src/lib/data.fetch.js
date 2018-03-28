// tslint:disable-next-line
const mongo = require('mongodb');

mongo.Collection.prototype.getData = async function () {
  switch (this.s.name) {
    case 'ocean':

      const result = await this.find({}).toArray();

      return result.map((element) => Object.assign({}, ...Object.keys(element)
        .filter((singleKey) => singleKey !== 'relations')
        .filter((singleKey) => singleKey !== 'properties')
        .filter((singleKey) => singleKey !== 'meta')
        .map((singleKey) => Object.assign({}, {[ singleKey ]: element[ singleKey ]},
          makeMeta(element.meta),
          makeProperties(element.properties)),
        )));

    case 'objects':
      return this.aggregate([
        // Stage 1
        {
          $unwind: '$properties',
        },

        // Stage 2
        {
          $lookup: {
            from: 'parameters',
            localField: 'properties.definition',
            foreignField: '_id',
            as: 'parameters',
          },
        },

        // Stage 3
        {
          $unwind: '$parameters',
        },

        // Stage 4
        {
          $project: {
            _id: 1,
            model: 1,
            company: 1,
            type: 1,
            complex: 1,
            entity: 1,
            parameter: {
              name: '$parameters.name',
              value: '$properties.value.current',
            },
          },
        },

        // Stage 5
        {
          $group: {
            _id: '$_id',
            rootComapny: {$first: '$company'},
            rootComplex: {$first: '$complex'},
            rootEntity: {$first: '$entity'},
            rootModel: {$first: '$model'},
            rootType: {$first: '$type'},
            parameters: {$push: '$parameter'},
          },
        },

        // Stage 6
        {
          $project: {
            _id: 1,
            rootComapny: 1,
            rootComplex: 1,
            rootEntity: 1,
            rootModel: 1,
            rootType: 1,
            replacingRoot: {
              $arrayToObject: {
                $map: {
                  input: '$parameters',
                  as: 'pair',
                  in: [ '$$pair.name', '$$pair.value' ],
                },
              },
            },
          },
        },

        // Stage 7
        {
          $addFields: {
            'replacingRoot.company': '$rootComapny',
            'replacingRoot.complex': '$rootComplex',
            'replacingRoot.type': '$rootType',
            'replacingRoot.model': '$rootModel',
            'replacingRoot.entity': '$rootEntity',
            'replacingRoot._id': '$_id',
          },
        },

        // Stage 8
        {
          $replaceRoot: {
            newRoot: '$replacingRoot',
          },
        },
      ])
        .toArray();

    case 'users':
      return this.find({})/*this.aggregate([
          {
            $lookup: {
              from: 'boards',
              localField: 'boards',
              foreignField: '_id',
              as: 'boards',
            },
          },
          {
            $lookup: {
              from: 'pins',
              localField: 'pins',
              foreignField: '_id',
              as: 'pins',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'following',
              foreignField: '_id',
              as: 'following',
            },
          },
          {
            $project: {
              _id: 1,
              following: 1,
              first_name: 1,
              username: 1,
              created_at: 1,
              boards: 1,
              pins: 1,

            }
          }
        ])*/
        .toArray();

    default:
      return this.find({}).toArray();
  }
};

function makeMeta(meta) {

  if (!meta) {
    return {};
  }

  return Object.assign({}, ...Object
    .keys(meta)
    .map((singleKey) => Object.assign({}, {[ singleKey ]: meta[ singleKey ].value})));
}

function makeProperties(properties) {

  if (properties.length === 0) {
    return {};
  }
  const endingObject = [];
  properties
    .forEach((singleElem) =>
      Object
        .keys(singleElem)
        .forEach((singleKey) =>
          endingObject
            .push({[ singleElem[ singleKey ].definition.name ]: singleElem[ singleKey ].value.value}),
        ),
    );

  return Object.assign({}, ...endingObject);
}

async function getCollectionNames(database) {
  return await database
    .collections()
    .then(listOfCollections => listOfCollections
      .map((collection) => collection.s.name),
    );
}

async function getAllCollectionsData(database) {
  const collections = await getCollectionNames(database);
  const output = [];
  for (const collection of collections) {

    output.push({
      [ collection ]: await database.collection(collection)
        .getData(),
    });
  }

  return output;
}

module.exports = {
  getAllCollectionsData
};
