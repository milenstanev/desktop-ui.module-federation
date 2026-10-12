/**
 * useLazyLoadReducer Hook
 *
 * Injects a feature's Redux reducer when the feature component mounts.
 * The reducer is automatically added to the store's reducer manager.
 *
 * Used by window content that has its own slice (e.g. Notes, Counter).
 * On mount, this hook calls lazyLoadReducer(store, key, reducer), which adds
 * the slice to the reducer manager and replaces the store's root reducer.
 * The feature can then use useSelector(state => state[key]) as usual.
 *
 * When the last window of this type is closed, Desktop calls
 * removeLazyLoadedReducer(store, key) so the slice and its state are removed.
 *
 * @example
 * ```typescript
 * function Counter() {
 *   useLazyLoadReducer({
 *     lazyLoadReducerName: 'counter',
 *     featureReducer: counterReducer,
 *   });
 *
 *   const count = useAppSelector((state) => state.counter.value);
 *   // ...
 *
 * ```
 */
import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { lazyLoadReducer } from '~/core/utils/lazyLoadReducer';
import type { StoreWithReducerManager } from '~/core/store';
import type { Reducer } from '@reduxjs/toolkit';

/**
 * Parameters for useLazyLoadReducer hook
 */
type UseLazyLoadReducerParams = {
  /** Unique name for the reducer (must match the slice name) */
  lazyLoadReducerName: string;
  /** The Redux reducer to inject */
  featureReducer: Reducer;
};

/**
 * Hook to dynamically inject a Redux reducer
 *
 * @param params - Hook parameters
 * @param params.lazyLoadReducerName - Unique name for the reducer
 * @param params.featureReducer - The Redux reducer to inject
 */
function useLazyLoadReducer({
  lazyLoadReducerName,
  featureReducer,
}: UseLazyLoadReducerParams) {
  const store = useStore() as StoreWithReducerManager;

  useEffect(() => {
    lazyLoadReducer(store, lazyLoadReducerName, featureReducer);
  }, [featureReducer, lazyLoadReducerName, store]);
}

export default useLazyLoadReducer;
