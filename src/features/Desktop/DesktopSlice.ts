import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Layouts, Layout } from 'react-grid-layout';
import { DesktopUIWindow, LayoutBreakpoint } from './types';
import { defaultWindowsPositions } from './config';
import {
  resolveInitialDesktopState,
  type DesktopSnapshot,
} from './desktopSnapshot';

/**
 * Desktop Slice
 *
 * Manages the state for the desktop grid, including windows, layouts, and focus.
 *
 * IMPORTANT: Persistence to localStorage
 * ========================================
 * Any action that modifies `desktopWindows` or `layouts` MUST be registered
 * in `src/core/middleware/desktopStorageMiddleware.ts` to ensure the state is
 * persisted to localStorage.
 *
 * When adding a new action:
 * 1. Add the action to this slice
 * 2. Import the action in desktopStorageMiddleware.ts
 * 3. Add `yourAction.match(action) ||` to the middleware's if condition
 *
 * Example:
 *   import { yourAction } from '~/features/Desktop/DesktopSlice';
 *
 *   if (
 *     removeWindow.match(action) ||
 *     yourAction.match(action) ||  // ← Add your action here
 *     // ... other actions
 *   ) {
 *     // Persist to localStorage
 *   }
 */

interface State {
  desktopWindows: DesktopUIWindow[];
  layouts: Layouts;
  focusedWindowId: string | null;
}

const defaultLayouts: Layouts = { xl: [], lg: [], md: [], sm: [] };

function layoutItem(
  id: string,
  x: number,
  y: number,
  defaults: Layout,
  preferredSize: DesktopUIWindow['preferredSize'],
  lockWidth = false
): Layout {
  return {
    ...defaults,
    i: id,
    x,
    y,
    w: lockWidth ? defaults.w : (preferredSize?.w ?? defaults.w),
    h: preferredSize?.h ?? defaults.h,
  };
}

const resolvedInitial = resolveInitialDesktopState();
const initialState: State = {
  desktopWindows: resolvedInitial.desktopWindows,
  layouts: resolvedInitial.layouts,
  focusedWindowId: resolvedInitial.focusedWindowId,
};

export const DesktopSlice = createSlice({
  name: 'Desktop',
  initialState,
  reducers: {
    removeWindow: (state, action: PayloadAction<string>) => {
      const index = state.desktopWindows.findIndex(
        (window) => window.id === action.payload
      );
      if (index !== -1) {
        if (state.focusedWindowId === action.payload) {
          state.focusedWindowId = null;
        }
        state.desktopWindows.splice(index, 1);

        const breakpoints: LayoutBreakpoint[] = ['xl', 'lg', 'md', 'sm'];
        breakpoints.forEach((breakpoint) => {
          state.layouts[breakpoint] = state.layouts[breakpoint].filter(
            (layout) => layout.i !== action.payload
          );
        });
      }
    },
    addWindow: (state, action: PayloadAction<DesktopUIWindow>) => {
      if (
        !state.desktopWindows.find((window) => window.id === action.payload.id)
      ) {
        state.desktopWindows.unshift(action.payload);
        state.focusedWindowId = action.payload.id;

        // Calculate position based on existing windows
        const windowCount = state.layouts.lg.length;

        // Extra Large (>1920px): 3 windows per row (4 cols each)
        const xlCol = (windowCount % 3) * 4;
        const xlRow = Math.floor(windowCount / 3) * 4;

        // Large: 3 windows per row (4 cols each)
        const lgCol = (windowCount % 3) * 4;
        const lgRow = Math.floor(windowCount / 3) * 4;

        // Medium: 2 windows per row (4 cols each)
        const mdCol = (windowCount % 2) * 4;
        const mdRow = Math.floor(windowCount / 2) * 4;

        const preferredSize = action.payload.preferredSize;
        const xl: Layout =
          action.payload.layout?.xl ??
          layoutItem(
            action.payload.id,
            xlCol,
            xlRow,
            defaultWindowsPositions.xl,
            preferredSize
          );
        const lg: Layout =
          action.payload.layout?.lg ??
          layoutItem(
            action.payload.id,
            lgCol,
            lgRow,
            defaultWindowsPositions.lg,
            preferredSize
          );
        const md: Layout =
          action.payload.layout?.md ??
          layoutItem(
            action.payload.id,
            mdCol,
            mdRow,
            defaultWindowsPositions.md,
            preferredSize
          );
        const sm: Layout =
          action.payload.layout?.sm ??
          layoutItem(
            action.payload.id,
            0,
            windowCount * 4,
            defaultWindowsPositions.sm,
            preferredSize,
            true
          );

        state.layouts.xl.push(xl);
        state.layouts.lg.push(lg);
        state.layouts.md.push(md);
        state.layouts.sm.push(sm);
      }
    },
    updateLayouts: (
      state,
      action: PayloadAction<{ layout: Layout[]; breakpoint: LayoutBreakpoint }>
    ) => {
      state.layouts = {
        ...state.layouts,
        [action.payload.breakpoint]: action.payload.layout,
      };
    },
    setFocus: (state, action: PayloadAction<string | null>) => {
      state.focusedWindowId = action.payload;
    },
    resetLayouts: (state) => {
      // Recreate layouts for all existing windows
      const newLayouts: Layouts = { xl: [], lg: [], md: [], sm: [] };

      state.desktopWindows.forEach((window, index) => {
        // Extra Large screens (>1920px): 3 per row, 4 cols each
        newLayouts.xl.push({
          i: window.id,
          x: (index % 3) * 4,
          y: Math.floor(index / 3) * 4,
          w: 4,
          h: 4,
        });

        // Large screens: 3 per row, 4 cols each (consistent with addWindow)
        newLayouts.lg.push({
          i: window.id,
          x: (index % 3) * 4,
          y: Math.floor(index / 3) * 4,
          w: 4,
          h: 4,
        });

        // Medium screens: 2 per row, 4 cols wide, 4 rows tall
        newLayouts.md.push({
          i: window.id,
          x: (index % 2) * 4,
          y: Math.floor(index / 2) * 4,
          w: 4,
          h: 4,
        });

        // Small screens: full width, stacked vertically
        newLayouts.sm.push({
          i: window.id,
          x: 0,
          y: index * 3,
          w: 2,
          h: 3,
        });
      });

      state.layouts = newLayouts;
    },
    removeAllWindows: (state) => {
      state.desktopWindows = [];
      state.layouts = defaultLayouts;
      state.focusedWindowId = null;
    },
    applyDesktopConfig: (state, action: PayloadAction<DesktopSnapshot>) => {
      state.desktopWindows = action.payload.windows;
      state.layouts = {
        xl: [...(action.payload.layouts.xl ?? [])],
        lg: [...(action.payload.layouts.lg ?? [])],
        md: [...(action.payload.layouts.md ?? [])],
        sm: [...(action.payload.layouts.sm ?? [])],
      };
      state.focusedWindowId = action.payload.windows[0]?.id ?? null;
    },
    organizeGrid: (state) => {
      // Organize all windows in an equal-sized grid
      const newLayouts: Layouts = { xl: [], lg: [], md: [], sm: [] };

      state.desktopWindows.forEach((window, index) => {
        // Extra Large screens (>1920px): 3 columns per row (4 cols each), 3 rows tall
        const xlCols = 3;
        const xlWidth = 4;
        const xlHeight = 3;
        const xlCol = (index % xlCols) * xlWidth;
        const xlRow = Math.floor(index / xlCols) * xlHeight;

        newLayouts.xl.push({
          i: window.id,
          x: xlCol,
          y: xlRow,
          w: xlWidth,
          h: xlHeight,
        });

        // Large screens: 4 columns per row (3 cols each), 3 rows tall
        const lgCols = 4;
        const lgWidth = 3;
        const lgHeight = 3;
        const lgCol = (index % lgCols) * lgWidth;
        const lgRow = Math.floor(index / lgCols) * lgHeight;

        newLayouts.lg.push({
          i: window.id,
          x: lgCol,
          y: lgRow,
          w: lgWidth,
          h: lgHeight,
        });

        // Medium screens: 2 columns per row (4 cols each), 3 rows tall
        const mdCols = 2;
        const mdWidth = 4;
        const mdHeight = 3;
        const mdCol = (index % mdCols) * mdWidth;
        const mdRow = Math.floor(index / mdCols) * mdHeight;

        newLayouts.md.push({
          i: window.id,
          x: mdCol,
          y: mdRow,
          w: mdWidth,
          h: mdHeight,
        });

        // Small screens: 1 column, stacked vertically
        newLayouts.sm.push({
          i: window.id,
          x: 0,
          y: index * 3,
          w: 2,
          h: 3,
        });
      });

      state.layouts = newLayouts;
    },
  },
});

export const {
  removeWindow,
  addWindow,
  updateLayouts,
  setFocus,
  resetLayouts,
  removeAllWindows,
  organizeGrid,
  applyDesktopConfig,
} = DesktopSlice.actions;

/**
 * REMINDER: When adding new actions that modify `desktopWindows` or `layouts`,
 * you MUST register them in `src/middleware/desktopStorageMiddleware.ts`
 * to ensure persistence to localStorage.
 *
 * See docs/MIDDLEWARE_PERSISTENCE.md for details.
 */

export default DesktopSlice.reducer;
