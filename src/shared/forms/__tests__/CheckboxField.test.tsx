import { render, screen } from '@testing-library/react';
import { useForm, FieldErrors } from 'react-hook-form';
import CheckboxField from '~/shared/forms/CheckboxField';
import { getFormFieldTestId } from '~/shared/testSelectors';
import { VALIDATION_MESSAGES, FORM_FIELD_LABELS } from '~/shared/constants';

const TestWrapper: React.FC<{
  name: string;
  label: string;
  errors?: FieldErrors;
}> = ({ name, label, errors }) => {
  const { register } = useForm();
  return (
    <CheckboxField
      name={name}
      label={label}
      register={register}
      errors={errors}
    />
  );
};

describe('CheckboxField', () => {
  it('renders with label and checkbox', () => {
    render(<TestWrapper name="isActive" label={FORM_FIELD_LABELS.IS_ACTIVE} />);

    expect(
      screen.getByLabelText(FORM_FIELD_LABELS.IS_ACTIVE)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(getFormFieldTestId('isActive'))
    ).toBeInTheDocument();
  });

  it('renders with correct input type', () => {
    render(<TestWrapper name="isActive" label={FORM_FIELD_LABELS.IS_ACTIVE} />);

    const input = screen.getByTestId(getFormFieldTestId('isActive'));
    expect(input).toHaveAttribute('type', 'checkbox');
  });

  it('displays error message when error exists', () => {
    const errors = {
      isActive: {
        type: 'required',
        message: VALIDATION_MESSAGES.FIELD_REQUIRED,
      },
    };

    render(
      <TestWrapper
        name="isActive"
        label={FORM_FIELD_LABELS.IS_ACTIVE}
        errors={errors}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      VALIDATION_MESSAGES.FIELD_REQUIRED
    );
  });

  it('sets aria-invalid when error exists', () => {
    const errors = {
      isActive: {
        type: 'required',
        message: VALIDATION_MESSAGES.GENERIC_ERROR,
      },
    };

    render(
      <TestWrapper
        name="isActive"
        label={FORM_FIELD_LABELS.IS_ACTIVE}
        errors={errors}
      />
    );

    const input = screen.getByTestId(getFormFieldTestId('isActive'));
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<TestWrapper name="isActive" label={FORM_FIELD_LABELS.IS_ACTIVE} />);

    const input = screen.getByTestId(getFormFieldTestId('isActive'));
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('has correct id', () => {
    render(<TestWrapper name="isActive" label={FORM_FIELD_LABELS.IS_ACTIVE} />);

    const input = screen.getByTestId(getFormFieldTestId('isActive'));
    expect(input).toHaveAttribute('id', 'isActive');
  });
});
