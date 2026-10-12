# Window Interactions E2E Tests

**File**: `tests/window-interactions.spec.ts`

## Overview

Smart, focused E2E tests that verify **YOUR custom implementation** - Redux integration, middleware persistence, and state management. These tests focus on your code, not the underlying `react-grid-layout` library.

## Test Cases (4 tests)

### 1. Layout Persists to localStorage After Drag

**What it tests** (YOUR code):
- `updateLayouts` action is dispatched when dragging
- `desktopStorageMiddleware` saves to localStorage
- Redux state is restored from localStorage on reload

**Why it matters**:
- Tests YOUR middleware integration
- Verifies YOUR Redux → localStorage flow
- Tests YOUR state restoration logic

**What it doesn't test**:
- ❌ Whether react-grid-layout can drag (that's their job)
- ❌ Pixel-perfect positioning (implementation detail)

---

### 2. updateLayouts Action Saves to localStorage via Middleware

**What it tests** (YOUR code):
- `updateLayouts` action triggers middleware
- `desktopStorageMiddleware` saves all breakpoints (xl, lg, md, sm)
- Layout structure matches YOUR Redux state shape

**Why it matters**:
- Tests YOUR middleware is registered correctly
- Verifies YOUR state structure is persisted
- Tests YOUR breakpoint configuration

**What it doesn't test**:
- ❌ Whether resize handle works (library's job)
- ❌ Exact pixel sizes (implementation detail)

---

### 3. removeWindow Action Updates localStorage and Cleans Up Layouts

**What it tests** (YOUR code):
- `removeWindow` action removes window from state
- `desktopStorageMiddleware` updates localStorage
- Layout arrays are cleaned up correctly
- State restoration works after removal

**Why it matters**:
- Tests YOUR removeWindow reducer logic
- Verifies YOUR middleware handles removal
- Tests YOUR cleanup logic for all breakpoints

**What it doesn't test**:
- ❌ Button click mechanics (browser's job)

---

### 4. focusedWindowId Updates When Clicking Window (setFocus Action)

**What it tests** (YOUR code):
- `setFocus` action updates `focusedWindowId`
- Focused window gets higher z-index (YOUR CSS logic)
- Focus state changes when clicking different windows

**Why it matters**:
- Tests YOUR focus management logic
- Verifies YOUR z-index calculation
- Tests YOUR window stacking order

**What it doesn't test**:
- ❌ Generic click handling (browser's job)

---

### 5. Drag Handle Config (draggableHandle)

**What it tests** (YOUR code):
- YOUR `draggableHandle` configuration is correct
- Close button is clickable without triggering drag
- `removeWindow` action cleans up layouts in localStorage; `removeAllWindows` removes the Desktop keys entirely

**Why it matters**:
- Tests YOUR react-grid-layout configuration
- Verifies YOUR UX decision (drag by title only)
- Tests YOUR cleanup logic

---

## Running the Tests

```bash
# Build the app first
npm run build

# Run all E2E tests
npx playwright test

# Run only window interaction tests
npx playwright test tests/window-interactions.spec.ts

# Run with UI mode (debugging)
npx playwright test --ui
```

## Test Strategy

These tests follow a **"test your code, not libraries"** approach:

✅ **Test YOUR Redux actions** - `updateLayouts`, `removeWindow`, `setFocus`  
✅ **Test YOUR middleware** - `desktopStorageMiddleware` saves to localStorage  
✅ **Test YOUR state structure** - All breakpoints (xl, lg, md, sm) are persisted  
✅ **Test YOUR configuration** - `draggableHandle` class, z-index logic  
✅ **Test YOUR cleanup logic** - Layouts are cleaned up when windows close  

❌ **Don't test react-grid-layout** - Assume the library works  
❌ **Don't test exact pixels** - That's implementation detail  
❌ **Don't test browser APIs** - Assume mouse/drag works  

## Why These Tests Matter

**Unit tests** verify Redux reducers in isolation, but they don't test:
- Integration between Redux actions and middleware
- localStorage persistence end-to-end
- State restoration on page load
- Real user interactions triggering your actions

**These E2E tests** verify YOUR custom logic:
- Your middleware listens to the right actions
- Your state structure is saved/restored correctly
- Your focus management works
- Your cleanup logic runs properly

## Initial State and E2E Tests

When the app loads with empty localStorage, `INITIAL_STATE_CONFIG` may add initial windows (Counter, Notes, FormEditor). Tests that assume no windows should call `closeAllWindows(page)` from `~/tests/helpers` in their `beforeEach` or at the start of the test. This clears all windows so tests run in a predictable state.

## Maintenance Notes

- Tests use `page.mouse` API for precise control over drag operations
- Small variance (5px) is allowed in position/size comparisons to avoid flakiness
- Tests wait 300ms after drag/resize for layout updates to complete
- Tests use `.react-grid-item` and `.drag-handle` selectors (stable, library-provided classes)

---

**Status**: ✅ Production-ready E2E coverage for window interactions
