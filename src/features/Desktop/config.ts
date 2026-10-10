import { WindowLayout } from './types';
import type { DesktopUIWindow } from './types';
import { COMPONENT_NAMES, REDUCER_NAMES } from '~/shared/constants';
import type { Layouts } from 'react-grid-layout';

export const LOCAL_STORAGE_DESKTOP_KEY = 'desktopUI.desktop';
export const LOCAL_STORAGE_LAYOUT_KEY = 'desktopUI.layouts';
export const LOCAL_STORAGE_THEME_KEY = 'desktopUI.theme';
export const LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY = 'desktopUI.schemaUi.overlay';

/**
 * Initial state config – used when localStorage is empty (first visit).
 */
export const INITIAL_STATE_CONFIG = {
  defaultTheme: 'gradient' as const,
  initialWindows: [
    {
      id: 'init-counter',
      name: COMPONENT_NAMES.COUNTER,
      lazyLoadComponent: 'Counter' as const,
      layout: undefined,
      lazyLoadReducerName: REDUCER_NAMES.COUNTER,
    },
    {
      id: 'init-notes',
      name: COMPONENT_NAMES.NOTES,
      lazyLoadComponent: 'Notes' as const,
      layout: undefined,
      lazyLoadReducerName: REDUCER_NAMES.NOTES,
    },
    {
      id: 'init-form',
      name: COMPONENT_NAMES.FORM_EDITOR,
      lazyLoadComponent: 'FormEditor' as const,
      layout: undefined,
    },
  ] as DesktopUIWindow[],
  initialLayouts: {
    xl: [
      { i: 'init-counter', x: 0, y: 0, w: 4, h: 4 },
      { i: 'init-notes', x: 4, y: 0, w: 4, h: 4 },
      { i: 'init-form', x: 8, y: 0, w: 4, h: 4 },
    ],
    lg: [
      { i: 'init-counter', x: 0, y: 0, w: 4, h: 4 },
      { i: 'init-notes', x: 4, y: 0, w: 4, h: 4 },
      { i: 'init-form', x: 8, y: 0, w: 4, h: 4 },
    ],
    md: [
      { i: 'init-counter', x: 0, y: 0, w: 4, h: 4 },
      { i: 'init-notes', x: 4, y: 0, w: 4, h: 4 },
      { i: 'init-form', x: 0, y: 4, w: 4, h: 4 },
    ],
    sm: [
      { i: 'init-counter', x: 0, y: 0, w: 2, h: 4 },
      { i: 'init-notes', x: 0, y: 4, w: 2, h: 4 },
      { i: 'init-form', x: 0, y: 8, w: 2, h: 4 },
    ],
  } as Layouts,
} as const;

// Default positions for new windows
// xl: 12 columns (>1920px), lg: 12 columns, md: 8 columns, sm: 2 columns
export const defaultWindowsPositions: WindowLayout = {
  xl: { i: '', x: 0, y: 0, w: 4, h: 4 }, // 1/3 width on extra large
  lg: { i: '', x: 0, y: 0, w: 4, h: 4 }, // 1/3 width, 4 rows tall
  md: { i: '', x: 0, y: 0, w: 4, h: 4 }, // Half width on medium
  sm: { i: '', x: 0, y: 0, w: 2, h: 4 }, // Full width on small
};

// Predefined positions for different window types (reserved for future use)
// export const windowPresets = {
//   small: {
//     xl: { w: 4, h: 3 }, // 1/3 width on XL
//     lg: { w: 4, h: 3 }, // 1/3 width
//     md: { w: 4, h: 3 }, // Half width
//     sm: { w: 2, h: 3 }, // Full width
//   },
//   medium: {
//     xl: { w: 6, h: 4 }, // Half width on XL
//     lg: { w: 6, h: 4 }, // Half width
//     md: { w: 4, h: 4 }, // Half width
//     sm: { w: 2, h: 4 }, // Full width
//   },
//   large: {
//     xl: { w: 8, h: 5 }, // 2/3 width on XL
//     lg: { w: 8, h: 5 }, // 2/3 width
//     md: { w: 6, h: 5 }, // 3/4 width
//     sm: { w: 2, h: 5 }, // Full width
//   },
//   full: {
//     xl: { w: 12, h: 6 }, // Full width on XL
//     lg: { w: 12, h: 6 }, // Full width
//     md: { w: 8, h: 6 }, // Full width
//     sm: { w: 2, h: 6 }, // Full width
//   },
// };
