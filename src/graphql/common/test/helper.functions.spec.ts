import { ObjectID } from 'mongodb';

import { createObjectID, makeString } from '../helper.functions';

describe('Helper function', () => {

  const id = '5a85574b847a38444d536a5e';
  it('should create ObjectID', () => {

    expect(createObjectID(id)).toEqual(new ObjectID('5a85574b847a38444d536a5e'));
  });

  it('should validate ObjectID', () => {

    expect(ObjectID.isValid(id)).toBe(true);
  });

  it('should make proper string', () => {
    const object = {name: 'Unique Name', description: 'Board description'};
    expect(makeString(object)).toBe(`name:"Unique Name",description:"Board description"`);
  });
});
