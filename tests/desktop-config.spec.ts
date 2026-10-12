import { test, expect } from '@playwright/test';
import { APP_STRINGS, COMPONENT_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

test.describe('Dashboard JSON configurator', () => {
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

  test('applies pasted JSON as the desktop layout', async ({ page }) => {
    await page
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.DASHBOARD_CONFIG,
      })
      .click();

    const textarea = page.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_TEXTAREA);
    await expect(textarea).toBeVisible();
    await textarea.fill(
      JSON.stringify([
        {
          id: 'e2e-timer',
          name: COMPONENT_NAMES.TIMER,
          lazyLoadComponent: 'Timer',
        },
      ])
    );
    await page
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.APPLY_DASHBOARD_JSON,
      })
      .click();

    await expect(
      page.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_STATUS)
    ).toHaveTextContent(APP_STRINGS.CONFIGURATOR_APPLIED);
    await expect(
      page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER)
    ).toBeVisible();
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(1);
  });
});
