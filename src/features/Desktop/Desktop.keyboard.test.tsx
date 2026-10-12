import { Provider } from 'react-redux';
import { render, fireEvent } from '@testing-library/react';
import { setupStore } from '~/core/store';
import { addWindow } from './DesktopSlice';
import Desktop from './Desktop';
import type { DesktopUIWindow } from './types';
import { ThemeProvider } from '~/core/contexts/ThemeContext';
import { KEYBOARD_SHORTCUTS, REDUCER_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

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

const DESKTOP_SLICE_NAME = 'Desktop';
const WINDOWS_PROPERTY = 'desktopWindows';
const FOCUSED_WINDOW_PROPERTY = 'focusedWindowId';
const EXPECTED_WINDOW_COUNT_ZERO = 0;
const EXPECTED_WINDOW_COUNT_ONE = 1;
const META_KEY = 'metaKey';

function renderDesktopWithWindow() {
  const store = setupStore();
  const windowPayload: DesktopUIWindow = {
    id: TEST_SELECTORS.KEYBOARD_TEST_WINDOW_ID,
    name: TEST_SELECTORS.KEYBOARD_TEST_WINDOW_NAME,
    layout: undefined,
    lazyLoadComponent: 'SimpleExample',
    lazyLoadReducerName: REDUCER_NAMES.COUNTER,
  };
  store.dispatch(addWindow(windowPayload));

  const view = render(
    <ThemeProvider>
      <Provider store={store}>
        <Desktop />
      </Provider>
    </ThemeProvider>
  );

  return { ...view, getStore: () => store };
}

describe('Desktop keyboard shortcuts', () => {
  it('closes focused window on Escape', () => {
    const { getStore } = renderDesktopWithWindow();
    const store = getStore();
    expect(store.getState()[DESKTOP_SLICE_NAME][WINDOWS_PROPERTY]).toHaveLength(
      EXPECTED_WINDOW_COUNT_ONE
    );
    expect(store.getState()[DESKTOP_SLICE_NAME][FOCUSED_WINDOW_PROPERTY]).toBe(
      TEST_SELECTORS.KEYBOARD_TEST_WINDOW_ID
    );

    fireEvent.keyDown(window, { key: KEYBOARD_SHORTCUTS.CLOSE_WINDOW });

    expect(store.getState()[DESKTOP_SLICE_NAME][WINDOWS_PROPERTY]).toHaveLength(
      EXPECTED_WINDOW_COUNT_ZERO
    );
    expect(
      store.getState()[DESKTOP_SLICE_NAME][FOCUSED_WINDOW_PROPERTY]
    ).toBeNull();
  });

  it('closes focused window on Cmd+W (Mac) or Ctrl+W', () => {
    const { getStore } = renderDesktopWithWindow();
    const store = getStore();

    fireEvent.keyDown(window, {
      key: KEYBOARD_SHORTCUTS.CLOSE_WINDOW_ALT,
      [META_KEY]: true,
    });

    expect(store.getState()[DESKTOP_SLICE_NAME][WINDOWS_PROPERTY]).toHaveLength(
      EXPECTED_WINDOW_COUNT_ZERO
    );
  });
});
