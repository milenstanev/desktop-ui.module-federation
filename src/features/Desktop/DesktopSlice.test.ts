import reducer, {
  addWindow,
  removeWindow,
  updateLayouts,
  setFocus,
  resetLayouts,
  removeAllWindows,
  organizeGrid,
  applyDesktopConfig,
} from './DesktopSlice';
import type { DesktopUIWindow } from './types';
import { LAYOUT_CONFIG, REDUCER_NAMES } from '~/shared/constants';

const TEST_WINDOW_IDS = {
  W1: 'w1',
  W2: 'w2',
} as const;

const TEST_WINDOW_NAME = 'Test Window';
const TEST_LAYOUT_COMPONENT = 'SimpleExample';
const EXPECTED_LENGTH_ZERO = 0;
const EXPECTED_LENGTH_ONE = 1;
const BREAKPOINT_LG = 'lg';
const LAYOUTS_PROPERTY = 'layouts';
const WINDOWS_PROPERTY = 'desktopWindows';
const FOCUSED_WINDOW_PROPERTY = 'focusedWindowId';

const TEST_LAYOUT = {
  I: 'w1',
  X: 0,
  Y: 0,
  W: 4,
  H: 2,
} as const;

const createWindow = (
  overrides: Partial<DesktopUIWindow> = {}
): DesktopUIWindow =>
  ({
    id: TEST_WINDOW_IDS.W1,
    name: TEST_WINDOW_NAME,
    layout: undefined,
    lazyLoadComponent: TEST_LAYOUT_COMPONENT,
    lazyLoadReducerName: REDUCER_NAMES.COUNTER,
    ...overrides,
  }) as DesktopUIWindow;

describe('DesktopSlice', () => {
  const initialState = {
    [WINDOWS_PROPERTY]: [] as DesktopUIWindow[],
    [LAYOUTS_PROPERTY]: { xl: [], lg: [], md: [], sm: [] },
    [FOCUSED_WINDOW_PROPERTY]: null as string | null,
  };

  it('adds window', () => {
    const window = createWindow();
    const state = reducer(initialState, addWindow(window));
    expect(state[WINDOWS_PROPERTY]).toHaveLength(EXPECTED_LENGTH_ONE);
    expect(state[WINDOWS_PROPERTY][0].id).toBe(TEST_WINDOW_IDS.W1);
    expect(state[LAYOUTS_PROPERTY].lg).toHaveLength(EXPECTED_LENGTH_ONE);
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBe(TEST_WINDOW_IDS.W1);
  });

  it('sets focused window when adding', () => {
    const w1 = createWindow({ id: TEST_WINDOW_IDS.W1 });
    const w2 = createWindow({ id: TEST_WINDOW_IDS.W2 });
    let state = reducer(initialState, addWindow(w1));
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBe(TEST_WINDOW_IDS.W1);
    state = reducer(state, addWindow(w2));
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBe(TEST_WINDOW_IDS.W2);
  });

  it('applies preferredSize height when adding a window', () => {
    const window = createWindow({
      preferredSize: { h: LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT },
    });
    const state = reducer(initialState, addWindow(window));
    expect(state[LAYOUTS_PROPERTY].lg[0].h).toBe(
      LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT
    );
    expect(state[LAYOUTS_PROPERTY].xl[0].h).toBe(
      LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT
    );
    expect(state[LAYOUTS_PROPERTY].sm[0].w).toBe(2);
    expect(state[LAYOUTS_PROPERTY].sm[0].h).toBe(
      LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT
    );
  });

  it('does not add duplicate window by id', () => {
    const window = createWindow();
    let state = reducer(initialState, addWindow(window));
    state = reducer(state, addWindow(window));
    expect(state[WINDOWS_PROPERTY]).toHaveLength(EXPECTED_LENGTH_ONE);
  });

  it('removes window', () => {
    const window = createWindow();
    let state = reducer(initialState, addWindow(window));
    state = reducer(state, removeWindow(TEST_WINDOW_IDS.W1));
    expect(state[WINDOWS_PROPERTY]).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[LAYOUTS_PROPERTY].lg).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBeNull();
  });

  it('updates layouts', () => {
    const layout = [
      {
        i: TEST_LAYOUT.I,
        x: TEST_LAYOUT.X,
        y: TEST_LAYOUT.Y,
        w: TEST_LAYOUT.W,
        h: TEST_LAYOUT.H,
      },
    ];
    const state = reducer(
      { ...initialState, [LAYOUTS_PROPERTY]: { lg: layout, md: [], sm: [] } },
      updateLayouts({ layout, breakpoint: BREAKPOINT_LG })
    );
    expect(state[LAYOUTS_PROPERTY].lg).toEqual(layout);
  });

  it('setFocus updates focusedWindowId', () => {
    let state = reducer(initialState, setFocus(TEST_WINDOW_IDS.W1));
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBe(TEST_WINDOW_IDS.W1);
    state = reducer(state, setFocus(null));
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBeNull();
  });

  it('removeAllWindows clears all windows, layouts, and focus', () => {
    const w1 = createWindow({ id: TEST_WINDOW_IDS.W1 });
    const w2 = createWindow({ id: TEST_WINDOW_IDS.W2 });
    let state = reducer(initialState, addWindow(w1));
    state = reducer(state, addWindow(w2));

    expect(state[WINDOWS_PROPERTY]).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].lg).toHaveLength(2);
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBe(TEST_WINDOW_IDS.W2);

    state = reducer(state, removeAllWindows());

    expect(state[WINDOWS_PROPERTY]).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[LAYOUTS_PROPERTY].xl).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[LAYOUTS_PROPERTY].lg).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[LAYOUTS_PROPERTY].md).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[LAYOUTS_PROPERTY].sm).toHaveLength(EXPECTED_LENGTH_ZERO);
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBeNull();
  });

  it('organizeGrid arranges windows in equal-sized grid', () => {
    const w1 = createWindow({ id: TEST_WINDOW_IDS.W1 });
    const w2 = createWindow({ id: TEST_WINDOW_IDS.W2 });
    let state = reducer(initialState, addWindow(w1));
    state = reducer(state, addWindow(w2));

    state = reducer(state, organizeGrid());

    expect(state[LAYOUTS_PROPERTY].xl).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].lg).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].md).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].sm).toHaveLength(2);

    // Windows are stored newest first (w2, w1), so layout[0] is w2
    // XL: 3 per row, 4 cols each
    const xlLayout0 = state[LAYOUTS_PROPERTY].xl[0];
    expect(xlLayout0.i).toBe(TEST_WINDOW_IDS.W2);
    expect(xlLayout0.x).toBe(0);
    expect(xlLayout0.y).toBe(0);
    expect(xlLayout0.w).toBe(4);
    expect(xlLayout0.h).toBe(3);

    // LG: 4 per row, 3 cols each
    const lgLayout0 = state[LAYOUTS_PROPERTY].lg[0];
    expect(lgLayout0.i).toBe(TEST_WINDOW_IDS.W2);
    expect(lgLayout0.x).toBe(0);
    expect(lgLayout0.y).toBe(0);
    expect(lgLayout0.w).toBe(3);
    expect(lgLayout0.h).toBe(3);

    // Second window in grid
    const lgLayout1 = state[LAYOUTS_PROPERTY].lg[1];
    expect(lgLayout1.i).toBe(TEST_WINDOW_IDS.W1);
    expect(lgLayout1.x).toBe(3);
    expect(lgLayout1.y).toBe(0);
    expect(lgLayout1.w).toBe(3);
    expect(lgLayout1.h).toBe(3);
  });

  it('applyDesktopConfig replaces windows and layouts', () => {
    const state = reducer(
      initialState,
      applyDesktopConfig({
        windows: [createWindow({ id: TEST_WINDOW_IDS.W2 })],
        layouts: {
          xl: [{ i: TEST_WINDOW_IDS.W2, x: 1, y: 2, w: 3, h: 4 }],
          lg: [{ i: TEST_WINDOW_IDS.W2, x: 1, y: 2, w: 3, h: 4 }],
          md: [{ i: TEST_WINDOW_IDS.W2, x: 0, y: 0, w: 4, h: 4 }],
          sm: [{ i: TEST_WINDOW_IDS.W2, x: 0, y: 0, w: 2, h: 4 }],
        },
      })
    );
    expect(state[WINDOWS_PROPERTY]).toHaveLength(1);
    expect(state[WINDOWS_PROPERTY][0].id).toBe(TEST_WINDOW_IDS.W2);
    expect(state[LAYOUTS_PROPERTY].lg[0]).toMatchObject({
      i: TEST_WINDOW_IDS.W2,
      x: 1,
      y: 2,
    });
    expect(state[FOCUSED_WINDOW_PROPERTY]).toBe(TEST_WINDOW_IDS.W2);
  });

  it('resetLayouts resets windows to default positions', () => {
    const w1 = createWindow({ id: TEST_WINDOW_IDS.W1 });
    const w2 = createWindow({ id: TEST_WINDOW_IDS.W2 });
    let state = reducer(initialState, addWindow(w1));
    state = reducer(state, addWindow(w2));

    // Manually change layouts
    state = reducer(
      state,
      updateLayouts({
        layout: [
          { i: TEST_WINDOW_IDS.W1, x: 5, y: 5, w: 2, h: 2 },
          { i: TEST_WINDOW_IDS.W2, x: 7, y: 7, w: 2, h: 2 },
        ],
        breakpoint: BREAKPOINT_LG,
      })
    );

    state = reducer(state, resetLayouts());

    expect(state[LAYOUTS_PROPERTY].xl).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].lg).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].md).toHaveLength(2);
    expect(state[LAYOUTS_PROPERTY].sm).toHaveLength(2);

    // Windows are stored newest first (w2, w1), so layout[0] is w2
    // XL: 3 per row, 4 cols each
    const xlLayout0 = state[LAYOUTS_PROPERTY].xl[0];
    expect(xlLayout0.i).toBe(TEST_WINDOW_IDS.W2);
    expect(xlLayout0.x).toBe(0);
    expect(xlLayout0.y).toBe(0);
    expect(xlLayout0.w).toBe(4);
    expect(xlLayout0.h).toBe(4);

    // LG: 3 per row, 4 cols each (consistent with addWindow)
    const lgLayout0 = state[LAYOUTS_PROPERTY].lg[0];
    expect(lgLayout0.i).toBe(TEST_WINDOW_IDS.W2);
    expect(lgLayout0.x).toBe(0);
    expect(lgLayout0.y).toBe(0);
    expect(lgLayout0.w).toBe(4);
    expect(lgLayout0.h).toBe(4);

    // Second window (right side)
    const lgLayout1 = state[LAYOUTS_PROPERTY].lg[1];
    expect(lgLayout1.i).toBe(TEST_WINDOW_IDS.W1);
    expect(lgLayout1.x).toBe(4);
    expect(lgLayout1.y).toBe(0);
    expect(lgLayout1.w).toBe(4);
    expect(lgLayout1.h).toBe(4);
  });
});
