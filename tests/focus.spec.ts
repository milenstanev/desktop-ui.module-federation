import { test, expect } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

const ROLE_SELECTOR = `[role="${TEST_SELECTORS.WINDOW_ROLE}"]`;
const CLASS_ATTRIBUTE = 'class';

test.describe('Window focus and keyboard shortcuts', () => {
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

  test('new window is automatically focused', async ({ page }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    const timerDisplay = page.getByRole(TEST_SELECTORS.ROLES.TIMER);
    const window1 = page.locator(ROLE_SELECTOR).first();

    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();

    // Wait for lazy-loaded Timer component
    await expect(timerContainer).toBeVisible();
    await expect(timerDisplay).toBeVisible();
    await expect(window1).toBeVisible();

    const classes = await window1.getAttribute(CLASS_ATTRIBUTE);
    expect(classes).toContain(TEST_SELECTORS.FOCUSED_CLASS);
  });

  test('Escape key closes focused window', async ({ page }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();
    await expect(page.locator(ROLE_SELECTOR)).toHaveCount(1);

    await page.keyboard.press(TEST_SELECTORS.KEYBOARD.ESCAPE);

    await expect(page.locator(ROLE_SELECTOR)).toHaveCount(0);
  });

  test('Ctrl+W closes focused window', async ({ page }) => {
    const addTimerButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    await expect(addTimerButton).toBeVisible();
    await addTimerButton.click();
    await expect(page.locator(ROLE_SELECTOR)).toHaveCount(1);

    await page.keyboard.press(TEST_SELECTORS.KEYBOARD.CTRL_W);

    await expect(page.locator(ROLE_SELECTOR)).toHaveCount(0);
  });
});
