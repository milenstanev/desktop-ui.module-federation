import { test, expect } from '@playwright/test';
import { TEST_SELECTORS, getFormFieldTestId } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

test.describe('FormEditor feature', () => {
  test.beforeEach(async ({ page, context }) => {
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
  });

  test('opens FormEditor window and loads form', async ({ page }) => {
    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    // Wait for form to load (mock API has delay)
    await expect(page.getByTestId(TEST_SELECTORS.FORM_EDITOR)).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.FORM_LOADING)
    ).not.toBeVisible();

    // Verify form fields are present
    await expect(
      page.getByTestId(getFormFieldTestId('firstName'))
    ).toBeVisible();
    await expect(
      page.getByTestId(getFormFieldTestId('lastName'))
    ).toBeVisible();
    await expect(page.getByTestId(getFormFieldTestId('age'))).toBeVisible();
    await expect(
      page.getByTestId(getFormFieldTestId('isActive'))
    ).toBeVisible();
    await expect(page.getByTestId(getFormFieldTestId('role'))).toBeVisible();

    // Verify submit button is present
    await expect(
      page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON)
    ).toBeVisible();
  });

  test('form fields are populated with mock data', async ({ page }) => {
    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    // Wait for form to load
    await expect(page.getByTestId(TEST_SELECTORS.FORM_EDITOR)).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.FORM_LOADING)
    ).not.toBeVisible();

    // Verify mock data is loaded
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    await expect(firstNameInput).toHaveValue('John');

    const lastNameInput = page.getByTestId(getFormFieldTestId('lastName'));
    await expect(lastNameInput).toHaveValue('Doe');

    const ageInput = page.getByTestId(getFormFieldTestId('age'));
    await expect(ageInput).toHaveValue('30');

    const isActiveCheckbox = page.getByTestId(getFormFieldTestId('isActive'));
    await expect(isActiveCheckbox).toBeChecked();

    const roleSelect = page.getByTestId(getFormFieldTestId('role'));
    await expect(roleSelect).toHaveValue('admin');
  });

  test('can edit form fields', async ({ page }) => {
    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    await expect(page.getByTestId(TEST_SELECTORS.FORM_EDITOR)).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.FORM_LOADING)
    ).not.toBeVisible();

    // Edit text field
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Jane');
    await expect(firstNameInput).toHaveValue('Jane');

    // Edit number field
    const ageInput = page.getByTestId(getFormFieldTestId('age'));
    await expect(ageInput).toBeVisible();
    await expect(ageInput).toBeVisible();
    await ageInput.clear();
    await expect(ageInput).toBeVisible();
    await ageInput.fill('25');
    await expect(ageInput).toHaveValue('25');

    // Toggle checkbox
    const isActiveCheckbox = page.getByTestId(getFormFieldTestId('isActive'));
    await expect(isActiveCheckbox).toBeVisible();
    await expect(isActiveCheckbox).toBeVisible();
    await isActiveCheckbox.uncheck();
    await expect(isActiveCheckbox).not.toBeChecked();

    // Change select
    const roleSelect = page.getByTestId(getFormFieldTestId('role'));
    await expect(roleSelect).toBeVisible();
    await expect(roleSelect).toBeVisible();
    await roleSelect.selectOption('user');
    await expect(roleSelect).toHaveValue('user');
  });

  test('can submit form successfully', async ({ page }) => {
    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    await expect(page.getByTestId(TEST_SELECTORS.FORM_EDITOR)).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.FORM_LOADING)
    ).not.toBeVisible();

    // Edit a field
    const firstNameInput = page.getByTestId(getFormFieldTestId('firstName'));
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.clear();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Jane');

    // Setup dialog handler before clicking submit
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Form is updated');
      await dialog.accept();
    });

    // Submit form
    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for form to be re-enabled after submission
    await expect(submitButton).toBeEnabled();
  });

  test('submit button is disabled while submitting', async ({ page }) => {
    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    await expect(page.getByTestId(TEST_SELECTORS.FORM_EDITOR)).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.FORM_LOADING)
    ).not.toBeVisible();

    const submitButton = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);

    // Verify button is initially enabled
    await expect(submitButton).toBeEnabled();

    // Setup dialog handler
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click submit
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Button should be disabled immediately after click
    await expect(submitButton).toBeDisabled();

    // Wait for submission to complete (button re-enabled)
    await expect(submitButton).toBeEnabled();
  });

  test('shows loading state initially', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();
    await closeAllWindows(page);

    const addFormButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormButton).toBeVisible();
    await addFormButton.click();

    // Should show loading immediately
    await expect(page.getByTestId(TEST_SELECTORS.FORM_LOADING)).toBeVisible({
      timeout: 500,
    });

    // Then form should appear after mock API loads
    await expect(page.getByTestId(TEST_SELECTORS.FORM_EDITOR)).toBeVisible({
      timeout: 2000,
    });
  });
});
