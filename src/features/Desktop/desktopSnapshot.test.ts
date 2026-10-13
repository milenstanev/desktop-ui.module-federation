import {
  DESKTOP_CONFIG_QUERY_PARAM,
  LOCAL_STORAGE_BOOTSTRAP_KEY,
  LOCAL_STORAGE_DESKTOP_KEY,
} from './config';
import {
  buildDesktopShareUrl,
  getBuiltInDesktopSnapshot,
  parseDesktopSnapshot,
  parseDesktopSnapshotJson,
  readDesktopConfigFromSearch,
  resolveInitialDesktopState,
  serializeDesktopSnapshot,
} from './desktopSnapshot';
import { COMPONENT_NAMES } from '~/shared/constants';

describe('parseDesktopSnapshot', () => {
  it('accepts a windows array and generates layouts', () => {
    const snapshot = parseDesktopSnapshot([
      {
        id: 'timer-1',
        name: COMPONENT_NAMES.TIMER,
        lazyLoadComponent: 'Timer',
      },
    ]);
    expect(snapshot).not.toBeNull();
    expect(snapshot?.windows).toHaveLength(1);
    expect(snapshot?.layouts.lg[0].i).toBe('timer-1');
  });

  it('rejects unknown components', () => {
    expect(
      parseDesktopSnapshot({
        windows: [
          {
            id: 'bad',
            name: 'Nope',
            lazyLoadComponent: 'NotAFeature',
          },
        ],
      })
    ).toBeNull();
  });

  it('round-trips built-in dashboard JSON', () => {
    const builtIn = getBuiltInDesktopSnapshot();
    expect(parseDesktopSnapshotJson(serializeDesktopSnapshot(builtIn))).toEqual(
      builtIn
    );
  });
});

describe('buildDesktopShareUrl', () => {
  it('encodes a compact snapshot as a desktopConfig query', () => {
    const snapshot = parseDesktopSnapshot([
      {
        id: 'timer-1',
        name: COMPONENT_NAMES.TIMER,
        lazyLoadComponent: 'Timer',
      },
    ]);
    const url = buildDesktopShareUrl(
      snapshot!,
      'https://desktop-ui-mf.vercel.app',
      '/'
    );
    expect(url.startsWith('https://desktop-ui-mf.vercel.app/?')).toBe(true);
    const parsed = new URL(url);
    expect(readDesktopConfigFromSearch(parsed.search)?.windows[0].id).toBe(
      'timer-1'
    );
    expect(parsed.searchParams.get(DESKTOP_CONFIG_QUERY_PARAM)).not.toBeNull();
  });
});

describe('readDesktopConfigFromSearch', () => {
  it('parses desktopConfig query JSON', () => {
    const snapshot = parseDesktopSnapshot([
      {
        id: 'notes-1',
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        lazyLoadReducerName: 'NotesReducer',
      },
    ]);
    const search = `?${DESKTOP_CONFIG_QUERY_PARAM}=${encodeURIComponent(
      JSON.stringify(snapshot)
    )}`;
    expect(readDesktopConfigFromSearch(search)?.windows[0].id).toBe('notes-1');
  });
});

describe('resolveInitialDesktopState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses bootstrap JSON when desktop storage is empty', () => {
    const snapshot = parseDesktopSnapshot([
      {
        id: 'bootstrap-timer',
        name: COMPONENT_NAMES.TIMER,
        lazyLoadComponent: 'Timer',
      },
    ]);
    localStorage.setItem(
      LOCAL_STORAGE_BOOTSTRAP_KEY,
      serializeDesktopSnapshot(snapshot!)
    );
    const resolved = resolveInitialDesktopState(localStorage, '');
    expect(resolved.desktopWindows[0].id).toBe('bootstrap-timer');
    expect(resolved.focusedWindowId).toBe('bootstrap-timer');
  });

  it('prefers desktopConfig query over persisted windows', () => {
    localStorage.setItem(
      LOCAL_STORAGE_DESKTOP_KEY,
      JSON.stringify([
        {
          id: 'stored',
          name: COMPONENT_NAMES.COUNTER,
          lazyLoadComponent: 'Counter',
        },
      ])
    );
    const snapshot = parseDesktopSnapshot([
      {
        id: 'query-analytics-1',
        name: COMPONENT_NAMES.ANALYTICS,
        remoteFeatureName: 'analytics',
        lazyLoadReducerName: 'analytics',
      },
      {
        id: 'query-analytics-2',
        name: COMPONENT_NAMES.ANALYTICS,
        remoteFeatureName: 'analytics',
        lazyLoadReducerName: 'analytics',
      },
      {
        id: 'query-forms-1',
        name: COMPONENT_NAMES.FORMS,
        remoteFeatureName: 'schemaUi',
      },
      {
        id: 'query-forms-2',
        name: COMPONENT_NAMES.FORMS,
        remoteFeatureName: 'schemaUi',
      },
    ]);
    const search = `?${DESKTOP_CONFIG_QUERY_PARAM}=${encodeURIComponent(
      JSON.stringify(snapshot)
    )}`;
    const resolved = resolveInitialDesktopState(localStorage, search);
    expect(resolved.desktopWindows.map((window) => window.id)).toEqual([
      'query-analytics-1',
      'query-analytics-2',
      'query-forms-1',
      'query-forms-2',
    ]);
  });

  it('prefers persisted windows over bootstrap', () => {
    localStorage.setItem(
      LOCAL_STORAGE_DESKTOP_KEY,
      JSON.stringify([
        {
          id: 'stored',
          name: COMPONENT_NAMES.COUNTER,
          lazyLoadComponent: 'Counter',
        },
      ])
    );
    localStorage.setItem(
      LOCAL_STORAGE_BOOTSTRAP_KEY,
      serializeDesktopSnapshot(
        parseDesktopSnapshot([
          {
            id: 'bootstrap-timer',
            name: COMPONENT_NAMES.TIMER,
            lazyLoadComponent: 'Timer',
          },
        ])!
      )
    );
    const resolved = resolveInitialDesktopState(localStorage, '');
    expect(resolved.desktopWindows[0].id).toBe('stored');
    expect(resolved.focusedWindowId).toBeNull();
  });

  it('built-in dashboard includes a Forms (schemaUi) window', () => {
    const names = getBuiltInDesktopSnapshot().windows.map(
      (window) => window.remoteFeatureName
    );
    expect(names).toContain('schemaUi');
  });

  it('keeps Forms and JSPM App from the production share URL', () => {
    const snapshot = {
      windows: [
        {
          id: 'be309ad0-0be7-46d5-a02a-359f8875d3c5',
          name: 'JSPM App',
          lazyLoadComponent: 'JspmApp',
          preferredSize: { h: 8 },
        },
        {
          id: 'forms-1',
          name: 'Forms',
          remoteFeatureName: 'schemaUi',
          preferredSize: { h: 8 },
        },
      ],
      layouts: {
        xl: [
          { i: 'forms-1', x: 8, y: 0, w: 4, h: 8 },
          {
            i: 'be309ad0-0be7-46d5-a02a-359f8875d3c5',
            x: 4,
            y: 0,
            w: 4,
            h: 8,
          },
        ],
        lg: [
          { i: 'forms-1', x: 8, y: 0, w: 4, h: 8 },
          {
            i: 'be309ad0-0be7-46d5-a02a-359f8875d3c5',
            x: 4,
            y: 0,
            w: 4,
            h: 8,
          },
        ],
        md: [
          { i: 'forms-1', x: 0, y: 8, w: 4, h: 8 },
          {
            i: 'be309ad0-0be7-46d5-a02a-359f8875d3c5',
            x: 4,
            y: 0,
            w: 4,
            h: 8,
          },
        ],
        sm: [
          { i: 'forms-1', x: 0, y: 16, w: 2, h: 8 },
          {
            i: 'be309ad0-0be7-46d5-a02a-359f8875d3c5',
            x: 0,
            y: 4,
            w: 2,
            h: 8,
          },
        ],
      },
    };
    const search = `?${DESKTOP_CONFIG_QUERY_PARAM}=${encodeURIComponent(
      JSON.stringify(snapshot)
    )}`;
    localStorage.setItem(
      LOCAL_STORAGE_DESKTOP_KEY,
      JSON.stringify([
        {
          id: 'stored',
          name: COMPONENT_NAMES.COUNTER,
          lazyLoadComponent: 'Counter',
        },
      ])
    );
    const resolved = resolveInitialDesktopState(localStorage, search);
    expect(resolved.desktopWindows.map((window) => window.id)).toEqual([
      'be309ad0-0be7-46d5-a02a-359f8875d3c5',
      'forms-1',
    ]);
    expect(resolved.layouts.lg.map((item) => item.i)).toEqual([
      'forms-1',
      'be309ad0-0be7-46d5-a02a-359f8875d3c5',
    ]);
  });
});
