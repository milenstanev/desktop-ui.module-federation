# FormEditor Validation E2E Tests

## Overview

The `tests/form-validation.spec.ts` file contains E2E tests that verify YOUR custom validation integration, not the React Hook Form library itself.

## What These Tests Verify (YOUR Code)

### 1. Schema-Driven Validation Integration
- **File**: `src/utils/mockApi.ts`
- **What it tests**: Your custom `FormSchema` validation rules are correctly passed through to React Hook Form
- **Why it matters**: Ensures the validation configuration in your schema actually works in the UI

### 2. Custom Field Component Integration
- **Files**: `src/features/FormEditor/FormFields/*.tsx`
- **What it tests**: Your custom field components correctly apply validation rules and display errors
- **Why it matters**: Verifies that your extracted components properly integrate with RHF's validation system

### 3. Error Display and Accessibility
- **What it tests**: 
  - Error messages appear with `role="alert"` for screen readers
  - `aria-invalid` attributes are correctly applied to invalid fields
  - Error styling is applied (red borders, error text)
- **Why it matters**: Ensures your accessibility implementation works correctly

### 4. Auto-Focus on First Error Field
- **File**: `src/features/FormEditor/FormEditor.tsx` (lines 123-128)
- **What it tests**: Your custom `useEffect` that calls `setFocus()` on the first error field
- **Why it matters**: Verifies your UX enhancement for keyboard navigation

### 5. Form Reset After Successful Submission
- **File**: `src/features/FormEditor/FormEditor.tsx` (line 110)
- **What it tests**: Your `reset(result.user)` call after successful API response
- **Why it matters**: Ensures form state management works correctly

## Test Cases

### 1. Required Field Validation
```typescript
test('required field validation prevents submission')
```
- Clears a required field (firstName)
- Submits the form
- Verifies error message appears
- Verifies `aria-invalid="true"` is set

### 2. MinLength Validation
```typescript
test('minLength validation shows custom error message')
```
- Enters 1 character in firstName (min: 2)
- Submits the form
- Verifies custom error message from schema appears

### 3. Number Min Validation
```typescript
test('number min validation shows custom error message')
```
- Enters age below minimum (15, min: 18)
- Submits the form
- Verifies custom error message from schema appears

### 4. Number Max Validation
```typescript
test('number max validation shows custom error message')
```
- Enters age above maximum (150, max: 120)
- Submits the form
- Verifies custom error message from schema appears

### 5. Select Required Validation
```typescript
test('select field required validation works')
```
- Selects empty option in role field
- Submits the form
- Verifies error message and `aria-invalid` attribute

### 6. Multiple Validation Errors
```typescript
test('multiple validation errors display simultaneously')
```
- Creates errors in multiple fields (firstName, lastName, age)
- Submits the form
- Verifies all error messages appear
- Verifies all fields have `aria-invalid="true"`

### 7. Auto-Focus First Error Field
```typescript
test('auto-focuses first error field after validation fails')
```
- Creates errors in lastName and age
- Submits the form
- Verifies lastName (first error) receives focus
- **Tests YOUR custom `useEffect` with `setFocus()`**

### 8. Error Clearing After Fix
```typescript
test('error messages disappear after fixing validation')
```
- Triggers validation error
- Fixes the error by entering valid data
- Submits again
- Verifies error message disappears

### 9. Success Alert
```typescript
test('valid form submission shows success alert')
```
- Edits form with valid data
- Submits the form
- Verifies success alert appears
- **Tests YOUR `onSubmit` handler and alert logic**

### 10. Form Reset After Success
```typescript
test('form resets to original values after successful submission')
```
- Edits firstName to "Jane"
- Submits the form
- Verifies form resets back to "John" (original value)
- **Tests YOUR `reset(result.user)` call**

### 11. MaxLength Validation
```typescript
test('maxLength validation prevents submission')
```
- Enters 51 characters in firstName (max: 50)
- Submits the form
- Verifies custom error message from schema appears

### 12. Accessibility: Error Role
```typescript
test('validation errors have role="alert" for accessibility')
```
- Triggers validation error
- Verifies error element has `role="alert"`
- **Tests YOUR error display implementation in field components**

## Key Differences from Library Testing

### ❌ What We DON'T Test (Library Responsibility)
- React Hook Form's internal validation logic
- How `register()` function works
- RHF's state management internals
- How `useForm()` hook processes validation rules

### ✅ What We DO Test (YOUR Code)
- Your schema structure and validation rules
- Your field components' error display
- Your `FormEditor` integration with RHF
- Your custom `setFocus` implementation
- Your form reset logic after submission
- Your accessibility implementation
- Your error styling and UX

## Running the Tests

```bash
# Run validation E2E tests only
npx playwright test form-validation

# Run with UI
npx playwright test form-validation --ui

# Run specific test
npx playwright test form-validation -g "auto-focuses first error"
```

## Test Strategy

These tests verify the **integration points** between:
1. Your schema definition (`mockApi.ts`)
2. Your field components (`FormFields/*.tsx`)
3. Your main FormEditor component
4. React Hook Form library

This ensures that when you modify your validation rules, field components, or form logic, the tests will catch any regressions in YOUR code, not the library's code.

## Related Documentation

- [REFACTOR.md](./REFACTOR.md) - Implementation details
- [FIELD_REFS.md](./FIELD_REFS.md) - forwardRef usage examples
- [UNIT_TESTS.md](./UNIT_TESTS.md) - Unit test documentation
- [Best Practices](../../docs/BEST_PRACTICES.md) - Testing guidelines
