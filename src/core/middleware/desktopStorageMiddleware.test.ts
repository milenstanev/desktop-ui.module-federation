import { configureStore } from '@reduxjs/toolkit';
import { desktopStorageMiddleware } from './desktopStorageMiddleware';
import DesktopSlice, {
  addWindow,
  removeWindow,
  updateLayouts,
  resetLayouts,
  removeAllWindows,
  organizeGrid,
  applyDesktopConfig,
} from '~/features/Desktop/DesktopSlice';
import {
  LOCAL_STORAGE_DESKTOP_KEY,
  LOCAL_STORAGE_LAYOUT_KEY,
} from '~/features/Desktop/config';
import { COMPONENT_NAMES } from '~/shared/constants';

jest.mock('~/features/Desktop/config', () => {
  const actual = jest.requireActual('~/features/Desktop/config');
  return {
    ...actual,
    INITIAL_STATE_CONFIG: {
      ...actual.INITIAL_STATE_CONFIG,
      initialWindows: [],
      initialLayouts: { xl: [], lg: [], md: [], sm: [] },
    },
  };
});

describe('desktopStorageMiddleware', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    localStorage.clear();
    store = configureStore({
      reducer: {
        Desktop: DesktopSlice,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(desktopStorageMiddleware),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists windows and layouts when addWindow is dispatched', () => {
    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    const savedWindows = localStorage.getItem(LOCAL_STORAGE_DESKTOP_KEY);
    const savedLayouts = localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY);

    expect(savedWindows).toBeTruthy();
    expect(savedLayouts).toBeTruthy();

    const windows = JSON.parse(savedWindows!);
    expect(windows).toHaveLength(1);
    expect(windows[0].id).toBe('test-1');
  });

  it('persists when removeWindow is dispatched', () => {
    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    store.dispatch(removeWindow('test-1'));

    const savedWindows = localStorage.getItem(LOCAL_STORAGE_DESKTOP_KEY);
    const windows = JSON.parse(savedWindows!);
    expect(windows).toHaveLength(0);
  });

  it('persists when updateLayouts is dispatched', () => {
    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    const newLayout = [{ i: 'test-1', x: 5, y: 5, w: 4, h: 4 }];
    store.dispatch(
      updateLayouts({
        layout: newLayout,
        breakpoint: 'lg',
      })
    );

    const savedLayouts = localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY);
    const layouts = JSON.parse(savedLayouts!);
    expect(layouts.lg[0].x).toBe(5);
    expect(layouts.lg[0].y).toBe(5);
  });

  it('persists when resetLayouts is dispatched', () => {
    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'test-2',
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        layout: undefined,
      })
    );

    // Change layouts
    store.dispatch(
      updateLayouts({
        layout: [
          { i: 'test-1', x: 5, y: 5, w: 2, h: 2 },
          { i: 'test-2', x: 7, y: 7, w: 2, h: 2 },
        ],
        breakpoint: 'lg',
      })
    );

    // Reset layouts
    store.dispatch(resetLayouts());

    const savedLayouts = localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY);
    const layouts = JSON.parse(savedLayouts!);

    // Verify layouts were reset and persisted
    expect(layouts.lg).toHaveLength(2);
    expect(layouts.lg[0].w).toBe(4); // Reset size (3 per row, 4 cols each)
    expect(layouts.lg[0].h).toBe(4);
  });

  it('persists when organizeGrid is dispatched', () => {
    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'test-2',
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        layout: undefined,
      })
    );

    // Organize grid
    store.dispatch(organizeGrid());

    const savedLayouts = localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY);
    const layouts = JSON.parse(savedLayouts!);

    // Verify organized layout was persisted
    expect(layouts.lg).toHaveLength(2);
    expect(layouts.lg[0].w).toBe(3); // Organized size
    expect(layouts.lg[0].h).toBe(3);
    expect(layouts.lg[0].x).toBe(0); // First position
    expect(layouts.lg[1].x).toBe(3); // Second position
  });

  it('persists when applyDesktopConfig is dispatched', () => {
    store.dispatch(
      applyDesktopConfig({
        windows: [
          {
            id: 'from-json',
            name: COMPONENT_NAMES.TIMER,
            lazyLoadComponent: 'Timer',
            layout: undefined,
          },
        ],
        layouts: {
          xl: [{ i: 'from-json', x: 0, y: 0, w: 4, h: 4 }],
          lg: [{ i: 'from-json', x: 0, y: 0, w: 4, h: 4 }],
          md: [{ i: 'from-json', x: 0, y: 0, w: 4, h: 4 }],
          sm: [{ i: 'from-json', x: 0, y: 0, w: 2, h: 4 }],
        },
      })
    );
    const savedWindows = localStorage.getItem(LOCAL_STORAGE_DESKTOP_KEY);
    expect(savedWindows).toContain('from-json');
  });

  it('removes Desktop keys from localStorage when removeAllWindows is dispatched', () => {
    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'test-2',
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        layout: undefined,
      })
    );

    expect(localStorage.getItem(LOCAL_STORAGE_DESKTOP_KEY)).toBeTruthy();
    expect(localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY)).toBeTruthy();

    store.dispatch(removeAllWindows());

    expect(localStorage.getItem(LOCAL_STORAGE_DESKTOP_KEY)).toBeNull();
    expect(localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY)).toBeNull();
  });

  it('handles localStorage errors gracefully', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage full');
      });

    store.dispatch(
      addWindow({
        id: 'test-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
      })
    );

    expect(consoleWarnSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
