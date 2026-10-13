import { test, expect } from '@playwright/test';
import { DEFAULT_JSPM_APP_URL } from '~/features/JspmApp/jspmAppUrl';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

test.describe('JSPM AngularJS window', () => {
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

  test('opens an iframe for the JSPM app', async ({ page }) => {
    await page
      .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
        name: TEST_SELECTORS.BUTTONS.ADD_JSPM_APP,
      })
      .click();

    const frame = page.getByTestId(TEST_SELECTORS.JSPM_APP_FRAME);
    await expect(frame).toBeVisible();
    const src = await frame.getAttribute('src');
    expect(src).toContain(DEFAULT_JSPM_APP_URL);
    expect(src).toContain('desktopWindowId=');
    expect(src).toContain('desktopHostOrigin=');
  });
});
