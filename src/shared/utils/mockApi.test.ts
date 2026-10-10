import { API_ERROR_MESSAGES, MOCK_USER_DATA } from '~/shared/constants';
import { fetchFormSchema, fetchUsers, updateUser } from './mockApi';

describe('mockApi', () => {
  it('returns seeded users', async () => {
    const users = await fetchUsers();
    expect(users).toHaveLength(1);
    expect(users[0]._id).toBe(MOCK_USER_DATA.ID);
    expect(users[0].firstName).toBe(MOCK_USER_DATA.FIRST_NAME);
  });

  it('returns a form schema with expected fields', async () => {
    const schema = await fetchFormSchema();
    expect(schema.firstName.formType).toBe('text');
    expect(schema.age.formType).toBe('number');
    expect(schema.isActive.formType).toBe('checkbox');
    expect(schema.role.formType).toBe('select');
    expect(schema.role.options?.length).toBeGreaterThan(0);
  });

  it('updates a user by merging payload onto the seeded record', async () => {
    const result = await updateUser(MOCK_USER_DATA.ID, { firstName: 'Jane' });
    expect(result.success).toBe(true);
    expect(result.user.firstName).toBe('Jane');
    expect(result.user.lastName).toBe(MOCK_USER_DATA.LAST_NAME);
    expect(result.user._id).toBe(MOCK_USER_DATA.ID);
  });

  it('rejects update when user id is missing', async () => {
    await expect(updateUser('', { firstName: 'Jane' })).rejects.toThrow(
      API_ERROR_MESSAGES.USER_ID_REQUIRED
    );
  });
});
