# Shared Forms

Reusable form field components and base styles for any feature that needs forms. Built with **react-hook-form**.

## Components

- **TextField** – text input with validation (required, min/max length, pattern)
- **NumberField** – number input (valueAsNumber, min/max)
- **CheckboxField** – checkbox
- **SelectField** – select dropdown with options and placeholder
- **FieldError** – error message display (used by all fields)

All field components support `forwardRef`, `register` from react-hook-form, and `errors` for validation messages. They use shared base styles from `forms.module.css`.

## Usage

Import from `~/shared/forms`:

```tsx
import { useForm } from 'react-hook-form';
import { TextField, NumberField, SelectField } from '~/shared/forms';

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField name="name" label="Name" register={register} errors={errors} />
      <NumberField name="age" label="Age" register={register} errors={errors} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

## FormEditor

The **FormEditor** feature is a preview/demo of this form functionality: it uses these shared components with a schema-driven layout and mock API. Other features can use the same form components for their own forms.

## Constants

Form-related constants (`FORM_TYPES`, `SELECT_FIELD_STRINGS`, `VALIDATION_MESSAGES`, etc.) live in `~/shared/constants`.
