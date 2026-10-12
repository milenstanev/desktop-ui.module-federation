import { test, expect } from '@playwright/test';
import {
  TEST_SELECTORS,
  getFormFieldTestId,
  getFormErrorTestId,
} from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

/**
 * E2E Tests for FormEditor Validation
 *
 * These tests verify YOUR custom validation integration:
 * - Schema-driven validation rules from mockApi
 * - React Hook Form integration with custom field components
 * - Error display and aria-invalid attributes
 * - Auto-focus on first error field (YOUR setFocus implementation)
 * - Form submission blocking when validation fails
 */

test.describe('FormEditor Validation', () => {
  test.beforeEach(async ({ page, context }) => {
    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    const formEditor = page.getByTestId(TEST_SELECTORS.FORM_EDITOR);
    const formLoading = page.getByTestId(TEST_SELECTORS.FORM_LOADING);
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));

    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();
    await closeAllWindows(page);

    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    // Wait for form to be visible and loaded (not showing loading state)
    await expect(formEditor).toBeVisible();
    await expect(formLoading).not.toBeVisible();

    // Wait for form fields to be populated with data
    await expect(firstNameInput).toHaveValue('John');
  });

  test('required field validation prevents submission', async ({ page }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    const firstNameError = page.getByTestId(getFormErrorTestId('firstName'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(firstNameInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(firstNameError).toBeVisible();
    await expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('minLength validation shows custom error message', async ({ page }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    const firstNameError = page.getByTestId(getFormErrorTestId('firstName'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(firstNameInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('J');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(firstNameError).toBeVisible();
  });

  test('number min validation shows custom error message', async ({ page }) => {
    const ageInput = page.getByTestId(getFormFieldTestId('age'));
    const ageError = page.getByTestId(getFormErrorTestId('age'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(ageInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(ageInput).toBeVisible();
    await ageInput.clear();
    await expect(ageInput).toBeVisible();
    await ageInput.fill('15');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(ageError).toBeVisible();
  });

  test('number max validation shows custom error message', async ({ page }) => {
    const ageInput = page.getByTestId(getFormFieldTestId('age'));
    const ageError = page.getByTestId(getFormErrorTestId('age'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(ageInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(ageInput).toBeVisible();
    await ageInput.clear();
    await expect(ageInput).toBeVisible();
    await ageInput.fill('150');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(ageError).toBeVisible();
  });

  test('select field required validation works', async ({ page }) => {
    const roleSelect = page.getByTestId(getFormFieldTestId('role'));
    const roleError = page.getByTestId(getFormErrorTestId('role'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(roleSelect).toBeVisible();
    await expect(submitButton).toBeVisible();

    // First select a valid option
    await roleSelect.selectOption('admin');

    // Then clear the selection by setting it back to empty (using JavaScript since the disabled option can't be selected)
    await roleSelect.evaluate((select: HTMLSelectElement) => {
      select.value = '';
    });

    // Try to submit with empty required field
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Verify validation error appears
    await expect(roleError).toBeVisible();
    await expect(roleSelect).toHaveAttribute('aria-invalid', 'true');
  });

  test('multiple validation errors display simultaneously', async ({
    page,
  }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    const firstNameError = page.getByTestId(getFormErrorTestId('firstName'));
    const lastNameInput = page.getByTestId(getFormFieldTestId('lastName'));
    const lastNameError = page.getByTestId(getFormErrorTestId('lastName'));
    const ageInput = page.getByTestId(getFormFieldTestId('age'));
    const ageError = page.getByTestId(getFormErrorTestId('age'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(lastNameInput).toBeVisible();
    await lastNameInput.clear();
    await expect(ageInput).toBeVisible();
    await ageInput.clear();
    await expect(ageInput).toBeVisible();
    await ageInput.fill('10');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(firstNameError).toBeVisible();
    await expect(lastNameError).toBeVisible();
    await expect(ageError).toBeVisible();

    await expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(lastNameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(ageInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('auto-focuses first error field after validation fails', async ({
    page,
  }) => {
    const lastNameInput = page.getByTestId(getFormFieldTestId('lastName'));
    const lastNameError = page.getByTestId(getFormErrorTestId('lastName'));
    const ageInput = page.getByTestId(getFormFieldTestId('age'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(lastNameInput).toBeVisible();
    await expect(ageInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(lastNameInput).toBeVisible();
    await lastNameInput.clear();
    await expect(ageInput).toBeVisible();
    await ageInput.clear();
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for validation to trigger and focus to be set
    await expect(lastNameError).toBeVisible();

    const focusedElement = await page.evaluate(() => {
      const activeEl = document.activeElement;
      return activeEl?.getAttribute('data-testid') || null;
    });

    expect(focusedElement).toBe(getFormFieldTestId('lastName'));
  });

  test('error messages disappear after fixing validation', async ({ page }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    const firstNameError = page.getByTestId(getFormErrorTestId('firstName'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(firstNameInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(firstNameError).toBeVisible();

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Jane');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(firstNameError).not.toBeVisible();
  });

  test('valid form submission shows success alert', async ({ page }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Jane');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Form is updated');
      await dialog.accept();
    });

    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for submission to complete (button re-enabled)
    await expect(submitButton).toBeEnabled();
  });

  test('form resets to updated values after successful submission', async ({
    page,
  }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Jane');

    await expect(firstNameInput).toHaveValue('Jane');

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for submission to complete and form to reset
    await expect(submitButton).toBeEnabled();

    // Form should reset to the updated values from API response
    await expect(firstNameInput).toHaveValue('Jane');
  });

  test('maxLength validation prevents submission', async ({ page }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    const firstNameError = page.getByTestId(getFormErrorTestId('firstName'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(firstNameInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('A'.repeat(51));
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(firstNameError).toBeVisible();
  });

  test('validation errors have role="alert" for accessibility', async ({
    page,
  }) => {
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    const firstNameError = page.getByTestId(getFormErrorTestId('firstName'));
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    await expect(firstNameInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await firstNameInput.clear();
    await submitButton.click();

    await expect(firstNameError).toBeVisible();

    const roleAttr = await firstNameError.getAttribute('role');
    expect(roleAttr).toBe('alert');
  });
});
