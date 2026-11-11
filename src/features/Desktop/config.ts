import { WindowLayout } from './types';
import type { DesktopUIWindow } from './types';
import {
  COMPONENT_NAMES,
  LAYOUT_CONFIG,
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
  JSPM: '865a9caf-fb19-4651-839d-2a845036d232',
  FORMS: 'b78faa45-303d-4e64-8ac7-9e46590ab282',
} as const;

/**
 * Initial state config – used when localStorage is empty (first visit)
 * and no bootstrap JSON has been saved from the configurator.
 *
 * 12-column xl/lg: JSPM App on the left, Forms on the right.
 */
export const INITIAL_STATE_CONFIG = {
  defaultTheme: 'gradient' as const,
  initialWindows: [
    {
      id: INIT_IDS.JSPM,
      name: COMPONENT_NAMES.JSPM_APP,
      lazyLoadComponent: 'JspmApp' as const,
      layout: undefined,
      preferredSize: { h: LAYOUT_CONFIG.JSPM_APP_WINDOW_HEIGHT },
    },
    {
      id: INIT_IDS.FORMS,
      name: COMPONENT_NAMES.FORMS,
      remoteFeatureName: REMOTE_FEATURE_NAMES.SCHEMA_UI,
      layout: undefined,
      preferredSize: { h: LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT },
    },
  ] as DesktopUIWindow[],
  initialLayouts: {
    xl: [
      layoutItem(INIT_IDS.JSPM, 0, 0, 4, 7),
      layoutItem(INIT_IDS.FORMS, 4, 0, 8, 6),
    ],
    lg: [
      layoutItem(INIT_IDS.JSPM, 0, 0, 4, 6),
      layoutItem(INIT_IDS.FORMS, 4, 0, 8, 5),
    ],
    md: [
      layoutItem(INIT_IDS.JSPM, 0, 0, 4, 4),
      layoutItem(INIT_IDS.FORMS, 4, 0, 4, 4),
    ],
    sm: [
      layoutItem(INIT_IDS.JSPM, 0, 0, 2, 3),
      layoutItem(INIT_IDS.FORMS, 0, 3, 2, 3),
    ],
  } as Layouts,
};

export const defaultWindowsPositions: WindowLayout = {
  xl: { i: '', x: 0, y: 0, w: 4, h: 4 },
  lg: { i: '', x: 0, y: 0, w: 4, h: 4 },
  md: { i: '', x: 0, y: 0, w: 4, h: 4 },
  sm: { i: '', x: 0, y: 0, w: 2, h: 4 },
};
