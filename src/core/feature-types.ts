/**
 * Feature Module Contract
 *
 * Every feature — local or remote — implements this interface.
 * Enables consistent integration with the app shell, reducer injection,
 * and dynamic loading.
 */
import type { Reducer } from '@reduxjs/toolkit';
import type { ComponentType } from 'react';

export interface FeatureReducerSpec {
  name: string;
  reducer: Reducer;
}

export interface FeatureModule {
  name: string;
  displayName: string;
  /** React component to render in a window */
  component: ComponentType<RemoteWindowProps>;
  /** Redux reducer to inject when feature loads */
  reducer?: FeatureReducerSpec;
  /** Optional initialization (e.g. prefetch data) */
  init?: () => void | Promise<void>;
}

export interface RemoteWindowProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}
