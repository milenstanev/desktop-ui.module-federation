import { render, screen } from '@testing-library/react';
import { useForm, FieldErrors, RegisterOptions } from 'react-hook-form';
import NumberField from '~/shared/forms/NumberField';
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
    <NumberField
      name={name}
      label={label}
      register={register}
      errors={errors}
      validation={validation}
    />
  );
};

describe('NumberField', () => {
  it('renders with label and input', () => {
    render(<TestWrapper name="age" label={FORM_FIELD_LABELS.AGE} />);

    expect(screen.getByLabelText(FORM_FIELD_LABELS.AGE)).toBeInTheDocument();
    expect(screen.getByTestId(getFormFieldTestId('age'))).toBeInTheDocument();
  });

  it('renders with correct input type', () => {
    render(<TestWrapper name="age" label={FORM_FIELD_LABELS.AGE} />);

    const input = screen.getByTestId(getFormFieldTestId('age'));
    expect(input).toHaveAttribute('type', 'number');
  });

  it('displays error message when error exists', () => {
    const errors = {
      age: { type: 'min', message: VALIDATION_MESSAGES.AGE_MIN },
    };

    render(
      <TestWrapper name="age" label={FORM_FIELD_LABELS.AGE} errors={errors} />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      VALIDATION_MESSAGES.AGE_MIN
    );
  });

  it('sets aria-invalid when error exists', () => {
    const errors = {
      age: { type: 'required', message: VALIDATION_MESSAGES.GENERIC_ERROR },
    };

    render(
      <TestWrapper name="age" label={FORM_FIELD_LABELS.AGE} errors={errors} />
    );

    const input = screen.getByTestId(getFormFieldTestId('age'));
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<TestWrapper name="age" label={FORM_FIELD_LABELS.AGE} />);

    const input = screen.getByTestId(getFormFieldTestId('age'));
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('has correct id matching label htmlFor', () => {
    render(<TestWrapper name="age" label={FORM_FIELD_LABELS.AGE} />);

    const input = screen.getByTestId(getFormFieldTestId('age'));
    expect(input).toHaveAttribute('id', 'age');
  });
});
