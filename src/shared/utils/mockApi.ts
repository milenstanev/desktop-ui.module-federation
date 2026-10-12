/**
 * Mock API Service
 *
 * Simulates API calls for the FormEditor component.
 * In a real application, replace this with actual API calls.
 */

import {
  VALIDATION_MESSAGES,
  ROLE_OPTIONS,
  MOCK_USER_DATA,
  API_ERROR_MESSAGES,
} from '~/shared/constants';

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

// Mock data
const MOCK_USER: UserData = {
  _id: MOCK_USER_DATA.ID,
  firstName: MOCK_USER_DATA.FIRST_NAME,
  lastName: MOCK_USER_DATA.LAST_NAME,
  age: MOCK_USER_DATA.AGE,
  isActive: MOCK_USER_DATA.IS_ACTIVE,
  role: MOCK_USER_DATA.ROLE,
};

const MOCK_SCHEMA: FormSchema = {
  firstName: {
    formType: 'text',
    validation: {
      required: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED,
      minLength: {
        value: 2,
        message: VALIDATION_MESSAGES.FIRST_NAME_MIN_LENGTH,
      },
      maxLength: {
        value: 50,
        message: VALIDATION_MESSAGES.FIRST_NAME_MAX_LENGTH,
      },
    },
  },
  lastName: {
    formType: 'text',
    validation: {
      required: VALIDATION_MESSAGES.LAST_NAME_REQUIRED,
      minLength: {
        value: 2,
        message: VALIDATION_MESSAGES.LAST_NAME_MIN_LENGTH,
      },
      maxLength: {
        value: 50,
        message: VALIDATION_MESSAGES.LAST_NAME_MAX_LENGTH,
      },
    },
  },
  age: {
    formType: 'number',
    validation: {
      required: VALIDATION_MESSAGES.AGE_REQUIRED,
      min: { value: 18, message: VALIDATION_MESSAGES.AGE_MIN },
      max: { value: 120, message: VALIDATION_MESSAGES.AGE_MAX },
    },
  },
  isActive: { formType: 'checkbox' },
  role: {
    formType: 'select',
    options: [
      { val: ROLE_OPTIONS.ADMIN.value, text: ROLE_OPTIONS.ADMIN.label },
      { val: ROLE_OPTIONS.USER.value, text: ROLE_OPTIONS.USER.label },
      { val: ROLE_OPTIONS.GUEST.value, text: ROLE_OPTIONS.GUEST.label },
    ],
    validation: {
      required: VALIDATION_MESSAGES.ROLE_REQUIRED,
    },
  },
};

// Simulate network delay
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API: Fetch users
 */
export const fetchUsers = async (): Promise<UserData[]> => {
  await delay(300);
  return [MOCK_USER];
};

/**
 * Mock API: Fetch form schema
 */
export const fetchFormSchema = async (): Promise<FormSchema> => {
  await delay(200);
  return MOCK_SCHEMA;
};

/**
 * Mock API: Update user
 */
export const updateUser = async (
  userId: string,
  data: Partial<UserData>
): Promise<{ success: boolean; user: UserData }> => {
  await delay(400);

  // Simulate validation
  if (!userId) {
    throw new Error(API_ERROR_MESSAGES.USER_ID_REQUIRED);
  }

  // Simulate successful update
  const updatedUser = { ...MOCK_USER, ...data };

  return {
    success: true,
    user: updatedUser,
  };
};

/**
 * Mock API: Simulate error (for testing error handling)
 * Reserved for future error handling tests
 */
// export const simulateApiError = async (): Promise<never> => {
//   await delay(300);
//   throw new Error(API_ERROR_MESSAGES.SIMULATED_ERROR);
// };
