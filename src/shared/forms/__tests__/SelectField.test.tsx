import { render, screen } from '@testing-library/react';
import { useForm, FieldErrors, RegisterOptions } from 'react-hook-form';
import SelectField from '~/shared/forms/SelectField';
import { getFormFieldTestId } from '~/shared/testSelectors';
import {
  VALIDATION_MESSAGES,
  FORM_FIELD_LABELS,
  SELECT_FIELD_STRINGS,
  ROLE_OPTIONS,
} from '~/shared/constants';
import type { SelectOption } from '~/shared/forms';

const TestWrapper: React.FC<{
  name: string;
  label: string;
  options: SelectOption[];
  validation?: RegisterOptions;
  errors?: FieldErrors;
}> = ({ name, label, options, validation, errors }) => {
  const { register } = useForm();
  return (
    <SelectField
      name={name}
      label={label}
      options={options}
      register={register}
      errors={errors}
      validation={validation}
    />
  );
};

describe('SelectField', () => {
  const mockOptions: SelectOption[] = [
    { val: ROLE_OPTIONS.ADMIN.value, text: ROLE_OPTIONS.ADMIN.label },
    { val: ROLE_OPTIONS.USER.value, text: ROLE_OPTIONS.USER.label },
    { val: ROLE_OPTIONS.GUEST.value, text: ROLE_OPTIONS.GUEST.label },
  ];

  it('renders with label and select', () => {
    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
      />
    );

    expect(screen.getByLabelText(FORM_FIELD_LABELS.ROLE)).toBeInTheDocument();
    expect(screen.getByTestId(getFormFieldTestId('role'))).toBeInTheDocument();
  });

  it('renders all options including placeholder', () => {
    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
      />
    );

    expect(
      screen.getByText(
        `${SELECT_FIELD_STRINGS.PLACEHOLDER_PREFIX} ${FORM_FIELD_LABELS.ROLE}`
      )
    ).toBeInTheDocument();
    expect(screen.getByText(ROLE_OPTIONS.ADMIN.label)).toBeInTheDocument();
    expect(screen.getByText(ROLE_OPTIONS.USER.label)).toBeInTheDocument();
    expect(screen.getByText(ROLE_OPTIONS.GUEST.label)).toBeInTheDocument();
  });

  it('placeholder option is disabled', () => {
    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
      />
    );

    const placeholder = screen.getByText(
      `${SELECT_FIELD_STRINGS.PLACEHOLDER_PREFIX} ${FORM_FIELD_LABELS.ROLE}`
    );
    expect(placeholder).toHaveAttribute('disabled');
  });

  it('displays error message when error exists', () => {
    const errors = {
      role: { type: 'required', message: VALIDATION_MESSAGES.ROLE_REQUIRED },
    };

    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
        errors={errors}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      VALIDATION_MESSAGES.ROLE_REQUIRED
    );
  });

  it('sets aria-invalid when error exists', () => {
    const errors = {
      role: { type: 'required', message: VALIDATION_MESSAGES.GENERIC_ERROR },
    };

    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
        errors={errors}
      />
    );

    const select = screen.getByTestId(getFormFieldTestId('role'));
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
      />
    );

    const select = screen.getByTestId(getFormFieldTestId('role'));
    expect(select).toHaveAttribute('aria-invalid', 'false');
  });

  it('has correct id matching label htmlFor', () => {
    render(
      <TestWrapper
        name="role"
        label={FORM_FIELD_LABELS.ROLE}
        options={mockOptions}
      />
    );

    const select = screen.getByTestId(getFormFieldTestId('role'));
    expect(select).toHaveAttribute('id', 'role');
  });

  it('renders only placeholder when no options provided', () => {
    render(
      <TestWrapper name="role" label={FORM_FIELD_LABELS.ROLE} options={[]} />
    );

    const placeholderOption = screen.getByText(
      `${SELECT_FIELD_STRINGS.PLACEHOLDER_PREFIX} ${FORM_FIELD_LABELS.ROLE}`
    );
    expect(placeholderOption).toBeInTheDocument();
    expect(placeholderOption.tagName).toBe('OPTION');
  });
});
