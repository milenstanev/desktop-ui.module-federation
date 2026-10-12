/**
 * Reducer Manager: dynamic Redux reducer injection
 *
 * Redux's combineReducers() is static—you pass a fixed object and it never changes.
 * Here we need to add reducers when a feature window opens and remove them when
 * the last window of that type closes. The reducer manager:
 *
 * 1. Holds a mutable map of reducers and rebuilds the combined reducer when
 *    add() or remove() is called.
 * 2. Exposes a single reduce(state, action) that behaves like a normal root reducer
 *    but delegates to the current combined reducer.
 * 3. On remove(), we don't delete the key from state immediately (that would mutate
 *    state inside reduce). We queue keys in keysToRemove and strip them at the
 *    start of the next reduce() call, then run the new combined reducer so the
 *    removed slice's state is gone.
 *
 * Used by: store (as the root reducer), lazyLoadReducer / removeLazyLoadedReducer.
 */
import { combineReducers, Reducer } from '@reduxjs/toolkit';

export interface ReducerManager {
  getReducerMap: () => { [key: string]: Reducer };
  reduce: (state: any, action: any) => any;
  add: (key: string, reducer: Reducer) => void;
  remove: (key: string) => void;
}

export function createReducerManager(initialReducers: {
  [key: string]: Reducer;
}): ReducerManager {
  const reducers = { ...initialReducers };
  let combinedReducer = combineReducers(reducers);
  let keysToRemove: string[] = [];

  return {
    getReducerMap: () => reducers,

    reduce: (state: any, action: any) => {
      if (keysToRemove.length > 0) {
        state = { ...state };
        keysToRemove.forEach((key) => delete state[key]);
        keysToRemove = [];
      }
      return combinedReducer(state, action);
    },

    add: (key: string, reducer: Reducer) => {
      if (!key || reducers[key]) {
        return;
      }
      reducers[key] = reducer;
      combinedReducer = combineReducers(reducers);
    },

    remove: (key: string) => {
      if (!key || !reducers[key]) {
        return;
      }
      delete reducers[key];
      keysToRemove.push(key);
      combinedReducer = combineReducers(reducers);
    },
  };
}
