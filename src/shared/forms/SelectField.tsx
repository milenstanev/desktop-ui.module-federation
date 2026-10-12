import { forwardRef } from 'react';
import { UseFormRegister, FieldErrors, RegisterOptions } from 'react-hook-form';
import { SELECT_FIELD_STRINGS } from '~/shared/constants';
import styles from './forms.module.css';
import { getFormFieldTestId } from '~/shared/testSelectors';
import FieldError from './FieldError';

export interface SelectOption {
  val: string;
  text: string;
}

export interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  validation?: RegisterOptions;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ name, label, options, register, errors, validation }, ref) => {
    const { ref: registerRef, ...registerRest } = register(name, {
      required: validation?.required,
    });

    return (
      <div className={styles.formItem}>
        <label htmlFor={name}>{label}</label>
        <select
          id={name}
          data-testid={getFormFieldTestId(name)}
          {...registerRest}
          ref={(e) => {
            registerRef(e);
            if (typeof ref === 'function') {
              ref(e);
            } else if (ref) {
              ref.current = e;
            }
          }}
          aria-invalid={errors?.[name] ? 'true' : 'false'}
        >
          <option value="" disabled>
            {SELECT_FIELD_STRINGS.PLACEHOLDER_PREFIX} {label}
          </option>
          {options.map((option) => (
            <option value={option.val} key={option.val}>
              {option.text}
            </option>
          ))}
        </select>
        <FieldError error={errors?.[name]} fieldName={name} />
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;
