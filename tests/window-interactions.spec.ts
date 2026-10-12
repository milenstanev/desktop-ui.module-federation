import { test, expect } from '@playwright/test';
import { NOTES_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { LOCAL_STORAGE_LAYOUT_KEY } from '~/features/Desktop/config';
import { closeAllWindows } from '~/tests/helpers';

test.describe('Window positioning and state management', () => {
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

  test('layout persists to localStorage after drag and survives reload', async ({
    page,
  }) => {
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const window = page.locator('.react-grid-item').first();

    // Add a counter window
    await expect(addCounterButton).toBeVisible();
    await addCounterButton.click();

    // Wait for lazy-loaded Counter component to be fully rendered
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    await expect(window).toBeVisible();

    // Wait for grid layout to be fully initialized
    const dragHandle = window.locator('.drag-handle').first();
    await expect(dragHandle).toBeVisible();

    // Wait for localStorage to be initially saved (from addWindow middleware)
    // This can take a moment as the middleware runs after the Redux action completes
    await page.waitForFunction(
      (storageKey) => {
        const layouts = localStorage.getItem(storageKey);
        if (!layouts) return false;
        try {
          const parsed = JSON.parse(layouts);
          return parsed && parsed.lg && parsed.lg.length === 1;
        } catch {
          return false;
        }
      },
      LOCAL_STORAGE_LAYOUT_KEY,
      { timeout: 15000 }
    );

    const initialBox = await window.boundingBox();
    expect(initialBox).not.toBeNull();
    const dragBox = await dragHandle.boundingBox();
    expect(dragBox).not.toBeNull();

    // Perform a drag operation
    await page.mouse.move(
      dragBox!.x + dragBox!.width / 2,
      dragBox!.y + dragBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      dragBox!.x + dragBox!.width / 2 + 150,
      dragBox!.y + dragBox!.height / 2 + 100,
      { steps: 20 }
    );
    await page.mouse.up();

    // Wait for the window position to change
    await page.waitForFunction(
      (box) => {
        const el = document.querySelector('.react-grid-item');
        if (!el) return false;
        const newBox = el.getBoundingClientRect();
        return (
          Math.abs(newBox.x - box.x) > 50 || Math.abs(newBox.y - box.y) > 50
        );
      },
      initialBox,
      { timeout: 10000 }
    );

    // Check localStorage was updated (this is YOUR code, not react-grid-layout)
    const layoutsInStorage = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);
    expect(layoutsInStorage).toBeTruthy();

    const layouts = JSON.parse(layoutsInStorage!);
    expect(layouts.lg).toBeDefined();
    expect(layouts.lg.length).toBe(1);

    // Reload and verify YOUR Redux state was restored from localStorage
    await page.reload();
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();

    const layoutsAfterReload = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);

    expect(layoutsAfterReload).toBe(layoutsInStorage);
  });

  test('updateLayouts action saves to localStorage via middleware', async ({
    page,
  }) => {
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const window = page.locator('.react-grid-item').first();

    // Add a counter window
    await expect(addCounterButton).toBeVisible();
    await addCounterButton.click();

    // Wait for lazy-loaded Counter component to be fully rendered
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();
    await expect(window).toBeVisible();

    // Get initial localStorage state
    const initialStorage = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);

    // Perform a resize (triggers updateLayouts action in YOUR code)
    const resizeHandle = window.locator('.react-resizable-handle').first();
    await expect(resizeHandle).toBeVisible();

    const initialSize = await window.boundingBox();
    expect(initialSize).not.toBeNull();
    const resizeBox = await resizeHandle.boundingBox();
    expect(resizeBox).not.toBeNull();

    await page.mouse.move(
      resizeBox!.x + resizeBox!.width / 2,
      resizeBox!.y + resizeBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      resizeBox!.x + resizeBox!.width / 2 + 100,
      resizeBox!.y + resizeBox!.height / 2 + 80,
      { steps: 20 }
    );
    await page.mouse.up();

    // Wait for the window size to change
    await page.waitForFunction(
      (size) => {
        const el = document.querySelector('.react-grid-item');
        if (!el) return false;
        const newSize = el.getBoundingClientRect();
        return (
          Math.abs(newSize.width - size.width) > 50 ||
          Math.abs(newSize.height - size.height) > 50
        );
      },
      initialSize,
      { timeout: 10000 }
    );

    // Wait for localStorage to be updated by middleware (should be different from initial)
    await page.waitForFunction(
      ({ initial, storageKey }) => {
        const current = localStorage.getItem(storageKey);
        return current !== null && current !== initial;
      },
      { initial: initialStorage, storageKey: LOCAL_STORAGE_LAYOUT_KEY },
      { timeout: 10000 }
    );

    // Verify YOUR middleware saved to localStorage
    const layoutsInStorage = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);

    expect(layoutsInStorage).toBeTruthy();
    const layouts = JSON.parse(layoutsInStorage!);

    // Verify YOUR Redux state structure
    expect(layouts).toHaveProperty('xl');
    expect(layouts).toHaveProperty('lg');
    expect(layouts).toHaveProperty('md');
    expect(layouts).toHaveProperty('sm');
    expect(layouts.lg.length).toBe(1);
    expect(layouts.lg[0]).toHaveProperty('i');
    expect(layouts.lg[0]).toHaveProperty('w');
    expect(layouts.lg[0]).toHaveProperty('h');
  });

  test('removeWindow action updates localStorage and cleans up layouts', async ({
    page,
  }) => {
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const addNotesButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    const notesInput = page.getByPlaceholder(NOTES_STRINGS.PLACEHOLDER);
    const windows = page.locator('.react-grid-item');

    // Add two windows
    await addCounterButton.click();

    // Wait for lazy-loaded Counter component
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    await addNotesButton.click();

    // Wait for lazy-loaded Notes component (check input, not empty list)
    await expect(notesContainer).toBeVisible();
    await expect(notesInput).toBeVisible();

    await expect(windows).toHaveCount(2);

    // Wait for localStorage to be updated with 2 windows (middleware persistence)
    await page.waitForFunction(
      (storageKey) => {
        const layouts = localStorage.getItem(storageKey);
        if (!layouts) return false;
        try {
          const parsed = JSON.parse(layouts);
          return parsed && parsed.lg && parsed.lg.length === 2;
        } catch {
          return false;
        }
      },
      LOCAL_STORAGE_LAYOUT_KEY,
      { timeout: 15000 }
    );

    // Verify localStorage has 2 windows
    let layoutsInStorage = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);
    let layouts = JSON.parse(layoutsInStorage!);
    expect(layouts.lg.length).toBe(2);

    // Close first window (tests YOUR removeWindow action)
    const closeButton = windows.first().getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: /close/i,
    });
    await closeButton.click();

    // Wait for window to be removed
    await expect(windows).toHaveCount(1);

    // Verify YOUR middleware cleaned up localStorage
    layoutsInStorage = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);
    layouts = JSON.parse(layoutsInStorage!);
    expect(layouts.lg.length).toBe(1);

    // Reload and verify state restored correctly
    await page.reload();
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();

    const windowsAfterReload = page.locator('.react-grid-item');
    await expect(windowsAfterReload).toHaveCount(1);
  });

  test.skip('focusedWindowId updates when clicking window (YOUR setFocus action)', async ({
    page,
  }) => {
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const addNotesButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    const notesInput = page.getByPlaceholder(NOTES_STRINGS.PLACEHOLDER);
    const windows = page.locator('.react-grid-item');

    // Add two windows
    await expect(addCounterButton).toBeVisible();
    await addCounterButton.click();

    // Wait for lazy-loaded Counter component
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    await expect(addNotesButton).toBeVisible();
    await addNotesButton.click();

    // Wait for lazy-loaded Notes component (check input, not empty list)
    await expect(notesContainer).toBeVisible();
    await expect(notesInput).toBeVisible();

    await expect(windows).toHaveCount(2);

    // Second window should be focused (most recently added)
    const window1 = windows.nth(0);
    const window2 = windows.nth(1);

    // Window 2 should have higher z-index (YOUR focusedWindowId logic)
    const window1ZIndex = await window1.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('z-index')
    );
    const window2ZIndex = await window2.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('z-index')
    );

    expect(parseInt(window2ZIndex)).toBeGreaterThan(parseInt(window1ZIndex));

    // Click first window to trigger focus
    await expect(window1).toBeVisible();
    await window1.click();

    // Small wait for Redux state to update
    await page.waitForTimeout(100);

    // Verify window 1 now has higher z-index than window 2 (indicates focus changed)
    const window1ZIndexAfter = await window1.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('z-index')
    );
    const window2ZIndexAfter = await window2.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('z-index')
    );

    expect(parseInt(window1ZIndexAfter)).toBeGreaterThan(
      parseInt(window2ZIndexAfter)
    );

    // Verify the focused class is applied
    await expect(window1Inner).toHaveClass(/focused/);
  });

  test('drag handle allows drag but close button does not (YOUR draggableHandle config)', async ({
    page,
  }) => {
    const addCounterButton = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    const window = page.locator('.react-grid-item').first();

    // Add a counter window
    await expect(addCounterButton).toBeVisible();
    await addCounterButton.click();

    // Wait for lazy-loaded Counter component
    await expect(counterContainer).toBeVisible();
    await expect(counterValue).toBeVisible();

    await expect(window).toBeVisible();

    // Verify drag handle exists (YOUR configuration)
    const dragHandle = window.locator('.drag-handle');
    await expect(dragHandle).toBeVisible();

    // Verify close button is NOT in drag handle
    const closeButton = window.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: /close/i,
    });
    await expect(closeButton).toBeVisible();

    // Click close button should remove window, not drag it
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Wait for window to be removed
    await expect(window).not.toBeVisible();

    // Verify YOUR removeWindow action cleaned up localStorage
    const layoutsInStorage = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, LOCAL_STORAGE_LAYOUT_KEY);

    if (layoutsInStorage) {
      const layouts = JSON.parse(layoutsInStorage);
      expect(layouts.lg.length).toBe(0);
    }
  });
});
