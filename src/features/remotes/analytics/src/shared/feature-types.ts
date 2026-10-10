/**
 * Feature Module contract (mirrors desktop-ui src/core/feature-types.ts).
 * Keeps analytics remote self-contained.
 */
import type { Reducer } from '@reduxjs/toolkit';
import type { ComponentType } from 'react';

export interface RemoteWindowProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}

export interface FeatureReducerSpec {
  name: string;
  reducer: Reducer;
}

export interface FeatureModule {
  name: string;
  displayName: string;
  component: ComponentType<RemoteWindowProps>;
  reducer?: FeatureReducerSpec;
  init?: () => void | Promise<void>;
}
