/**
 * Dynamic Reducer Injection Utilities
 *
 * Attach a feature's Redux slice when its window mounts,
 * and detach when the last window of that type unmounts.
 *
 * The store must be created with the reducer manager's reduce as the root
 * reducer (see app/store.ts).
 */
import { Reducer } from '@reduxjs/toolkit';
import type { StoreWithReducerManager } from '~/core/store';

/**
 * Lazy Load Reducer
 *
 * Registers a reducer under the specified key with the store's reducer manager
 * and replaces the store's root reducer with the manager's current reduce function.
 * Redux's store.replaceReducer() makes the new root reducer active.
 *
 * Called from useLazyLoadReducer when a feature component mounts.
 *
 * @param store - Redux store with reducer manager
 * @param key - Unique key for the reducer (must match slice name)
 * @param reducer - The Redux reducer to inject
 *
 * @example
 * ```typescript
 * lazyLoadReducer(store, 'counter', counterReducer);
 * // Now state.counter is available
 * ```
 */
export function lazyLoadReducer(
  store: StoreWithReducerManager,
  key: string,
  reducer: Reducer
): void {
  if (!store.reducerManager.getReducerMap()[key]) {
    store.reducerManager.add(key, reducer);
    store.replaceReducer(store.reducerManager.reduce);
  }
}

/**
 * Remove Lazy Loaded Reducer
 *
 * Removes the reducer for the specified key and replaces the root reducer
 * so the slice's state is no longer in the tree.
 *
 * Called from Desktop when the last window using that slice is closed.
 *
 * @param store - Redux store with reducer manager
 * @param key - Key of the reducer to remove
 *
 * @example
 * ```typescript
 * removeLazyLoadedReducer(store, 'counter');
 * // Now state.counter is undefined
 * ```
 */
export function removeLazyLoadedReducer(
  store: StoreWithReducerManager,
  key: string
): void {
  if (store.reducerManager.getReducerMap()[key]) {
    store.reducerManager.remove(key);
    store.replaceReducer(store.reducerManager.reduce);
  }
}
