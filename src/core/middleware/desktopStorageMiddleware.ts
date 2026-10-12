import { Middleware } from '@reduxjs/toolkit';
import {
  removeWindow,
  addWindow,
  updateLayouts,
  resetLayouts,
  removeAllWindows,
  organizeGrid,
  applyDesktopConfig,
} from '~/features/Desktop/DesktopSlice';
import {
  LOCAL_STORAGE_DESKTOP_KEY,
  LOCAL_STORAGE_LAYOUT_KEY,
} from '~/features/Desktop/config';
import type { RootState } from '~/core/store';
import { MIDDLEWARE_STRINGS } from '~/shared/constants';

const DESKTOP_SLICE_NAME = 'Desktop';
const WINDOWS_PROPERTY = 'desktopWindows';
const LAYOUTS_PROPERTY = 'layouts';

/**
 * Desktop Storage Middleware
 *
 * This middleware persists Desktop state (windows and layouts) to localStorage
 * whenever relevant actions are dispatched.
 *
 * IMPORTANT: When adding new actions to DesktopSlice that modify windows or layouts,
 * you MUST register them here by adding the action matcher to the if condition.
 *
 * Registered actions:
 * - addWindow: Adds a new window
 * - removeWindow: Removes a window
 * - updateLayouts: Updates window layouts (drag/resize)
 * - resetLayouts: Resets all layouts to defaults
 * - organizeGrid: Organizes windows in equal-sized grid
 * - applyDesktopConfig: Replaces windows and layouts from pasted JSON
 * - removeAllWindows: Removes Desktop keys from localStorage (full reset)
 *
 * NOT registered (intentionally):
 * - setFocus: Focus state should not persist across page reloads.
 *   When the user refreshes the page, no window should be pre-focused.
 *
 * Example: If you add a new action like `minimizeWindow`, you must add:
 *   minimizeWindow.match(action) ||
 *
 * This ensures the state is persisted to localStorage after every relevant change.
 */

export const desktopStorageMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    if (
      removeWindow.match(action) ||
      addWindow.match(action) ||
      updateLayouts.match(action) ||
      resetLayouts.match(action) ||
      organizeGrid.match(action) ||
      applyDesktopConfig.match(action)
    ) {
      const state = store.getState();
      const {
        [WINDOWS_PROPERTY]: desktopWindows,
        [LAYOUTS_PROPERTY]: layouts,
      } = state[DESKTOP_SLICE_NAME];

      try {
        localStorage.setItem(
          LOCAL_STORAGE_DESKTOP_KEY,
          JSON.stringify(desktopWindows)
        );
        localStorage.setItem(LOCAL_STORAGE_LAYOUT_KEY, JSON.stringify(layouts));
      } catch {
        console.warn(MIDDLEWARE_STRINGS.PERSIST_ERROR);
      }
    } else if (removeAllWindows.match(action)) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_DESKTOP_KEY);
        localStorage.removeItem(LOCAL_STORAGE_LAYOUT_KEY);
      } catch {
        console.warn(MIDDLEWARE_STRINGS.PERSIST_ERROR);
      }
    }

    return result;
  };
