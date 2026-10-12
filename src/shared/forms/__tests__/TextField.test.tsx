import { render, screen } from '@testing-library/react';
import { useForm, FieldErrors, RegisterOptions } from 'react-hook-form';
import TextField from '~/shared/forms/TextField';
import { getFormFieldTestId } from '~/shared/testSelectors';
import { VALIDATION_MESSAGES, FORM_FIELD_LABELS } from '~/shared/constants';

const TestWrapper: React.FC<{
  name: string;
  label: string;
  validation?: RegisterOptions;
  errors?: FieldErrors;
}> = ({ name, label, validation, errors }) => {
  const { register } = useForm();
  return (
    <TextField
      name={name}
      label={label}
      register={register}
      errors={errors}
      validation={validation}
    />
  );
};

describe('TextField', () => {
  it('renders with label and input', () => {
    render(
      <TestWrapper name="firstName" label={FORM_FIELD_LABELS.FIRST_NAME} />
    );

    expect(
      screen.getByLabelText(FORM_FIELD_LABELS.FIRST_NAME)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(getFormFieldTestId('firstName'))
    ).toBeInTheDocument();
  });

  it('renders with correct input type', () => {
    render(<TestWrapper name="email" label="Email" />);

    const input = screen.getByTestId(getFormFieldTestId('email'));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays error message when error exists', () => {
    const errors = {
      firstName: {
        type: 'required',
        message: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED,
      },
    };

    render(
      <TestWrapper
        name="firstName"
        label={FORM_FIELD_LABELS.FIRST_NAME}
        errors={errors}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      VALIDATION_MESSAGES.FIRST_NAME_REQUIRED
    );
  });

  it('sets aria-invalid when error exists', () => {
    const errors = {
      firstName: {
        type: 'required',
        message: VALIDATION_MESSAGES.GENERIC_ERROR,
      },
    };

    render(
      <TestWrapper
        name="firstName"
        label={FORM_FIELD_LABELS.FIRST_NAME}
        errors={errors}
      />
    );

    const input = screen.getByTestId(getFormFieldTestId('firstName'));
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(
      <TestWrapper name="firstName" label={FORM_FIELD_LABELS.FIRST_NAME} />
    );

    const input = screen.getByTestId(getFormFieldTestId('firstName'));
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('has correct id matching label htmlFor', () => {
    render(
      <TestWrapper name="firstName" label={FORM_FIELD_LABELS.FIRST_NAME} />
    );

    const input = screen.getByTestId(getFormFieldTestId('firstName'));
    expect(input).toHaveAttribute('id', 'firstName');
  });
});
