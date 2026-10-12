import { test, expect } from '@playwright/test';
import { APP_STRINGS, COMPONENT_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';
import { LOCAL_STORAGE_DESKTOP_KEY } from '~/features/Desktop/config';

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

  test('desktopConfig query opens two Analytics and two Forms windows', async ({
    page,
  }) => {
    const snapshot = [
      {
        id: 'query-analytics-1',
        name: COMPONENT_NAMES.ANALYTICS,
        remoteFeatureName: 'analytics',
        lazyLoadReducerName: 'analytics',
      },
      {
        id: 'query-analytics-2',
        name: COMPONENT_NAMES.ANALYTICS,
        remoteFeatureName: 'analytics',
        lazyLoadReducerName: 'analytics',
      },
      {
        id: 'query-forms-1',
        name: COMPONENT_NAMES.FORMS,
        remoteFeatureName: 'schemaUi',
      },
      {
        id: 'query-forms-2',
        name: COMPONENT_NAMES.FORMS,
        remoteFeatureName: 'schemaUi',
      },
    ];
    await page.evaluate((storageKey) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify([
          {
            id: 'stored-counter',
            name: 'Counter',
            lazyLoadComponent: 'Counter',
          },
        ])
      );
    }, LOCAL_STORAGE_DESKTOP_KEY);
    await page.goto(
      `/?desktopConfig=${encodeURIComponent(JSON.stringify(snapshot))}`
    );
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(4);
    await expect(
      page.getByRole(TEST_SELECTORS.WINDOW_ROLE, {
        name: `Window: ${COMPONENT_NAMES.ANALYTICS}`,
      })
    ).toHaveCount(2);
    await expect(
      page.getByRole(TEST_SELECTORS.WINDOW_ROLE, {
        name: `Window: ${COMPONENT_NAMES.FORMS}`,
      })
    ).toHaveCount(2);
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
    ).toHaveText(APP_STRINGS.CONFIGURATOR_APPLIED);
    await expect(
      page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER)
    ).toBeVisible();
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(1);
  });
});
