import { materializeRecordFromSchema } from '../../materializeRecord';

const usersSchema = {
  username: { formType: 'text', required: [true, 'Field is Required'] },
  LastBoolean: { formType: 'checkbox', default: true },
  selectItem: { formType: 'select', default: 1 },
};

describe('materializeRecordFromSchema', () => {
  it('projects defaults from the schema, not from ad-hoc fields', () => {
    expect(materializeRecordFromSchema(usersSchema)).toEqual({
      username: '',
      LastBoolean: true,
      selectItem: 1,
    });
  });

  it('fills schema slots from source and ignores extra keys', () => {
    expect(
      materializeRecordFromSchema(usersSchema, {
        _id: 'user-demo',
        username: 'demo',
        mystery: 'nope',
      })
    ).toEqual({
      _id: 'user-demo',
      username: 'demo',
      LastBoolean: true,
      selectItem: 1,
    });
  });
});
