# FormEditor Feature

A **preview/demo** of form functionality: schema-driven form with React Hook Form, mock API, and validation. The actual form building blocks (TextField, NumberField, etc.) live in **`~/shared/forms`** so any feature can use forms.

## Structure

```
FormEditor/
├── FormEditor.tsx          # Preview component – schema-driven form using ~/shared/forms
├── FormEditor.module.css   # Submit button + gradient theme overrides (base styles in shared/forms)
├── __tests__/
│   ├── unit/FormEditor.test.tsx
│   └── e2e/
├── README.md
└── VALIDATION_TESTS.md
```

Shared form components (used by FormEditor and any other feature):

```
src/shared/forms/
├── TextField.tsx, NumberField.tsx, CheckboxField.tsx, SelectField.tsx
├── FieldError.tsx
├── forms.module.css        # Base form field styles
├── index.ts
├── README.md
└── __tests__/             # Unit tests for field components
```

## Key Features

- **Preview of shared forms** – Uses `~/shared/forms` (TextField, NumberField, CheckboxField, SelectField)
- **Schema-driven** – Validation and layout from mock API schema
- **React Hook Form** – Optimized re-renders, lazy-loaded with feature
- **Mock API** – fetchUsers, fetchFormSchema, updateUser (replace with real API)
- **Accessibility** – aria-invalid, role="alert", label associations
- **Theme support** – Gradient overrides in FormEditor.module.css

## Usage

FormEditor is loaded when the user clicks "Add Form Editor". Other features that need forms can import from `~/shared/forms` and build their own UI.

## Usage Example

The feature is loaded via the component loader when user clicks "Add Form Editor":

```typescript
// src/utils/componentLoader.ts
case COMPONENT_NAMES.FORM_EDITOR:
  return lazy(() => import('../features/FormEditor/FormEditor'));
```

## Testing

**Unit tests**
- FormEditor: `npm test -- --testPathPattern=FormEditor`
- Shared form fields: `npm test -- --testPathPattern=shared/forms`

**E2E**
- `npx playwright test form-editor`
- `npx playwright test form-validation`

## Validation Rules

Defined in `src/utils/mockApi.ts`:

- **firstName/lastName**: Required, 2-50 characters
- **age**: Required, 18-120 years
- **role**: Required, must select from options
- **isActive**: No validation (optional checkbox)

## Customization

### Replace Mock API
Replace the mock functions in `src/utils/mockApi.ts` with real API calls:

```typescript
export const fetchUsers = async (): Promise<UserData[]> => {
  const response = await fetch('/api/users');
  return response.json();
};
```

### Add New Field Type
1. Create the field component in **`~/shared/forms/`** (use `FieldError` for errors, styles from `forms.module.css`).
2. Export it from `~/shared/forms/index.ts`.
3. Add a case in `FormEditor.tsx` `renderFormField()` for the preview.
4. Update `FORM_TYPES` in `~/shared/constants.ts`.

### Modify Validation
Update the `validation` property in `MOCK_SCHEMA` in `src/utils/mockApi.ts`:

```typescript
firstName: {
  formType: 'text',
  validation: {
    required: 'First name is required',
    minLength: { value: 2, message: 'Too short' },
    pattern: { value: /^[A-Za-z]+$/, message: 'Letters only' },
  },
}
```

## Related Documentation

- [VALIDATION_TESTS.md](./VALIDATION_TESTS.md) - E2E validation test documentation
- [~/shared/forms/README.md](../../shared/forms/README.md) - Shared form components
- [Mock API Guide](../../docs/MOCK_API.md) - API integration guide
