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
});
