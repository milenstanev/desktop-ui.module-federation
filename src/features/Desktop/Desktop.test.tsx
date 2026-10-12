import { render, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Desktop from './Desktop';
import DesktopSlice, { addWindow, removeAllWindows } from './DesktopSlice';
import { ThemeProvider } from '~/core/contexts/ThemeContext';
import { createReducerManager } from '~/core/utils/reducerManager';
import { COMPONENT_NAMES, REDUCER_NAMES } from '~/shared/constants';

jest.mock('./config', () => {
  const actual = jest.requireActual('./config');
  return {
    ...actual,
    INITIAL_STATE_CONFIG: {
      ...actual.INITIAL_STATE_CONFIG,
      initialWindows: [],
      initialLayouts: { xl: [], lg: [], md: [], sm: [] },
    },
  };
});

// Mock react-grid-layout
jest.mock('react-grid-layout', () => {
  const MockResponsive = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-layout">{children}</div>
  );
  return {
    Responsive: MockResponsive,
    WidthProvider: (component: React.ComponentType) => component,
  };
});

// Mock Window component
jest.mock('~/shared/components/Window/Window', () => ({
  __esModule: true,
  default: ({ name, onRemove }: { name: string; onRemove: () => void }) => (
    <div data-testid={`window-${name}`}>
      <span>{name}</span>
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));

// Mock Loader component
jest.mock('~/shared/components/Loader/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>,
}));

describe('Desktop Component - Reducer Cleanup', () => {
  const createTestStore = () => {
    const reducerManager = createReducerManager({
      Desktop: DesktopSlice,
    });

    const store = configureStore({
      reducer: reducerManager.reduce,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });

    // Attach reducer manager to store
    (store as any).reducerManager = reducerManager;

    return store;
  };

  const renderDesktop = (store: ReturnType<typeof createTestStore>) => {
    return render(
      <Provider store={store}>
        <ThemeProvider>
          <Desktop />
        </ThemeProvider>
      </Provider>
    );
  };

  it('cleans up all lazy-loaded reducers when removeAllWindows is dispatched', async () => {
    const store = createTestStore();
    const reducerManager = (store as any).reducerManager;

    // Add a window with a lazy-loaded reducer
    store.dispatch(
      addWindow({
        id: 'counter-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    // Manually inject the reducer (simulating lazy load)
    const mockReducer = (state = { value: 0 }) => state;
    reducerManager.add(REDUCER_NAMES.COUNTER, mockReducer);

    // Verify reducer was added
    expect(reducerManager.getReducerMap()[REDUCER_NAMES.COUNTER]).toBeDefined();

    renderDesktop(store);

    // Dispatch removeAllWindows
    await act(async () => {
      store.dispatch(removeAllWindows());
    });

    // Wait for useEffect to run and clean up reducers
    await waitFor(
      () => {
        const reducerMap = reducerManager.getReducerMap();
        expect(reducerMap[REDUCER_NAMES.COUNTER]).toBeUndefined();
      },
      { timeout: 1000 }
    );
  });

  it('cleans up multiple lazy-loaded reducers when removeAllWindows is dispatched', async () => {
    const store = createTestStore();
    const reducerManager = (store as any).reducerManager;

    // Add multiple windows with different reducers
    store.dispatch(
      addWindow({
        id: 'counter-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'notes-1',
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        lazyLoadReducerName: REDUCER_NAMES.NOTES,
        layout: undefined,
      })
    );

    // Manually inject the reducers
    const mockCounterReducer = (state = { value: 0 }) => state;
    const mockNotesReducer = (state = { items: [] }) => state;
    reducerManager.add(REDUCER_NAMES.COUNTER, mockCounterReducer);
    reducerManager.add(REDUCER_NAMES.NOTES, mockNotesReducer);

    // Verify reducers were added
    expect(reducerManager.getReducerMap()[REDUCER_NAMES.COUNTER]).toBeDefined();
    expect(reducerManager.getReducerMap()[REDUCER_NAMES.NOTES]).toBeDefined();

    renderDesktop(store);

    // Dispatch removeAllWindows
    await act(async () => {
      store.dispatch(removeAllWindows());
    });

    // Wait for useEffect to run and clean up all reducers
    await waitFor(
      () => {
        const reducerMap = reducerManager.getReducerMap();
        expect(reducerMap[REDUCER_NAMES.COUNTER]).toBeUndefined();
      },
      { timeout: 1000 }
    );

    // Verify second reducer was also cleaned up
    const reducerMap = reducerManager.getReducerMap();
    expect(reducerMap[REDUCER_NAMES.NOTES]).toBeUndefined();
  });

  it('does not clean up reducers when windows still exist', async () => {
    const store = createTestStore();
    const reducerManager = (store as any).reducerManager;

    // Add a window with a lazy-loaded reducer
    store.dispatch(
      addWindow({
        id: 'counter-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    // Manually inject the reducer
    const mockReducer = (state = { value: 0 }) => state;
    reducerManager.add(REDUCER_NAMES.COUNTER, mockReducer);

    renderDesktop(store);

    // Wait a bit to ensure no cleanup happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify reducer is still there
    expect(reducerManager.getReducerMap()[REDUCER_NAMES.COUNTER]).toBeDefined();
  });

  it('only cleans up reducers once when removeAllWindows is called', async () => {
    const store = createTestStore();
    const reducerManager = (store as any).reducerManager;

    // Spy on the remove method
    const removeSpy = jest.spyOn(reducerManager, 'remove');

    // Add a window
    store.dispatch(
      addWindow({
        id: 'counter-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    // Manually inject the reducer
    const mockReducer = (state = { value: 0 }) => state;
    reducerManager.add(REDUCER_NAMES.COUNTER, mockReducer);

    renderDesktop(store);

    // Dispatch removeAllWindows
    await act(async () => {
      store.dispatch(removeAllWindows());
    });

    // Wait for cleanup
    await waitFor(
      () => {
        expect(removeSpy).toHaveBeenCalledWith(REDUCER_NAMES.COUNTER);
      },
      { timeout: 1000 }
    );

    // Verify it was only called once
    expect(removeSpy).toHaveBeenCalledTimes(1);

    removeSpy.mockRestore();
  });

  it('handles removeAllWindows when no reducers need cleanup', async () => {
    const store = createTestStore();

    // Add a window without a lazy-loaded reducer
    store.dispatch(
      addWindow({
        id: 'timer-1',
        name: COMPONENT_NAMES.TIMER,
        lazyLoadComponent: 'Timer',
        lazyLoadReducerName: undefined,
        layout: undefined,
      })
    );

    renderDesktop(store);

    // Dispatch removeAllWindows - should not throw
    await act(async () => {
      expect(() => {
        store.dispatch(removeAllWindows());
      }).not.toThrow();
    });

    // Wait to ensure no errors
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('only removes reducer when last window using it is closed', async () => {
    const store = createTestStore();
    const reducerManager = (store as any).reducerManager;
    const removeSpy = jest.spyOn(reducerManager, 'remove');

    // Add two Counter windows (same reducer)
    store.dispatch(
      addWindow({
        id: 'counter-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'counter-2',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    // Add one Notes window (different reducer)
    store.dispatch(
      addWindow({
        id: 'notes-1',
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        lazyLoadReducerName: REDUCER_NAMES.NOTES,
        layout: undefined,
      })
    );

    // Manually inject both reducers
    const mockCounterReducer = (state = { value: 0 }) => state;
    const mockNotesReducer = (state = { items: [] }) => state;
    reducerManager.add(REDUCER_NAMES.COUNTER, mockCounterReducer);
    reducerManager.add(REDUCER_NAMES.NOTES, mockNotesReducer);

    renderDesktop(store);

    // Remove first Counter window
    await act(async () => {
      store.dispatch({ type: 'Desktop/removeWindow', payload: 'counter-1' });
    });

    // Wait a bit for useEffect to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Counter reducer should NOT be removed (counter-2 still uses it)
    expect(removeSpy).not.toHaveBeenCalledWith(REDUCER_NAMES.COUNTER);

    // Remove the Notes window
    await act(async () => {
      store.dispatch({ type: 'Desktop/removeWindow', payload: 'notes-1' });
    });

    // Wait for cleanup
    await waitFor(
      () => {
        expect(removeSpy).toHaveBeenCalledWith(REDUCER_NAMES.NOTES);
      },
      { timeout: 1000 }
    );

    // Notes reducer should be removed (no more windows use it)
    expect(removeSpy).toHaveBeenCalledWith(REDUCER_NAMES.NOTES);
    expect(removeSpy).toHaveBeenCalledTimes(1);

    // Remove the last Counter window
    await act(async () => {
      store.dispatch({ type: 'Desktop/removeWindow', payload: 'counter-2' });
    });

    // Wait for cleanup
    await waitFor(
      () => {
        expect(removeSpy).toHaveBeenCalledWith(REDUCER_NAMES.COUNTER);
      },
      { timeout: 1000 }
    );

    // Now Counter reducer should be removed (no more windows use it)
    expect(removeSpy).toHaveBeenCalledWith(REDUCER_NAMES.COUNTER);
    expect(removeSpy).toHaveBeenCalledTimes(2);

    removeSpy.mockRestore();
  });

  it('keeps reducer when multiple windows share it, removes when all are closed', async () => {
    const store = createTestStore();
    const reducerManager = (store as any).reducerManager;
    const removeSpy = jest.spyOn(reducerManager, 'remove');

    // Add three windows using the same reducer
    store.dispatch(
      addWindow({
        id: 'counter-1',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'counter-2',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    store.dispatch(
      addWindow({
        id: 'counter-3',
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
        layout: undefined,
      })
    );

    // Manually inject the reducer
    const mockReducer = (state = { value: 0 }) => state;
    reducerManager.add(REDUCER_NAMES.COUNTER, mockReducer);

    renderDesktop(store);

    // Remove first window
    await act(async () => {
      store.dispatch({ type: 'Desktop/removeWindow', payload: 'counter-1' });
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(removeSpy).not.toHaveBeenCalled();

    // Remove second window
    await act(async () => {
      store.dispatch({ type: 'Desktop/removeWindow', payload: 'counter-2' });
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(removeSpy).not.toHaveBeenCalled();

    // Remove third (last) window
    await act(async () => {
      store.dispatch({ type: 'Desktop/removeWindow', payload: 'counter-3' });
    });

    // Wait for cleanup
    await waitFor(
      () => {
        expect(removeSpy).toHaveBeenCalledWith(REDUCER_NAMES.COUNTER);
      },
      { timeout: 1000 }
    );

    // Reducer should be removed only once, after the last window is closed
    expect(removeSpy).toHaveBeenCalledTimes(1);

    removeSpy.mockRestore();
  });
});
