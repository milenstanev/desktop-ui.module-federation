import { forwardRef } from 'react';
import { UseFormRegister, FieldErrors, RegisterOptions } from 'react-hook-form';
import styles from './forms.module.css';
import { getFormFieldTestId } from '~/shared/testSelectors';
import FieldError from './FieldError';

export interface TextFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  validation?: RegisterOptions;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ name, label, register, errors, validation }, ref) => {
    const { ref: registerRef, ...registerRest } = register(name, {
      required: validation?.required,
      minLength: validation?.minLength,
      maxLength: validation?.maxLength,
      pattern: validation?.pattern,
    });

    return (
      <div className={styles.formItem}>
        <label htmlFor={name}>{label}</label>
        <input
          type="text"
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
        <FieldError error={errors?.[name]} fieldName={name} />
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
