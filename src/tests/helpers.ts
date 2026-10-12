import { expect, Page } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';

/**
 * Closes all open windows. Use after clearing localStorage when the app
 * shows the built-in dashboard (or bootstrap JSON) from INITIAL_STATE_CONFIG.
 */
export async function closeAllWindows(page: Page): Promise<void> {
  const closeAllBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.CLOSE_ALL,
  });
  if (await closeAllBtn.isVisible()) {
    await closeAllBtn.click();
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(0);
  }
}
