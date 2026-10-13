import { materializeRecordFromSchema } from '../../materializeRecord';

const usersSchema = {
  username: { formType: 'text', required: [true, 'Field is Required'] },
  mobileNumber: { formType: 'text' },
  OtherNewProp: { formType: 'checkbox', default: false },
  LastBoolean: { formType: 'checkbox', default: true },
  selectItem: { formType: 'select', default: 1 },
  phone: { formType: 'text' },
};

describe('materializeRecordFromSchema', () => {
  it('projects defaults from the schema, not from ad-hoc fields', () => {
    expect(materializeRecordFromSchema(usersSchema)).toEqual({
      username: '',
      mobileNumber: '',
      OtherNewProp: false,
      LastBoolean: true,
      selectItem: 1,
      phone: '',
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
      mobileNumber: '',
      OtherNewProp: false,
      LastBoolean: true,
      selectItem: 1,
      phone: '',
    });
  });
});
