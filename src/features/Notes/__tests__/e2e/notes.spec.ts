import { test, expect } from '@playwright/test';
import { NOTES_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS, getNoteItemTestId } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

test.describe('Notes feature', () => {
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

  test('opens Notes window and shows notes UI', async ({ page }) => {
    const addNotesButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    const placeholder = page.getByPlaceholder(NOTES_STRINGS.PLACEHOLDER);
    const addButton = page.getByLabel(NOTES_STRINGS.ADD_ARIA_LABEL);

    await expect(addNotesButton).toBeVisible();
    await addNotesButton.click();

    // Wait for lazy-loaded Notes component (check input field, not empty list)
    await expect(notesContainer).toBeVisible();
    await expect(placeholder).toBeVisible();
    await expect(addButton).toBeVisible();
  });

  test('can add a note in the Notes window', async ({ page }) => {
    const addNotesButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    const noteInput = page.getByPlaceholder(NOTES_STRINGS.PLACEHOLDER);
    const addNoteButton = page.getByLabel(NOTES_STRINGS.ADD_ARIA_LABEL);
    const firstNoteItem = page.getByTestId(getNoteItemTestId(0));

    await addNotesButton.click();

    // Wait for lazy-loaded Notes component (check input field, not empty list)
    await expect(notesContainer).toBeVisible();
    await expect(noteInput).toBeVisible();

    await expect(noteInput).toBeVisible();
    await noteInput.fill(TEST_SELECTORS.TEST_NOTE_TEXT);
    await expect(addNoteButton).toBeVisible();
    await addNoteButton.click();
    await expect(firstNoteItem).toBeVisible();
  });
});
