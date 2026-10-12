import { test, expect } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

test.describe('Timer feature', () => {
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

  test('opens Timer window and shows timer UI', async ({ page }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    const timerDisplay = page.getByRole(TEST_SELECTORS.ROLES.TIMER);
    const startButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.START_TIMER,
    });
    const pauseButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.PAUSE_TIMER,
    });
    const resetButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.RESET_TIMER,
    });

    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();

    // Wait for lazy-loaded Timer component
    await expect(timerContainer).toBeVisible();
    await expect(timerDisplay).toBeVisible();

    await expect(timerDisplay).toHaveText(TEST_SELECTORS.TIMER_FORMAT_REGEX);
    await expect(startButton).toBeVisible();
    await expect(pauseButton).toBeVisible();
    await expect(resetButton).toBeVisible();
  });
});
