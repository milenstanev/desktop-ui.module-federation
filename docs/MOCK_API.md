# Mock API Documentation

## Overview

The FormEditor component uses a mock API service (`src/utils/mockApi.ts`) to simulate backend interactions. This allows the starter template to work out-of-the-box without requiring a real backend server.

---

## Mock API Functions

### `fetchUsers(): Promise<UserData[]>`

Fetches a list of users (returns single mock user).

**Response:**
```typescript
[{
  _id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  isActive: true,
  role: 'admin'
}]
```

**Simulated delay:** 300ms

---

### `fetchFormSchema(): Promise<FormSchema>`

Fetches the form schema defining field types and options.

**Response:**
```typescript
{
  firstName: { formType: 'text' },
  lastName: { formType: 'text' },
  age: { formType: 'number' },
  isActive: { formType: 'checkbox' },
  role: {
    formType: 'select',
    options: [
      { val: 'admin', text: 'Administrator' },
      { val: 'user', text: 'User' },
      { val: 'guest', text: 'Guest' }
    ],
    validation: {
      required: 'Role is required',
    }
  }
}
```

**Validation Rules**:
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `age`: Required, 18-120 years old
- `role`: Required

**Simulated delay:** 200ms

---

### `updateUser(userId: string, data: Partial<UserData>): Promise<{success: boolean, user: UserData}>`

Updates user data.

**Parameters:**
- `userId` - User ID to update
- `data` - Partial user data to update

**Response:**
```typescript
{
  success: true,
  user: { ...updatedUserData }
}
```

**Simulated delay:** 400ms

**Validation:** Throws error if `userId` is missing

---

## Replacing with Real API

To integrate a real backend API:

### 1. Create API Service

Replace `src/utils/mockApi.ts` with real API calls:

```typescript
// src/utils/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const fetchUsers = async (): Promise<UserData[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const fetchFormSchema = async (): Promise<FormSchema> => {
  const response = await fetch(`${API_BASE_URL}/users/schema`);
  if (!response.ok) throw new Error('Failed to fetch schema');
  return response.json();
};

export const updateUser = async (
  userId: string,
  data: Partial<UserData>
): Promise<{success: boolean, user: UserData}> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
};
```

### 2. Update FormEditor Import

```typescript
// src/features/FormEditor/FormEditor.tsx
import { fetchUsers, fetchFormSchema, updateUser } from '../../utils/api';
```

### 3. Add Environment Variable

Create `.env.local`:
```bash
REACT_APP_API_URL=https://your-api.com/api
```

### 4. Update Tests

Mock the API module in tests:

```typescript
jest.mock('../../utils/api', () => ({
  fetchUsers: jest.fn(),
  fetchFormSchema: jest.fn(),
  updateUser: jest.fn(),
}));
```

---

## Benefits of Mock API

1. **Works Out-of-the-Box:** No backend setup required
2. **Predictable Testing:** Consistent mock data for tests
3. **Fast Development:** No network latency during development
4. **Easy to Replace:** Single file to swap for real API
5. **Type Safety:** Fully typed interfaces for API contracts

---

## API Contract (Types)

```typescript
export interface FormField {
  formType: 'text' | 'number' | 'checkbox' | 'select';
  options?: Array<{ val: string; text: string }>;
  validation?: {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
}

export interface FormSchema {
  [key: string]: FormField;
}

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  isActive: boolean;
  role: string;
}
```

---

## Error Handling

The mock API simulates real-world scenarios:

- **Network delays:** 200-400ms simulated latency
- **Validation errors:** Throws if userId is missing
- **Type safety:** All responses are properly typed

The FormEditor component handles errors gracefully:
- Loading states during fetch
- Error boundaries catch API failures
- User-friendly error messages

---

## Testing with Mock API

The mock API makes testing easier:

```typescript
import { fetchUsers, updateUser } from '../../utils/mockApi';

test('fetches users successfully', async () => {
  const users = await fetchUsers();
  expect(users).toHaveLength(1);
  expect(users[0].firstName).toBe('John');
});

test('updates user successfully', async () => {
  const result = await updateUser('user-123', { firstName: 'Jane' });
  expect(result.success).toBe(true);
  expect(result.user.firstName).toBe('Jane');
});
```

---

## Future Enhancements

Consider adding:
- **Multiple mock users** for list/pagination testing
- **Mock authentication** for protected endpoints
- **Error simulation** (network failures, 404s, 500s)
- **Request interceptor** for logging/debugging
- **MSW (Mock Service Worker)** for more realistic mocking
