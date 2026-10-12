import {
  DESKTOP_CONFIG_QUERY_PARAM,
  LOCAL_STORAGE_BOOTSTRAP_KEY,
  LOCAL_STORAGE_DESKTOP_KEY,
} from './config';
import {
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
