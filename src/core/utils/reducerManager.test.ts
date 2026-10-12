import { createReducerManager } from './reducerManager';

const DUMMY_STATE = { value: 0 };
const DUMMY_STATE_ALT = { value: 999 };
const dummyReducer = (state = DUMMY_STATE) => state;

const REDUCER_KEYS = {
  FOO: 'foo',
  BAR: 'bar',
} as const;

const ACTION_TYPE_INIT = '@@INIT';

describe('createReducerManager', () => {
  it('returns combined reducer for initial reducers', () => {
    const manager = createReducerManager({ [REDUCER_KEYS.FOO]: dummyReducer });
    const state = manager.reduce(undefined, { type: ACTION_TYPE_INIT });
    expect(state).toEqual({ [REDUCER_KEYS.FOO]: DUMMY_STATE });
  });

  it('adds new reducer', () => {
    const manager = createReducerManager({ [REDUCER_KEYS.FOO]: dummyReducer });
    manager.add(REDUCER_KEYS.BAR, dummyReducer);
    const state = manager.reduce(
      { [REDUCER_KEYS.FOO]: DUMMY_STATE },
      { type: ACTION_TYPE_INIT }
    );
    expect(state).toHaveProperty(REDUCER_KEYS.BAR);
  });

  it('ignores duplicate add', () => {
    const manager = createReducerManager({ [REDUCER_KEYS.FOO]: dummyReducer });
    manager.add(REDUCER_KEYS.FOO, () => DUMMY_STATE_ALT);
    const state = manager.reduce(undefined, { type: ACTION_TYPE_INIT });
    expect(state[REDUCER_KEYS.FOO]).toEqual(DUMMY_STATE);
  });

  it('removes reducer and clears state', () => {
    const manager = createReducerManager({
      [REDUCER_KEYS.FOO]: dummyReducer,
      [REDUCER_KEYS.BAR]: dummyReducer,
    });
    manager.remove(REDUCER_KEYS.BAR);
    const state = manager.reduce(
      { [REDUCER_KEYS.FOO]: DUMMY_STATE, [REDUCER_KEYS.BAR]: DUMMY_STATE },
      { type: ACTION_TYPE_INIT }
    );
    expect(state).toEqual({ [REDUCER_KEYS.FOO]: DUMMY_STATE });
  });
});
