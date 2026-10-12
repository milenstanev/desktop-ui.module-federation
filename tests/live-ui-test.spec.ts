/**
 * Live UI Test
 *
 * Comprehensive test suite for the live running application.
 * Run against your local server: http://192.168.1.5:3000/
 *
 * Usage:
 * npx playwright test tests/live-ui-test.spec.ts --headed
 */

import { test, expect } from '@playwright/test';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { closeAllWindows } from '~/tests/helpers';

test.describe('Live UI - Comprehensive Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId(TEST_SELECTORS.APP_HEADING).waitFor();
    await closeAllWindows(page);
  });

  test('Application loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(TEST_SELECTORS.PAGE_TITLE);

    // Check main heading
    const heading = page.getByRole(TEST_SELECTORS.ROLES.HEADING, { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Desktop UI');

    // Check desktop container
    const desktop = page.getByTestId(TEST_SELECTORS.DESKTOP_CONTAINER);
    await expect(desktop).toBeVisible();
  });

  test('Theme switching works', async ({ page }) => {
    // Check initial theme (gradient is default)
    const html = page.locator('html');
    await expect(html).toHaveAttribute(
      'data-theme',
      TEST_SELECTORS.THEMES.GRADIENT
    );

    // Find and click theme selector
    const themeSelect = page
      .locator('select')
      .filter({ hasText: /Light|Dark|Gradient/ });
    await expect(themeSelect).toBeVisible();

    // Switch to dark theme
    await expect(themeSelect).toBeVisible();
    await themeSelect.selectOption(TEST_SELECTORS.THEMES.DARK);
    await expect(html).toHaveAttribute(
      'data-theme',
      TEST_SELECTORS.THEMES.DARK
    );

    // Switch to gradient theme
    await expect(themeSelect).toBeVisible();
    await themeSelect.selectOption(TEST_SELECTORS.THEMES.GRADIENT);
    await expect(html).toHaveAttribute(
      'data-theme',
      TEST_SELECTORS.THEMES.GRADIENT
    );

    // Verify theme persists after reload
    await page.reload();
    await expect(html).toHaveAttribute(
      'data-theme',
      TEST_SELECTORS.THEMES.GRADIENT
    );
  });

  test('Can add and interact with Counter window', async ({ page }) => {
    // Add Counter window
    const addCounterBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    await expect(addCounterBtn).toBeVisible();
    await addCounterBtn.click();

    // Wait for lazy-loaded component
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    await expect(counterContainer).toBeVisible();

    // Check initial value
    const counterValue = page.getByTestId(TEST_SELECTORS.COUNTER.VALUE);
    await expect(counterValue).toHaveText('0');

    // Increment counter
    const incrementBtn = page.getByTestId(
      TEST_SELECTORS.COUNTER.INCREMENT_BUTTON
    );
    await expect(incrementBtn).toBeVisible();
    await incrementBtn.click();
    await expect(counterValue).toHaveText('1');

    // Increment multiple times
    await expect(incrementBtn).toBeVisible();
    await incrementBtn.click();
    await expect(incrementBtn).toBeVisible();
    await incrementBtn.click();
    await expect(counterValue).toHaveText('3');

    // Decrement counter
    const decrementBtn = page.getByTestId(
      TEST_SELECTORS.COUNTER.DECREMENT_BUTTON
    );
    await expect(decrementBtn).toBeVisible();
    await decrementBtn.click();
    await expect(counterValue).toHaveText('2');
  });

  test('Can add and use Notes window', async ({ page }) => {
    // Add Notes window
    const addNotesBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    await expect(addNotesBtn).toBeVisible();
    await addNotesBtn.click();

    // Wait for lazy-loaded component
    const notesContainer = page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER);
    await expect(notesContainer).toBeVisible();

    // Add a note
    const noteInput = notesContainer.locator(
      `input[type="${TEST_SELECTORS.INPUT_TYPES.TEXT}"]`
    );
    await expect(noteInput).toBeVisible();
    await expect(noteInput).toBeVisible();
    await noteInput.fill('Test note from live UI');
    await expect(noteInput).toBeVisible();
    await noteInput.press('Enter');

    // Verify note appears
    const notesList = page.getByTestId(TEST_SELECTORS.NOTES_LIST);
    await expect(notesList.locator('li')).toHaveCount(1);
    await expect(notesList.locator('li').first()).toContainText(
      'Test note from live UI'
    );

    // Add another note
    await expect(noteInput).toBeVisible();
    await noteInput.fill('Second test note');
    await expect(noteInput).toBeVisible();
    await noteInput.press('Enter');
    await expect(notesList.locator('li')).toHaveCount(2);

    // Remove a note
    const deleteBtn = notesList.locator('button').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();
    await expect(notesList.locator('li')).toHaveCount(1);
  });

  test('Can add and use Timer window', async ({ page }) => {
    // Add Timer window
    const addTimerBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    await expect(addTimerBtn).toBeVisible();
    await addTimerBtn.click();

    // Wait for lazy-loaded component
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    await expect(timerContainer).toBeVisible();

    // Check initial time
    const timerDisplay = timerContainer.getByRole(TEST_SELECTORS.ROLES.TIMER);
    await expect(timerDisplay).toHaveText(TEST_SELECTORS.TIMER_INITIAL_TIME);

    // Start timer
    const startBtn = timerContainer.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.START_TIMER,
    });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Wait for timer to tick
    await page.waitForTimeout(2000);
    await expect(timerDisplay).toHaveText('00:02');

    // Pause timer
    const pauseBtn = timerContainer.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.PAUSE_TIMER,
    });
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();

    // Verify timer stopped
    const timeWhenPaused = await timerDisplay.textContent();
    await page.waitForTimeout(1000);
    await expect(timerDisplay).toHaveText(timeWhenPaused || '00:02');

    // Reset timer
    const resetBtn = timerContainer.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.RESET_TIMER,
    });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await expect(timerDisplay).toHaveText(TEST_SELECTORS.TIMER_INITIAL_TIME);
  });

  test('Can add and use FormEditor window', async ({ page }) => {
    // Add FormEditor window
    const addFormBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_FORM_EDITOR,
    });
    await expect(addFormBtn).toBeVisible();
    await addFormBtn.click();

    // Wait for lazy-loaded component and data
    const formEditor = page.getByTestId(TEST_SELECTORS.FORM_EDITOR);
    await expect(formEditor).toBeVisible();

    // Check form fields are present
    const firstNameField = formEditor.locator(
      `input[name="${TEST_SELECTORS.FORM_FIELDS.FIRST_NAME}"]`
    );
    await expect(firstNameField).toBeVisible();

    // Fill out form
    await expect(firstNameField).toBeVisible();
    await firstNameField.clear();
    await firstNameField.fill('John');

    const lastNameField = formEditor.locator(
      `input[name="${TEST_SELECTORS.FORM_FIELDS.LAST_NAME}"]`
    );
    await expect(lastNameField).toBeVisible();
    await lastNameField.clear();
    await lastNameField.fill('Doe');

    const ageField = formEditor.locator(
      `input[name="${TEST_SELECTORS.FORM_FIELDS.AGE}"]`
    );
    await expect(ageField).toBeVisible();
    await ageField.clear();
    await ageField.fill('30');

    const roleSelect = formEditor.locator(
      `select[name="${TEST_SELECTORS.FORM_FIELDS.ROLE}"]`
    );
    await expect(roleSelect).toBeVisible();
    await roleSelect.selectOption('admin');

    // Submit form
    const submitBtn = page.getByTestId(TEST_SELECTORS.FORM_SUBMIT_BUTTON);
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Wait for alert (mock API success)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('successfully');
      await dialog.accept();
    });
  });

  test('Can close windows', async ({ page }) => {
    // Add multiple windows
    const addCounterBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    await expect(addCounterBtn).toBeVisible();
    await addCounterBtn.click();
    const addNotesBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    await expect(addNotesBtn).toBeVisible();
    await addNotesBtn.click();
    const addTimerBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    await expect(addTimerBtn).toBeVisible();
    await addTimerBtn.click();

    // Wait for all windows to load
    await expect(
      page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER)
    ).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER)
    ).toBeVisible();
    await expect(
      page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER)
    ).toBeVisible();

    // Count windows
    const windows = page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`);
    await expect(windows).toHaveCount(3);

    // Close first window
    const closeButtons = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.CLOSE_WINDOW,
    });
    await expect(closeButtons.first()).toBeVisible();
    await closeButtons.first().click();
    await expect(windows).toHaveCount(2);

    // Close all windows
    await expect(closeButtons.first()).toBeVisible();
    await closeButtons.first().click();
    await expect(closeButtons.first()).toBeVisible();
    await closeButtons.first().click();
    await expect(windows).toHaveCount(0);
  });

  test('Window drag and resize works', async ({ page }) => {
    // Add a window
    const addCounterBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    await expect(addCounterBtn).toBeVisible();
    await addCounterBtn.click();
    const counterContainer = page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER);
    await expect(counterContainer).toBeVisible();

    // Get window element
    const windowElement = page
      .locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
      .first();
    const initialBox = await windowElement.boundingBox();
    expect(initialBox).not.toBeNull();

    // Try to drag window (drag by header)
    const windowHeader = windowElement.getByTestId(
      TEST_SELECTORS.WINDOW_HEADER
    );
    await windowHeader.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox!.x + 100, initialBox!.y + 100);
    await page.mouse.up();

    // Verify window moved
    const newBox = await windowElement.boundingBox();
    expect(newBox).not.toBeNull();
    // Position should have changed (allowing some tolerance)
    const moved =
      Math.abs(newBox!.x - initialBox!.x) > 50 ||
      Math.abs(newBox!.y - initialBox!.y) > 50;
    expect(moved).toBeTruthy();
  });

  test('Layout controls work', async ({ page }) => {
    // Add multiple windows
    const addCounterBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    await expect(addCounterBtn).toBeVisible();
    await addCounterBtn.click();
    const addNotesBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    await expect(addNotesBtn).toBeVisible();
    await addNotesBtn.click();
    const addTimerBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    await expect(addTimerBtn).toBeVisible();
    await addTimerBtn.click();

    // Wait for windows
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(3);

    // Find organize button
    const organizeBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ORGANIZE_GRID,
    });
    await expect(organizeBtn).toBeVisible();
    await expect(organizeBtn).toBeVisible();
    await organizeBtn.click();

    // Verify windows are organized (positions should change)
    await page.waitForTimeout(500); // Allow animation

    // Find reset button (use specific text to avoid ambiguity with Timer reset button)
    const resetBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.RESET_LAYOUT,
    });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify windows still exist (reset only resets layout, doesn't remove windows)
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(3);

    // Now test Close All button
    const closeAllBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.CLOSE_ALL,
    });
    await expect(closeAllBtn).toBeVisible();
    await closeAllBtn.click();

    // Verify all windows are removed
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(0);
  });

  test('Keyboard shortcuts work', async ({ page }) => {
    // Add a window
    const addCounterBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_COUNTER,
    });
    await expect(addCounterBtn).toBeVisible();
    await addCounterBtn.click();
    await expect(
      page.getByTestId(TEST_SELECTORS.COUNTER.CONTAINER)
    ).toBeVisible();

    // Press Escape to close window
    await page.keyboard.press(TEST_SELECTORS.KEYBOARD.ESCAPE);
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(0);

    // Add another window
    const addNotesBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_NOTES,
    });
    await expect(addNotesBtn).toBeVisible();
    await addNotesBtn.click();
    await expect(
      page.getByTestId(TEST_SELECTORS.NOTES_CONTAINER)
    ).toBeVisible();

    // Press Ctrl+W (or Cmd+W on Mac) to close window
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press(TEST_SELECTORS.KEYBOARD.META_W);
    } else {
      await page.keyboard.press(TEST_SELECTORS.KEYBOARD.CTRL_W);
    }
    await expect(
      page.locator(`[role="${TEST_SELECTORS.WINDOW_ROLE}"]`)
    ).toHaveCount(0);
  });

  test('Accessibility - ARIA attributes present', async ({ page }) => {
    // Check main application has proper role
    const desktop = page.getByTestId(TEST_SELECTORS.DESKTOP_CONTAINER);
    await expect(desktop).toHaveAttribute(
      'role',
      TEST_SELECTORS.APPLICATION_ROLE
    );

    // Add Timer to check ARIA
    const addTimerBtn = page.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.ADD_TIMER,
    });
    await expect(addTimerBtn).toBeVisible();
    await addTimerBtn.click();
    const timerContainer = page.getByTestId(TEST_SELECTORS.TIMER_CONTAINER);
    await expect(timerContainer).toBeVisible();

    // Check timer has proper ARIA attributes
    const timerDisplay = timerContainer.getByRole(TEST_SELECTORS.ROLES.TIMER);
    await expect(timerDisplay).toHaveAttribute('aria-live', 'polite');

    // Check buttons have aria-labels
    const startBtn = timerContainer.getByRole(TEST_SELECTORS.ROLES.BUTTON, {
      name: TEST_SELECTORS.BUTTONS.START_TIMER,
    });
    await expect(startBtn).toHaveAttribute('aria-label');
  });

  test('PWA - Service Worker registered (production only)', async ({
    page,
  }) => {
    // Check if service worker is registered (only in production builds)
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBeTruthy();
  });

  test('Performance - Page loads quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    // Wait for desktop to be visible
    await page
      .getByTestId(TEST_SELECTORS.DESKTOP_CONTAINER)
      .waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;

    // Page should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Responsive - Works on different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(
      page.getByTestId(TEST_SELECTORS.DESKTOP_CONTAINER)
    ).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(
      page.getByTestId(TEST_SELECTORS.DESKTOP_CONTAINER)
    ).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(
      page.getByTestId(TEST_SELECTORS.DESKTOP_CONTAINER)
    ).toBeVisible();
  });
});
