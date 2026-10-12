/**
 * Store setup with dynamic reducer injection.
 *
 * The root reducer is not a static combineReducers(...). It is the reducer
 * manager's reduce function, which can change over time as we add/remove
 * feature slices (see reducerManager.ts). We attach the manager to the store
 * so that lazyLoadReducer and removeLazyLoadedReducer can call add/remove and
 * then replaceReducer(manager.reduce) to apply the new root reducer.
 */
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { createReducerManager } from '~/core/utils/reducerManager';
import DesktopReducer from '~/features/Desktop/DesktopSlice';
import { desktopStorageMiddleware } from '~/core/middleware/desktopStorageMiddleware';
import type { ReducerManager } from '~/core/utils/reducerManager';

export interface StoreWithReducerManager extends EnhancedStore {
  reducerManager: ReducerManager;
}

export function setupStore(
  preloadedState?: Record<string, unknown>
): StoreWithReducerManager {
  const reducerManager = createReducerManager({
    Desktop: DesktopReducer,
  });

  const store = configureStore({
    reducer: reducerManager.reduce,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(desktopStorageMiddleware),
  }) as StoreWithReducerManager;

  store.reducerManager = reducerManager;

  return store;
}

export const store = setupStore();

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
