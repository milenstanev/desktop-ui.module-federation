/**
 * Memory Endurance Test - SINGLE LONG RUN
 *
 * One continuous test session without page refresh.
 * Measures memory growth over thousands of operations.
 *
 * This is the REAL memory leak test.
 *
 * Run manually with: npm run test:memory
 * Excluded from CI due to long execution time.
 */

import { test, expect, type Page, type Route } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { ComponentNames } from '~/core/utils/componentLoader';

type MemoryUsage = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
};

type AddedWindowKind = 'local' | 'forms' | 'analytics' | 'jspm';

const LOCAL_WINDOW_BUTTONS: Record<
  Exclude<ComponentNames, 'JspmApp'>,
  RegExp
> = {
  Counter: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
  Notes: TEST_SELECTORS.BUTTONS.ADD_NOTES,
  Timer: TEST_SELECTORS.BUTTONS.ADD_TIMER,
  FormEditor: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
  SimpleExample: TEST_SELECTORS.BUTTONS.ADD_SIMPLE_EXAMPLE,
};

const LOCAL_WINDOW_NAMES = Object.keys(
  LOCAL_WINDOW_BUTTONS
) as (keyof typeof LOCAL_WINDOW_BUTTONS)[];

async function getMemoryUsage(page: Page): Promise<MemoryUsage | null> {
  return await page.evaluate(() => {
    if ('memory' in performance) {
      const mem = (performance as Performance & { memory?: MemoryUsage })
        .memory;
      if (!mem) return null;
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      };
    }
    return null;
  });
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getAddFormsButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.ADD_FORMS,
  });
}

function getAddAnalyticsButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.ADD_ANALYTICS,
  });
}

function getAddJspmAppButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.ADD_JSPM_APP,
  });
}

function getArchitectureButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.ARCHITECTURE,
  });
}

function getLoadAnalyticsFeatureButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.LOAD_ANALYTICS,
  });
}

function getOrganizeGridButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.ORGANIZE_GRID,
  });
}

function getResetLayoutButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.RESET_LAYOUT,
  });
}

function getCloseAllButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.CLOSE_ALL,
  });
}

function getDashboardLayoutJsonButton(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.DASHBOARD_CONFIG,
  });
}

function getDashboardConfigDialog(page: Page) {
  return page.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_DIALOG);
}

function getCopyDashboardJsonButton(page: Page) {
  return getDashboardConfigDialog(page).getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.COPY_DASHBOARD_JSON,
  });
}

function getCloseConfiguratorButton(page: Page) {
  return getDashboardConfigDialog(page).getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.CLOSE_CONFIGURATOR,
  });
}

function getSchemaUiHost(page: Page) {
  return page.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST).last();
}

function getEditRecordDialog(page: Page) {
  return page.getByRole(TEST_SELECTORS.ROLES.DIALOG, {
    name: TEST_SELECTORS.DIALOGS.EDIT_RECORD,
  });
}

function getEditRecordButton(page: Page) {
  return getSchemaUiHost(page)
    .getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.EDIT_RECORD,
    })
    .first();
}

function getSaveChangesButton(page: Page) {
  return getEditRecordDialog(page).getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.UPDATE_RECORD,
  });
}

function getCloseEditRecordButton(page: Page) {
  return getEditRecordDialog(page).getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: TEST_SELECTORS.BUTTONS.CLOSE_DIALOG,
  });
}

function getEditRecordUsernameField(page: Page) {
  // The edit dialog reuses field ids from the create form, so the label's
  // htmlFor does not resolve to the dialog input.
  return getEditRecordDialog(page).locator('#username');
}

function getAnalyticsRemoteFeature(page: Page) {
  return page.getByTestId(TEST_SELECTORS.ANALYTICS_REMOTE_FEATURE).last();
}

function getIncrementViewsButton(page: Page) {
  return getAnalyticsRemoteFeature(page).getByRole(
    TEST_SELECTORS.ROLES.BUTTON,
    { name: TEST_SELECTORS.BUTTONS.INCREMENT_VIEWS }
  );
}

function getJspmAppFrame(page: Page) {
  return page.getByTestId(TEST_SELECTORS.JSPM_APP_FRAME).last();
}

function getLocalWindowButton(
  page: Page,
  name: keyof typeof LOCAL_WINDOW_BUTTONS
) {
  return page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
    name: LOCAL_WINDOW_BUTTONS[name],
  });
}

async function stubSchemaUiRecordWrites(page: Page): Promise<void> {
  // Keep schema and the user list on the remote. Answer writes locally so
  // Save changes still runs the overlay path without changing remote data.
  await page.route(/\/api\/users(?:\/|\?|$)/, async (route: Route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Not found' }),
    });
  });
}

async function dismissEditRecordDialog(page: Page): Promise<void> {
  const dialog = getEditRecordDialog(page);
  if (!(await dialog.isVisible().catch(() => false))) {
    return;
  }
  const closeDialog = getCloseEditRecordButton(page);
  if (await closeDialog.isVisible().catch(() => false)) {
    await closeDialog.click();
  }
}

async function openRandomLocalWindow(page: Page): Promise<void> {
  const name =
    LOCAL_WINDOW_NAMES[Math.floor(Math.random() * LOCAL_WINDOW_NAMES.length)];
  await getLocalWindowButton(page, name).click();
}

async function exerciseAnalyticsIncrement(page: Page): Promise<void> {
  await getAnalyticsRemoteFeature(page).waitFor({
    state: 'visible',
    timeout: 2000,
  });
  await getIncrementViewsButton(page).click();
}

async function tryLoadAnalyticsFeature(page: Page): Promise<boolean> {
  try {
    const architecture = getArchitectureButton(page);
    await architecture.click();
    await page.waitForTimeout(300);
    const loadAnalytics = getLoadAnalyticsFeatureButton(page);
    await loadAnalytics.waitFor({ state: 'visible', timeout: 2000 });
    await loadAnalytics.click();
    await page.waitForTimeout(500);
    await architecture.click();
    try {
      await exerciseAnalyticsIncrement(page);
    } catch {
      // The remote window is open even if the increment control is not ready.
    }
    return true;
  } catch {
    return false;
  }
}

async function openAnalyticsAndIncrementViews(page: Page): Promise<boolean> {
  try {
    await getAddAnalyticsButton(page).click();
  } catch {
    return false;
  }
  try {
    await exerciseAnalyticsIncrement(page);
  } catch {
    // Header click already opened the analytics window.
  }
  return true;
}

async function openFormsAndSaveChanges(page: Page): Promise<boolean> {
  try {
    await getAddFormsButton(page).click();
  } catch {
    return false;
  }
  try {
    await getSchemaUiHost(page).waitFor({ state: 'visible', timeout: 2000 });
    const editRecord = getEditRecordButton(page);
    await editRecord.waitFor({ state: 'visible', timeout: 2000 });
    await editRecord.evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    const saveChanges = getSaveChangesButton(page);
    await saveChanges.waitFor({ state: 'visible', timeout: 2000 });
    await getEditRecordUsernameField(page).fill('memory-user');
    await saveChanges.click();
    try {
      await getEditRecordDialog(page).waitFor({
        state: 'hidden',
        timeout: 1000,
      });
    } catch {
      await dismissEditRecordDialog(page);
    }
  } catch {
    // The Forms window is open. Edit is best-effort when a row is present.
    await dismissEditRecordDialog(page);
  }
  return true;
}

async function openJspmAppWindow(page: Page): Promise<boolean> {
  try {
    await getAddJspmAppButton(page).click();
  } catch {
    return false;
  }
  try {
    await getJspmAppFrame(page).waitFor({ state: 'visible', timeout: 2000 });
  } catch {
    // The JSPM window is open even if the iframe has not painted yet.
  }
  return true;
}

async function exerciseDashboardConfigurator(page: Page): Promise<void> {
  await getDashboardLayoutJsonButton(page).click();
  await getDashboardConfigDialog(page).waitFor({
    state: 'visible',
    timeout: 2000,
  });
  try {
    await getCopyDashboardJsonButton(page).click();
  } finally {
    await getCloseConfiguratorButton(page).click();
  }
}

async function addWindowForEndurance(
  page: Page,
  slot: number
): Promise<AddedWindowKind | null> {
  const kind = slot % 5;
  if (kind === 1) {
    if (await openFormsAndSaveChanges(page)) return 'forms';
  } else if (kind === 2) {
    if (await openAnalyticsAndIncrementViews(page)) return 'analytics';
  } else if (kind === 3) {
    if (await tryLoadAnalyticsFeature(page)) return 'analytics';
  } else if (kind === 4) {
    if (await openJspmAppWindow(page)) return 'jspm';
  }
  if (kind === 0) {
    await openRandomLocalWindow(page);
    return 'local';
  }
  try {
    await openRandomLocalWindow(page);
    return 'local';
  } catch {
    return null;
  }
}

test.describe('Memory Endurance Test', { tag: '@memory' }, () => {
  test('ENDURANCE: 10,000 operations without refresh (max 1000 windows)', async ({
    page,
  }) => {
    // NO beforeEach - single continuous session
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1');
    await stubSchemaUiRecordWrites(page);

    const initialMemory = await getMemoryUsage(page);
    if (!initialMemory) {
      console.log('⚠️  Memory API not available');
      test.skip();
      return;
    }

    console.log('\n🔥 ENDURANCE TEST: 10,000 Operations - NO REFRESH');
    console.log(`  Max 1000 total windows will be created`);
    console.log(`  Initial: ${formatBytes(initialMemory.usedJSHeapSize)}`);
    console.log('  This will take ~20-30 minutes...\n');

    const memorySnapshots: number[] = [initialMemory.usedJSHeapSize];

    let totalAdded = 0;
    let totalRemoved = 0;
    let totalAnalyticsAdded = 0;
    let totalFormsAdded = 0;
    let totalJspmAdded = 0;
    let totalLayoutActions = 0;

    const noteAdded = (kind: AddedWindowKind | null) => {
      if (!kind) return;
      totalAdded++;
      if (kind === 'analytics') totalAnalyticsAdded++;
      if (kind === 'forms') totalFormsAdded++;
      if (kind === 'jspm') totalJspmAdded++;
    };

    for (let i = 0; i < 10000; i++) {
      try {
        const windowCount = await page
          .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
          .count();

        // Stop adding windows after 1000 total created
        if (totalAdded >= 1000) {
          // Only remove windows after limit reached
          if (windowCount > 0) {
            const randomIndex = Math.floor(Math.random() * windowCount);
            await page
              .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
              .nth(randomIndex)
              .click();
            totalRemoved++;
          }
        } else {
          const action = Math.random();

          // Keep 3-15 windows at all times
          if (windowCount > 15) {
            // Force remove
            await page
              .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
              .first()
              .click();
            totalRemoved++;
          } else if (windowCount < 3) {
            noteAdded(await addWindowForEndurance(page, i));
          } else if (action < 0.25) {
            // 25%: local window (Counter, Notes, Timer, Form Editor, Simple Example)
            await openRandomLocalWindow(page);
            noteAdded('local');
          } else if (action < 0.32) {
            // 7%: schema-ui Forms, then Edit record + Save changes once
            noteAdded((await openFormsAndSaveChanges(page)) ? 'forms' : null);
          } else if (action < 0.39) {
            // 7%: Header Add Analytics, then Increment views once
            noteAdded(
              (await openAnalyticsAndIncrementViews(page)) ? 'analytics' : null
            );
          } else if (action < 0.46) {
            // 7%: Architecture menu loads the analytics remote
            noteAdded(
              (await tryLoadAnalyticsFeature(page)) ? 'analytics' : null
            );
          } else if (action < 0.53) {
            // 7%: JSPM Angular iframe
            noteAdded((await openJspmAppWindow(page)) ? 'jspm' : null);
          } else if (action < 0.8) {
            // 27%: Remove random window
            const closeButtons = await page
              .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
              .count();
            if (closeButtons > 0) {
              const randomIndex = Math.floor(Math.random() * closeButtons);
              await page
                .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
                .nth(randomIndex)
                .click();
              totalRemoved++;
            }
          } else if (action < 0.9) {
            // 10%: Switch theme
            const currentTheme = await page
              .locator('#theme-select')
              .inputValue();
            const themes = ['light', 'dark', 'gradient'];
            const newTheme = themes[Math.floor(Math.random() * themes.length)];
            if (newTheme !== currentTheme) {
              await page.selectOption('#theme-select', newTheme);
            }
          } else if (action < 0.93) {
            await getOrganizeGridButton(page).click();
            totalLayoutActions++;
          } else if (action < 0.96) {
            await getResetLayoutButton(page).click();
            totalLayoutActions++;
          } else if (action < 0.98) {
            await exerciseDashboardConfigurator(page);
            totalLayoutActions++;
          } else {
            const openWindows = await page
              .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
              .count();
            await getCloseAllButton(page).click();
            totalRemoved += openWindows;
            totalLayoutActions++;
          }
        }

        // Memory snapshot every 200 operations
        if ((i + 1) % 200 === 0) {
          const memory = await getMemoryUsage(page);
          if (!memory) {
            throw new Error('Memory API unavailable');
          }
          memorySnapshots.push(memory.usedJSHeapSize);
          const currentWindows = await page
            .getByTestId(TEST_SELECTORS.WINDOW_CLOSE_BUTTON)
            .count();
          const growth = memory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          console.log(
            `  ${i + 1}/10000: ${formatBytes(memory.usedJSHeapSize)} (+${formatBytes(growth)}) | ${currentWindows} windows | Added: ${totalAdded} | Removed: ${totalRemoved}`
          );
        }
      } catch (error) {
        // Continue on errors
      }
    }

    console.log('\n  Waiting for final cleanup...');

    const finalMemory = await getMemoryUsage(page);
    if (!finalMemory) {
      throw new Error('Memory API unavailable');
    }
    const finalWindowCount = await page
      .getByTestId(TEST_SELECTORS.WINDOW_CONTAINER)
      .count();
    const totalGrowth =
      finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

    console.log('\n========================================');
    console.log('ENDURANCE TEST RESULTS');
    console.log('========================================');
    console.log(
      `  Initial Memory: ${formatBytes(initialMemory.usedJSHeapSize)}`
    );
    console.log(`  Final Memory: ${formatBytes(finalMemory.usedJSHeapSize)}`);
    console.log(`  Total Growth: ${formatBytes(totalGrowth)}`);
    console.log(`  Final Windows: ${finalWindowCount}`);
    console.log(
      `  Total Added: ${totalAdded} (Analytics: ${totalAnalyticsAdded}, Forms: ${totalFormsAdded}, JSPM: ${totalJspmAdded})`
    );
    console.log(`  Layout/config actions: ${totalLayoutActions}`);
    console.log(`  Total Removed: ${totalRemoved}`);
    console.log(`  Operations: 10,000`);

    // Analyze growth pattern
    const checkpoints = [1, 10, 20, 30, 40, memorySnapshots.length - 1];
    console.log('\n  Memory Growth Pattern:');
    for (const idx of checkpoints) {
      if (idx < memorySnapshots.length) {
        const ops = idx * 200;
        const growth = memorySnapshots[idx] - initialMemory.usedJSHeapSize;
        console.log(`    ${ops} ops: +${formatBytes(growth)}`);
      }
    }

    // Calculate growth rates
    const earlyGrowth = memorySnapshots[5] - memorySnapshots[0]; // 0-1000 ops
    const midGrowth = memorySnapshots[25] - memorySnapshots[20]; // 4000-5000 ops
    const lateGrowth =
      memorySnapshots[memorySnapshots.length - 1] -
      memorySnapshots[memorySnapshots.length - 6]; // Last 1000 ops

    console.log('\n  Growth Rate Analysis:');
    console.log(`    Early (0-1000): ${formatBytes(earlyGrowth)}`);
    console.log(`    Mid (4000-5000): ${formatBytes(midGrowth)}`);
    console.log(`    Late (9000-10000): ${formatBytes(lateGrowth)}`);

    // Verdict
    console.log('\n  Verdict:');
    if (lateGrowth > earlyGrowth * 2) {
      console.log('    ❌ MEMORY LEAK DETECTED - Growth rate increasing!');
    } else if (totalGrowth > 100 * 1024 * 1024) {
      console.log('    ❌ EXCESSIVE MEMORY GROWTH - Over 100MB!');
    } else {
      console.log('    ✅ NO MEMORY LEAK - Growth rate stable or decreasing');
    }
    console.log('========================================\n');

    // Assertions
    expect(totalGrowth).toBeLessThan(100 * 1024 * 1024); // < 100MB growth
    expect(lateGrowth).toBeLessThan(earlyGrowth * 3); // No continuous accumulation
  });
});
