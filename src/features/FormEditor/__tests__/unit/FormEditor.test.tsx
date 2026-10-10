import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormEditor from '~/features/FormEditor/FormEditor';
import * as mockApi from '~/shared/utils/mockApi';
import { TEST_SELECTORS, getFormFieldTestId } from '~/shared/testSelectors';
import {
  VALIDATION_MESSAGES,
  MOCK_USER_DATA,
  ROLE_OPTIONS,
  FORM_FIELD_LABELS,
  FORM_EDITOR_STRINGS,
} from '~/shared/constants';

jest.mock('~/shared/utils/mockApi');

const mockFetchUsers = mockApi.fetchUsers as jest.MockedFunction<
  typeof mockApi.fetchUsers
>;
const mockFetchFormSchema = mockApi.fetchFormSchema as jest.MockedFunction<
  typeof mockApi.fetchFormSchema
>;
const mockUpdateUser = mockApi.updateUser as jest.MockedFunction<
  typeof mockApi.updateUser
>;

const MOCK_USER: mockApi.UserData = {
  _id: MOCK_USER_DATA.ID,
  firstName: MOCK_USER_DATA.FIRST_NAME,
  lastName: MOCK_USER_DATA.LAST_NAME,
  age: MOCK_USER_DATA.AGE,
  isActive: MOCK_USER_DATA.IS_ACTIVE,
  role: MOCK_USER_DATA.ROLE,
};

const MOCK_SCHEMA: mockApi.FormSchema = {
  firstName: {
    formType: 'text',
    validation: {
      required: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED,
      minLength: {
        value: 2,
        message: VALIDATION_MESSAGES.FIRST_NAME_MIN_LENGTH,
      },
    },
  },
  lastName: {
    formType: 'text',
    validation: {
      required: VALIDATION_MESSAGES.LAST_NAME_REQUIRED,
    },
  },
  age: {
    formType: 'number',
    validation: {
      required: VALIDATION_MESSAGES.AGE_REQUIRED,
      min: { value: 18, message: VALIDATION_MESSAGES.AGE_MIN },
    },
  },
  isActive: { formType: 'checkbox' },
  role: {
    formType: 'select',
    options: [
      { val: ROLE_OPTIONS.ADMIN.value, text: ROLE_OPTIONS.ADMIN.label },
      { val: ROLE_OPTIONS.USER.value, text: ROLE_OPTIONS.USER.label },
    ],
    validation: {
      required: VALIDATION_MESSAGES.ROLE_REQUIRED,
    },
  },
};

describe('FormEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUsers.mockResolvedValue([MOCK_USER]);
    mockFetchFormSchema.mockResolvedValue(MOCK_SCHEMA);
    mockUpdateUser.mockResolvedValue({ success: true, user: MOCK_USER });
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    render(<FormEditor />);
    expect(screen.getByTestId(TEST_SELECTORS.FORM_LOADING)).toBeInTheDocument();
  });

  it('fetches and displays form data', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    expect(mockFetchUsers).toHaveBeenCalledTimes(1);
    expect(mockFetchFormSchema).toHaveBeenCalledTimes(1);
  });

  it('renders all form fields from schema', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(getFormFieldTestId('firstName'))
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(getFormFieldTestId('lastName'))
    ).toBeInTheDocument();
    expect(screen.getByTestId(getFormFieldTestId('age'))).toBeInTheDocument();
    expect(
      screen.getByTestId(getFormFieldTestId('isActive'))
    ).toBeInTheDocument();
    expect(screen.getByTestId(getFormFieldTestId('role'))).toBeInTheDocument();
  });

  it('populates form with fetched user data', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    const firstNameInput = screen.getByTestId(
      getFormFieldTestId('firstName')
    ) as HTMLInputElement;
    const lastNameInput = screen.getByTestId(
      getFormFieldTestId('lastName')
    ) as HTMLInputElement;
    const ageInput = screen.getByTestId(
      getFormFieldTestId('age')
    ) as HTMLInputElement;

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(ageInput.value).toBe('30');
  });

  it('submits form with updated data', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    const firstNameInput = screen.getByTestId(getFormFieldTestId('firstName'));
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');

    const submitButton = screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('user-123', {
        _id: 'user-123',
        firstName: 'Jane',
        lastName: 'Doe',
        age: 30,
        isActive: true,
        role: 'admin',
      });
    });
  });

  it('disables submit button while submitting', async () => {
    mockUpdateUser.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, user: MOCK_USER }), 1000)
        )
    );

    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    expect(submitButton).not.toBeDisabled();

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('calls updateUser API on form submission', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('user-123', MOCK_USER);
    });
  });

  it('formats field labels correctly', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText(FORM_FIELD_LABELS.FIRST_NAME)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(FORM_FIELD_LABELS.LAST_NAME)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(FORM_FIELD_LABELS.AGE)).toBeInTheDocument();
    expect(
      screen.getByLabelText(FORM_FIELD_LABELS.IS_ACTIVE)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(FORM_FIELD_LABELS.ROLE)).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    const firstNameInput = screen.getByTestId(
      getFormFieldTestId('firstName')
    ) as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');

    const submitButton = screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
    });

    expect(firstNameInput.value).toBe('John');
  });

  it('shows a success alert after update', async () => {
    const updated = { ...MOCK_USER, firstName: 'Jane' };
    mockUpdateUser.mockResolvedValue({ success: true, user: updated });

    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    const firstNameInput = screen.getByTestId(getFormFieldTestId('firstName'));
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');
    await userEvent.click(
      screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON)
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        FORM_EDITOR_STRINGS.ALERT_SUCCESS
      );
    });
    expect(firstNameInput).toHaveValue('Jane');
  });

  it('shows an error alert when update is unsuccessful', async () => {
    mockUpdateUser.mockResolvedValue({
      success: false,
      user: MOCK_USER,
    });

    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON)
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        FORM_EDITOR_STRINGS.ALERT_ERROR
      );
    });
  });

  it('shows the thrown error message when update fails', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Network down'));

    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON)
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Network down');
    });
  });

  it('renders submit button with correct text', async () => {
    render(<FormEditor />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.FORM_EDITOR)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON)
    ).toHaveTextContent('Submit');
  });
});
