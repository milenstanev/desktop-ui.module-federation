import { test, expect } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { MICRO_FRONTEND_STRINGS } from '~/shared/constants';

test.describe('Micro-frontends', () => {
  test('loads analytics remote feature in a desktop window', async ({
    page,
  }) => {
    await page.goto('/');

    const addAnalytics = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_ANALYTICS,
    });
    await expect(addAnalytics).toBeVisible();
    await addAnalytics.click();

    const feature = page.getByTestId(TEST_SELECTORS.ANALYTICS_REMOTE_FEATURE);
    const remoteError = page.getByRole('alert');

    await expect
      .poll(
        async () => {
          if (await feature.isVisible()) return 'loaded';
          if (await remoteError.isVisible()) return 'error';
          return 'pending';
        },
        { timeout: 15000 }
      )
      .toBe('loaded');

    await expect(remoteError).toHaveCount(0);
    await expect(feature).toBeVisible();
    await expect(
      page.getByText(MICRO_FRONTEND_STRINGS.LOADED_CAPTION)
    ).toBeVisible();

    await page.reload();
    await expect(feature).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(MICRO_FRONTEND_STRINGS.LOADED_CAPTION)
    ).toBeVisible();
  });
});
