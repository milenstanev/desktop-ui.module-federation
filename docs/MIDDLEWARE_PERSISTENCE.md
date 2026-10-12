# Middleware Persistence Pattern

This document explains how localStorage persistence works in the Desktop UI application and how to properly register new actions.

## Overview

The application uses Redux middleware to persist Desktop state (windows and layouts) to localStorage. This keeps reducers pure while ensuring state survives page reloads.

## How It Works

### 1. Middleware Pattern

The `desktopStorageMiddleware` listens for specific Redux actions:

- **Most actions** (addWindow, removeWindow, updateLayouts, resetLayouts, organizeGrid): persist state to localStorage via `localStorage.setItem()`.
- **removeAllWindows** (Close All button): completely removes the Desktop keys from localStorage via `localStorage.removeItem()`. This provides a full reset so that on next load the app treats it as a first visit (e.g. shows `INITIAL_STATE_CONFIG` windows if configured).

### 2. Action Registration

The middleware uses action matchers (`action.match()`) to determine if an action should trigger persistence. Each action that modifies `desktopWindows` or `layouts` must be registered.

## Adding a New Action

### Step-by-Step Guide

**1. Create the action in DesktopSlice**

```
// src/features/Desktop/DesktopSlice.ts
const DesktopSlice = createSlice({
  name: 'Desktop',
  initialState,
  reducers: {
    // ... existing actions
    minimizeWindow: (state, action: PayloadAction<string>) => {
      const window = state.desktopWindows.find(w => w.id === action.payload);
      
      if (window) {
        window.minimized = true; // Modifies state
      }
    },
  },
});

export const { minimizeWindow } = DesktopSlice.actions;
```

**2. Import the action in middleware**

```
// src/core/middleware/desktopStorageMiddleware.ts
import {
  removeWindow,
  addWindow,
  updateLayouts,
  resetLayouts,
  removeAllWindows,
  organizeGrid,
  minimizeWindow, // ← Add your import
} from '~/features/Desktop/DesktopSlice';
```

**3. Register in the if condition**

```
if (
  removeWindow.match(action) ||
  addWindow.match(action) ||
  updateLayouts.match(action) ||
  resetLayouts.match(action) ||
  organizeGrid.match(action) ||
  minimizeWindow.match(action) // ← Add your matcher (modifying actions only; removeAllWindows has its own branch)
) {
  // Persist via setItem
}
```

## What Happens If You Forget?

If you don't register an action in the middleware:

❌ **Problem**: Changes are applied to Redux state but NOT saved to localStorage
❌ **Result**: State is lost on page reload
❌ **User Impact**: Users lose their window arrangements, positions, and configurations

## Currently Registered Actions

| Action | Purpose | Modifies |
|--------|---------|----------|
| `addWindow` | Adds a new window | `desktopWindows`, `layouts` |
| `removeWindow` | Removes a window | `desktopWindows`, `layouts` |
| `updateLayouts` | Updates window positions/sizes | `layouts` |
| `resetLayouts` | Resets all layouts to defaults | `layouts` |
| `organizeGrid` | Organizes windows in grid | `layouts` |
| `removeAllWindows` | Removes Desktop keys from localStorage (full reset) | N/A (keys removed) |

## Actions That DON'T Need Registration

Actions that only modify `focusedWindowId` do NOT need registration because focus is not persisted:

Actions that only modify focus (e.g. `setFocus`) do not need middleware registration.

## Testing Persistence

When adding a new action, add a test in `desktopStorageMiddleware.test.ts` that dispatches the action and asserts `localStorage` contains the updated state.

## Checklist for New Actions

When adding a new Desktop action:

- [ ] Action added to `DesktopSlice.ts`
- [ ] Action imported in `desktopStorageMiddleware.ts`
- [ ] Action matcher added to middleware if condition
- [ ] Test added to `desktopStorageMiddleware.test.ts`
- [ ] Verified state persists after page reload

## Common Mistakes

### ❌ Mistake 1: Forgetting to Import
Import the action before using it in the matcher.

### ❌ Mistake 2: Wrong Import Path
Use `~/features/Desktop/DesktopSlice` not a relative path.

### ❌ Mistake 3: Not Adding to If Condition
Add `yourAction.match(action)` to the middleware's if condition.

## Best Practices

1. **Always test persistence** after adding a new action
2. **Document the action** in the middleware comment block
3. **Add tests** for the new action in middleware tests
4. **Update this document** when adding new patterns
5. **Review the middleware** when reviewing PRs that add Desktop actions

## Related Files

- `src/core/middleware/desktopStorageMiddleware.ts` - The middleware implementation
- `src/core/middleware/desktopStorageMiddleware.test.ts` - Middleware tests
- `src/features/Desktop/DesktopSlice.ts` - Desktop actions
- `src/features/Desktop/config.ts` - localStorage keys

## Questions?

If you're unsure whether an action needs registration:

**Ask yourself**: Does this action modify `desktopWindows` or `layouts`?
- **Yes** → Register in middleware
- **No** → No registration needed

When in doubt, register it. Extra registrations are harmless, but missing registrations cause bugs.
