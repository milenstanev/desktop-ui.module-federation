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

import { test, expect } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { ComponentNames } from '~/core/utils/componentLoader';

async function getMemoryUsage(page: any) {
  return await page.evaluate(() => {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
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

async function tryLoadAnalyticsFeature(page: any): Promise<boolean> {
  try {
    const archBtn = page.getByRole('button', { name: /Architecture/i });
    await archBtn.click();
    await page.waitForTimeout(300);
    const loadBtn = page.getByRole('button', {
      name: /Load Analytics Feature/i,
    });
    await loadBtn.waitFor({ state: 'visible', timeout: 2000 });
    await loadBtn.click();
    await page.waitForTimeout(500);
    await archBtn.click();
    return true;
  } catch {
    return false;
  }
}

test.describe('Memory Endurance Test', { tag: '@memory' }, () => {
  test('ENDURANCE: 10,000 operations without refresh (max 1000 windows)', async ({
    page,
  }) => {
    // NO beforeEach - single continuous session
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1');

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

    // Get all component names dynamically
    const componentNames: ComponentNames[] = [
      'Counter',
      'Notes',
      'Timer',
      'FormEditor',
      'SimpleExample',
    ];

    let totalAdded = 0;
    let totalRemoved = 0;
    let totalAnalyticsAdded = 0;

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
            // Force add - pick random component or Load Analytics
            const added =
              action < 0.2 ? await tryLoadAnalyticsFeature(page) : false;
            if (added) {
              totalAnalyticsAdded++;
              totalAdded++;
            } else {
              const randomButton =
                componentNames[
                  Math.floor(Math.random() * componentNames.length)
                ];
              await page.click(
                `text=Add ${randomButton.replace(/([A-Z])/g, ' $1').trim()}`
              );
              totalAdded++;
            }
          } else if (action < 0.35) {
            // 35%: Add random local window
            const randomButton =
              componentNames[Math.floor(Math.random() * componentNames.length)];
            await page.click(
              `text=Add ${randomButton.replace(/([A-Z])/g, ' $1').trim()}`
            );
            totalAdded++;
          } else if (action < 0.45) {
            // 10%: Load Analytics (remote micro-frontend)
            const added = await tryLoadAnalyticsFeature(page);
            if (added) {
              totalAnalyticsAdded++;
              totalAdded++;
            }
          } else if (action < 0.85) {
            // 40%: Remove random window
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
          } else {
            // 15%: Switch theme
            const currentTheme = await page
              .locator('#theme-select')
              .inputValue();
            const themes = ['light', 'dark', 'gradient'];
            const newTheme = themes[Math.floor(Math.random() * themes.length)];
            if (newTheme !== currentTheme) {
              await page.selectOption('#theme-select', newTheme);
            }
          }
        }

        // Memory snapshot every 200 operations
        if ((i + 1) % 200 === 0) {
          const memory = await getMemoryUsage(page);
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
      `  Total Added: ${totalAdded} (Analytics remotes: ${totalAnalyticsAdded})`
    );
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
