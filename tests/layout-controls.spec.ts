import { test, expect } from '@playwright/test';
import { NOTES_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';
import { INITIAL_STATE_CONFIG } from '~/features/Desktop/config';

test.describe('Layout control buttons', () => {
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

  test('Organize Grid button arranges windows in equal-sized grid', async ({
    page,
  }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const addNotesButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    const timerDisplay = page.getByRole('timer');
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    const notesInput = page.getByPlaceholder(NOTES_STRINGS.PLACEHOLDER);
    const organizeButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ORGANIZE_GRID,
    });

    await expect(addTimerButton).toBeVisible();
    await expect(addCounterButton).toBeVisible();
    await expect(addNotesButton).toBeVisible();
    await expect(organizeButton).toBeVisible();

    // Add 3 windows
    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();
    await expect(timerContainer).toBeVisible();
    await expect(timerDisplay).toBeVisible();

    await addCounterButton.click();
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    await addNotesButton.click();
    await expect(notesContainer).toBeVisible();
    await expect(notesInput).toBeVisible();

    // Get all windows by data-testid prefix
    const allWindows = page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`);
    await expect(allWindows).toHaveCount(3);

    // Click Organize Grid
    await expect(organizeButton).toBeVisible();
    await organizeButton.click();

    // Wait for layout to change
    await page.waitForTimeout(500);

    // Verify windows are still visible
    await expect(allWindows).toHaveCount(3);

    // Verify equal-sized grid layout (stable regardless of previous layout state).
    const boxes = await allWindows.evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      })
    );
    const widths = boxes.map((box) => box.width);
    const heights = boxes.map((box) => box.height);
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    const maxHeight = Math.max(...heights);
    const minHeight = Math.min(...heights);

    expect(maxWidth - minWidth).toBeLessThanOrEqual(2);
    expect(maxHeight - minHeight).toBeLessThanOrEqual(2);

    // Ensure grid occupies at least two columns (not a stacked overlap).
    const uniqueX = new Set(boxes.map((box) => Math.round(box.x)));
    expect(uniqueX.size).toBeGreaterThanOrEqual(2);
  });

  test('Reset Layout button resets windows to default positions', async ({
    page,
  }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    const timerDisplay = page.getByRole('timer');
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const organizeButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ORGANIZE_GRID,
    });
    const resetButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.RESET_LAYOUT,
    });

    await expect(addTimerButton).toBeVisible();
    await expect(addCounterButton).toBeVisible();
    await expect(organizeButton).toBeVisible();
    await expect(resetButton).toBeVisible();

    // Add 2 windows
    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();
    await expect(timerContainer).toBeVisible();
    await expect(timerDisplay).toBeVisible();

    await expect(addCounterButton).toBeVisible();
    await addCounterButton.click();
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    // Get all windows by data-testid prefix
    const allWindows = page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`);
    await expect(allWindows).toHaveCount(2);

    // Organize grid first
    const window1 = allWindows.first();

    await expect(organizeButton).toBeVisible();
    await organizeButton.click();
    await page.waitForTimeout(500);

    const organizedBox = await window1.boundingBox();

    // Click Reset Layout
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify windows are still visible
    await expect(allWindows).toHaveCount(2);

    // Verify layout changed from organized state
    const resetBox = await window1.boundingBox();
    const layoutChanged =
      organizedBox?.x !== resetBox?.x ||
      organizedBox?.y !== resetBox?.y ||
      organizedBox?.width !== resetBox?.width ||
      organizedBox?.height !== resetBox?.height;

    expect(layoutChanged).toBeTruthy();
  });

  test('Close All button removes all windows', async ({ page }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const addNotesButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    const timerDisplay = page.getByRole('timer');
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    const notesInput = page.getByPlaceholder(NOTES_STRINGS.PLACEHOLDER);
    const closeAllButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.CLOSE_ALL,
    });

    await expect(addTimerButton).toBeVisible();
    await expect(addCounterButton).toBeVisible();
    await expect(addNotesButton).toBeVisible();
    await expect(closeAllButton).toBeVisible();

    // Add 3 windows
    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();
    await expect(timerContainer).toBeVisible();
    await expect(timerDisplay).toBeVisible();

    await addCounterButton.click();
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    await addNotesButton.click();
    await expect(notesContainer).toBeVisible();
    await expect(notesInput).toBeVisible();

    // Get all windows by data-testid prefix
    const allWindows = page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`);
    await expect(allWindows).toHaveCount(3);

    // Click Close All
    await closeAllButton.click();

    // Verify all windows are removed (auto-waits)
    await expect(allWindows).toHaveCount(0);
  });

  test('Close All clears localStorage', async ({ page }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    const timerDisplay = page.getByRole('timer');
    const closeAllButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.CLOSE_ALL,
    });

    await expect(addTimerButton).toBeVisible();
    await expect(closeAllButton).toBeVisible();

    // Add a window
    await addTimerButton.click();
    await expect(timerContainer).toBeVisible();
    await expect(timerDisplay).toBeVisible();

    const allWindows = page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`);
    await expect(allWindows).toHaveCount(1);

    // Click Close All - removes all windows
    await closeAllButton.click();
    await expect(allWindows).toHaveCount(0);

    // Reload - Close All removes keys from localStorage; slice treats as first visit and shows initial windows
    await page.reload();
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();

    // After reload with empty stored state, app shows the built-in dashboard
    const windowsAfterReload = page.locator(
      `[role="${TEST_SELECTORS.WINDOW_ROLE}"]`
    );
    await expect(windowsAfterReload).toHaveCount(
      INITIAL_STATE_CONFIG.initialWindows.length
    );
  });
});
