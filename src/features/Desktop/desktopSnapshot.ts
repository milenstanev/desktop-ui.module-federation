import type { Layout, Layouts } from 'react-grid-layout';
import {
  componentLoader,
  type ComponentNames,
} from '~/core/utils/componentLoader';
import { REMOTE_FEATURE_NAMES } from '~/shared/constants';
import { safeParseJson } from '~/shared/utils/storage';
import {
  DESKTOP_CONFIG_QUERY_PARAM,
  INITIAL_STATE_CONFIG,
  LOCAL_STORAGE_BOOTSTRAP_KEY,
  LOCAL_STORAGE_DESKTOP_KEY,
  LOCAL_STORAGE_LAYOUT_KEY,
} from './config';
import type { DesktopUIWindow } from './types';

export interface DesktopSnapshot {
  windows: DesktopUIWindow[];
  layouts: Layouts;
}

const EMPTY_LAYOUTS: Layouts = { xl: [], lg: [], md: [], sm: [] };
const KNOWN_COMPONENTS = new Set(Object.keys(componentLoader));
const KNOWN_REMOTES = new Set<string>(Object.values(REMOTE_FEATURE_NAMES));

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isLayoutItem(value: unknown): value is Layout {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.i === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.w === 'number' &&
    typeof value.h === 'number'
  );
}

function parseLayoutList(value: unknown): Layout[] | null {
  if (!Array.isArray(value) || !value.every(isLayoutItem)) {
    return null;
  }
  return value.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));
}

function parsePreferredSize(
  value: unknown
): DesktopUIWindow['preferredSize'] | undefined {
  if (value == null) {
    return undefined;
  }
  if (!isRecord(value)) {
    return undefined;
  }
  const size: { w?: number; h?: number } = {};
  if (typeof value.w === 'number') {
    size.w = value.w;
  }
  if (typeof value.h === 'number') {
    size.h = value.h;
  }
  return size.w != null || size.h != null ? size : undefined;
}

function parseWindow(value: unknown): DesktopUIWindow | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id === '') {
    return null;
  }
  if (typeof value.name !== 'string' || value.name === '') {
    return null;
  }

  const lazyLoadComponent =
    typeof value.lazyLoadComponent === 'string'
      ? value.lazyLoadComponent
      : undefined;
  if (lazyLoadComponent && !KNOWN_COMPONENTS.has(lazyLoadComponent)) {
    return null;
  }

  const remoteFeatureName =
    typeof value.remoteFeatureName === 'string'
      ? value.remoteFeatureName
      : undefined;
  if (remoteFeatureName && !KNOWN_REMOTES.has(remoteFeatureName)) {
    return null;
  }

  if (!lazyLoadComponent && !remoteFeatureName) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    lazyLoadComponent: lazyLoadComponent as ComponentNames | undefined,
    remoteFeatureName,
    layout: undefined,
    lazyLoadReducerName:
      typeof value.lazyLoadReducerName === 'string'
        ? value.lazyLoadReducerName
        : undefined,
    preferredSize: parsePreferredSize(value.preferredSize),
  };
}

function generateLayouts(windows: DesktopUIWindow[]): Layouts {
  const layouts: Layouts = { xl: [], lg: [], md: [], sm: [] };

  windows.forEach((window, index) => {
    const h = window.preferredSize?.h ?? 4;
    const wLg = window.preferredSize?.w ?? 4;
    layouts.xl.push({
      i: window.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * h,
      w: wLg,
      h,
    });
    layouts.lg.push({
      i: window.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * h,
      w: wLg,
      h,
    });
    layouts.md.push({
      i: window.id,
      x: (index % 2) * 4,
      y: Math.floor(index / 2) * h,
      w: Math.min(wLg, 4),
      h,
    });
    layouts.sm.push({
      i: window.id,
      x: 0,
      y: index * h,
      w: 2,
      h,
    });
  });

  return layouts;
}

function parseLayouts(value: unknown, windowIds: Set<string>): Layouts | null {
  if (!isRecord(value)) {
    return null;
  }
  const xl = parseLayoutList(value.xl);
  const lg = parseLayoutList(value.lg);
  const md = parseLayoutList(value.md);
  const sm = parseLayoutList(value.sm);
  if (!xl || !lg || !md || !sm) {
    return null;
  }

  const filterKnown = (items: Layout[]): Layout[] =>
    items.filter((item) => windowIds.has(item.i));

  return {
    xl: filterKnown(xl),
    lg: filterKnown(lg),
    md: filterKnown(md),
    sm: filterKnown(sm),
  };
}

function cloneLayouts(layouts: Layouts): Layouts {
  return {
    xl: [...(layouts.xl ?? [])],
    lg: [...(layouts.lg ?? [])],
    md: [...(layouts.md ?? [])],
    sm: [...(layouts.sm ?? [])],
  };
}

export function getBuiltInDesktopSnapshot(): DesktopSnapshot {
  return {
    windows: INITIAL_STATE_CONFIG.initialWindows.map((window) => ({
      ...window,
    })),
    layouts: cloneLayouts(INITIAL_STATE_CONFIG.initialLayouts),
  };
}

export function parseDesktopSnapshot(value: unknown): DesktopSnapshot | null {
  if (Array.isArray(value)) {
    const windows = value.map(parseWindow);
    if (windows.some((window) => window == null)) {
      return null;
    }
    const validWindows = windows as DesktopUIWindow[];
    const ids = validWindows.map((window) => window.id);
    if (new Set(ids).size !== ids.length) {
      return null;
    }
    return { windows: validWindows, layouts: generateLayouts(validWindows) };
  }

  if (!isRecord(value)) {
    return null;
  }

  const rawWindows = value.windows ?? value.desktopWindows;
  if (!Array.isArray(rawWindows)) {
    return null;
  }
  const windows = rawWindows.map(parseWindow);
  if (windows.some((window) => window == null)) {
    return null;
  }
  const validWindows = windows as DesktopUIWindow[];
  const ids = validWindows.map((window) => window.id);
  if (ids.length === 0 || new Set(ids).size !== ids.length) {
    return null;
  }

  const windowIds = new Set(ids);
  const layouts = parseLayouts(value.layouts, windowIds);
  if (!layouts) {
    return { windows: validWindows, layouts: generateLayouts(validWindows) };
  }

  const hasAllIds = (items: Layout[]): boolean =>
    validWindows.every((window) => items.some((item) => item.i === window.id));
  if (
    !hasAllIds(layouts.lg) ||
    !hasAllIds(layouts.md) ||
    !hasAllIds(layouts.sm)
  ) {
    return { windows: validWindows, layouts: generateLayouts(validWindows) };
  }

  return { windows: validWindows, layouts };
}

export function parseDesktopSnapshotJson(raw: string): DesktopSnapshot | null {
  try {
    return parseDesktopSnapshot(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function serializeDesktopSnapshot(snapshot: DesktopSnapshot): string {
  return JSON.stringify(
    { windows: snapshot.windows, layouts: snapshot.layouts },
    null,
    2
  );
}

export function readDesktopConfigFromSearch(
  search: string
): DesktopSnapshot | null {
  const params = new URLSearchParams(search);
  const raw = params.get(DESKTOP_CONFIG_QUERY_PARAM);
  if (!raw) {
    return null;
  }
  try {
    return parseDesktopSnapshot(JSON.parse(raw) as unknown);
  } catch {
    return parseDesktopSnapshotJson(raw);
  }
}

export function saveBootstrapSnapshot(snapshot: DesktopSnapshot | null): void {
  try {
    if (snapshot == null) {
      localStorage.removeItem(LOCAL_STORAGE_BOOTSTRAP_KEY);
      return;
    }
    localStorage.setItem(
      LOCAL_STORAGE_BOOTSTRAP_KEY,
      serializeDesktopSnapshot(snapshot)
    );
  } catch {
    // localStorage may be unavailable
  }
}

function isDesktopUIWindowArray(value: unknown): value is DesktopUIWindow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as DesktopUIWindow).id === 'string' &&
        typeof (item as DesktopUIWindow).name === 'string'
    )
  );
}

function isLayouts(value: unknown): value is Layouts {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.lg) && Array.isArray(obj.md) && Array.isArray(obj.sm)
  );
}

export function resolveInitialDesktopState(
  storage: Pick<Storage, 'getItem'> = localStorage,
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): {
  desktopWindows: DesktopUIWindow[];
  layouts: Layouts;
  focusedWindowId: string | null;
} {
  const fromQuery = readDesktopConfigFromSearch(search);
  if (fromQuery) {
    return {
      desktopWindows: fromQuery.windows,
      layouts: fromQuery.layouts,
      focusedWindowId: fromQuery.windows[0]?.id ?? null,
    };
  }

  const storedWindows = safeParseJson<DesktopUIWindow[]>(
    LOCAL_STORAGE_DESKTOP_KEY,
    [],
    isDesktopUIWindowArray
  );

  if (storedWindows.length > 0) {
    const rawLayouts = safeParseJson<Layouts>(
      LOCAL_STORAGE_LAYOUT_KEY,
      EMPTY_LAYOUTS,
      isLayouts
    );
    return {
      desktopWindows: storedWindows,
      layouts: {
        xl: rawLayouts.xl ?? [],
        lg: rawLayouts.lg ?? [],
        md: rawLayouts.md ?? [],
        sm: rawLayouts.sm ?? [],
      },
      focusedWindowId: null,
    };
  }

  try {
    const bootstrapRaw = storage.getItem(LOCAL_STORAGE_BOOTSTRAP_KEY);
    if (bootstrapRaw) {
      const bootstrap = parseDesktopSnapshotJson(bootstrapRaw);
      if (bootstrap) {
        return {
          desktopWindows: bootstrap.windows,
          layouts: bootstrap.layouts,
          focusedWindowId: bootstrap.windows[0]?.id ?? null,
        };
      }
    }
  } catch {
    // ignore
  }

  const builtIn = getBuiltInDesktopSnapshot();
  return {
    desktopWindows: builtIn.windows,
    layouts: builtIn.layouts,
    focusedWindowId: builtIn.windows[0]?.id ?? null,
  };
}
