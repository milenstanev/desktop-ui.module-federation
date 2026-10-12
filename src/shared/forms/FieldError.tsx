import {
  FieldError as RHFFieldError,
  FieldErrorsImpl,
  Merge,
} from 'react-hook-form';
import styles from './forms.module.css';
import { getFormErrorTestId } from '~/shared/testSelectors';

export interface FieldErrorProps {
  error?: RHFFieldError | Merge<RHFFieldError, FieldErrorsImpl<any>>;
  fieldName: string;
}

const FieldError = ({ error, fieldName }: FieldErrorProps) => {
  if (!error) return null;

  return (
    <span
      className={styles.error}
      role="alert"
      data-testid={getFormErrorTestId(fieldName)}
    >
      {error.message as string}
    </span>
  );
};

FieldError.displayName = 'FieldError';

export default FieldError;
