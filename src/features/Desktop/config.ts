import { WindowLayout } from './types';
import type { DesktopUIWindow } from './types';
import {
  COMPONENT_NAMES,
  LAYOUT_CONFIG,
  REDUCER_NAMES,
  REMOTE_FEATURE_NAMES,
} from '~/shared/constants';
import type { Layouts } from 'react-grid-layout';

export const LOCAL_STORAGE_DESKTOP_KEY = 'desktopUI.desktop';
export const LOCAL_STORAGE_LAYOUT_KEY = 'desktopUI.layouts';
export const LOCAL_STORAGE_THEME_KEY = 'desktopUI.theme';
export const LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY = 'desktopUI.schemaUi.overlay';
export const LOCAL_STORAGE_BOOTSTRAP_KEY = 'desktopUI.bootstrap';
export const DESKTOP_CONFIG_QUERY_PARAM = 'desktopConfig';

const layoutItem = (
  i: string,
  x: number,
  y: number,
  w: number,
  h: number
): { i: string; x: number; y: number; w: number; h: number } => ({
  i,
  x,
  y,
  w,
  h,
});

const INIT_IDS = {
  ANALYTICS: 'init-analytics',
  COUNTER: 'init-counter',
  TIMER: 'init-timer',
  FORMS: 'init-forms',
  NOTES: 'init-notes',
  FORM: 'init-form',
} as const;

/**
 * Initial state config – used when localStorage is empty (first visit)
 * and no bootstrap JSON has been saved from the configurator.
 *
 * lg/xl mosaic (12 cols):
 *   [ Analytics 6x4 | Counter 3x4 | Timer 3x4 ]
 *   [ Forms     6x8 | Notes   6x4             ]
 *   [               | Form Editor 6x4         ]
 */
export const INITIAL_STATE_CONFIG = {
  defaultTheme: 'gradient' as const,
  initialWindows: [
    {
      id: INIT_IDS.ANALYTICS,
      name: COMPONENT_NAMES.ANALYTICS,
      remoteFeatureName: REMOTE_FEATURE_NAMES.ANALYTICS,
      layout: undefined,
      lazyLoadReducerName: REDUCER_NAMES.ANALYTICS,
    },
    {
      id: INIT_IDS.COUNTER,
      name: COMPONENT_NAMES.COUNTER,
      lazyLoadComponent: 'Counter' as const,
      layout: undefined,
      lazyLoadReducerName: REDUCER_NAMES.COUNTER,
    },
    {
      id: INIT_IDS.TIMER,
      name: COMPONENT_NAMES.TIMER,
      lazyLoadComponent: 'Timer' as const,
      layout: undefined,
    },
    {
      id: INIT_IDS.FORMS,
      name: COMPONENT_NAMES.FORMS,
      remoteFeatureName: REMOTE_FEATURE_NAMES.SCHEMA_UI,
      layout: undefined,
      preferredSize: { h: LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT },
    },
    {
      id: INIT_IDS.NOTES,
      name: COMPONENT_NAMES.NOTES,
      lazyLoadComponent: 'Notes' as const,
      layout: undefined,
      lazyLoadReducerName: REDUCER_NAMES.NOTES,
    },
    {
      id: INIT_IDS.FORM,
      name: COMPONENT_NAMES.FORM_EDITOR,
      lazyLoadComponent: 'FormEditor' as const,
      layout: undefined,
    },
  ] as DesktopUIWindow[],
  initialLayouts: {
    xl: [
      layoutItem(INIT_IDS.ANALYTICS, 0, 0, 6, 4),
      layoutItem(INIT_IDS.COUNTER, 6, 0, 3, 4),
      layoutItem(INIT_IDS.TIMER, 9, 0, 3, 4),
      layoutItem(INIT_IDS.FORMS, 0, 4, 6, 8),
      layoutItem(INIT_IDS.NOTES, 6, 4, 6, 4),
      layoutItem(INIT_IDS.FORM, 6, 8, 6, 4),
    ],
    lg: [
      layoutItem(INIT_IDS.ANALYTICS, 0, 0, 6, 4),
      layoutItem(INIT_IDS.COUNTER, 6, 0, 3, 4),
      layoutItem(INIT_IDS.TIMER, 9, 0, 3, 4),
      layoutItem(INIT_IDS.FORMS, 0, 4, 6, 8),
      layoutItem(INIT_IDS.NOTES, 6, 4, 6, 4),
      layoutItem(INIT_IDS.FORM, 6, 8, 6, 4),
    ],
    md: [
      layoutItem(INIT_IDS.ANALYTICS, 0, 0, 8, 4),
      layoutItem(INIT_IDS.FORMS, 0, 4, 8, 6),
      layoutItem(INIT_IDS.COUNTER, 0, 10, 4, 4),
      layoutItem(INIT_IDS.TIMER, 4, 10, 4, 4),
      layoutItem(INIT_IDS.NOTES, 0, 14, 4, 4),
      layoutItem(INIT_IDS.FORM, 4, 14, 4, 4),
    ],
    sm: [
      layoutItem(INIT_IDS.ANALYTICS, 0, 0, 2, 4),
      layoutItem(INIT_IDS.COUNTER, 0, 4, 2, 4),
      layoutItem(INIT_IDS.TIMER, 0, 8, 2, 4),
      layoutItem(INIT_IDS.FORMS, 0, 12, 2, 6),
      layoutItem(INIT_IDS.NOTES, 0, 18, 2, 4),
      layoutItem(INIT_IDS.FORM, 0, 22, 2, 4),
    ],
  } as Layouts,
};

export const defaultWindowsPositions: WindowLayout = {
  xl: { i: '', x: 0, y: 0, w: 4, h: 4 },
  lg: { i: '', x: 0, y: 0, w: 4, h: 4 },
  md: { i: '', x: 0, y: 0, w: 4, h: 4 },
  sm: { i: '', x: 0, y: 0, w: 2, h: 4 },
};
