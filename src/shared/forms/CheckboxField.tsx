import { forwardRef } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import styles from './forms.module.css';
import { getFormFieldTestId } from '~/shared/testSelectors';
import FieldError from './FieldError';

export interface CheckboxFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
}

const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ name, label, register, errors }, ref) => {
    const { ref: registerRef, ...registerRest } = register(name);

    return (
      <div className={styles.checkbox}>
        <label>
          <input
            type="checkbox"
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
          />
          {label}
        </label>
        <FieldError error={errors?.[name]} fieldName={name} />
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
