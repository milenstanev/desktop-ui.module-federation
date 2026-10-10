/**
 * Load Remote Feature via Module Federation
 *
 * Dynamically loads a remote container and fetches the Feature export.
 * Provides the host's React/ReactDOM to the remote to avoid multiple React instances.
 */
import * as React from 'react';
import type { ComponentType } from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import type { Reducer } from '@reduxjs/toolkit';
import { getFeature, registerFeature } from '~/core/feature-registry';
import type { FeatureModule, RemoteWindowProps } from '~/core/feature-types';
import { store } from '~/core/store';
import {
  buildRemoteEntryUrls,
  getAnalyticsRemoteBaseUrl,
  getSchemaUiRemoteBaseUrl,
} from '~/app-shell/remoteUrls';
import { REMOTE_FEATURE_NAMES } from '~/shared/constants';

export type RemoteKind = 'webpack-script' | 'esm';

export interface RemoteConfig {
  name: string;
  url: string;
  entryUrls: string[];
  kind: RemoteKind;
  expose: string;
  displayName: string;
}

export type RemoteContainer = {
  init: (scope: unknown) => Promise<void> | void;
  get: (module: string) => Promise<() => Record<string, unknown>>;
};

const loadPromises = new Map<string, Promise<FeatureModule>>();

function getRemoteConfigMap(): Record<string, RemoteConfig> {
  const analyticsUrl = getAnalyticsRemoteBaseUrl();
  const schemaUiUrl = getSchemaUiRemoteBaseUrl();
  return {
    [REMOTE_FEATURE_NAMES.ANALYTICS]: {
      name: REMOTE_FEATURE_NAMES.ANALYTICS,
      url: analyticsUrl,
      entryUrls: buildRemoteEntryUrls(analyticsUrl),
      kind: 'webpack-script',
      expose: './Feature',
      displayName: 'Analytics',
    },
    [REMOTE_FEATURE_NAMES.SCHEMA_UI]: {
      name: REMOTE_FEATURE_NAMES.SCHEMA_UI,
      url: schemaUiUrl,
      entryUrls: buildRemoteEntryUrls(schemaUiUrl, undefined, {
        includeAlternatePaths: false,
      }),
      kind: 'esm',
      expose: './UsersPage',
      displayName: 'Forms',
    },
  };
}

function getRemoteContainer(remoteName: string): RemoteContainer | undefined {
  const container = (window as unknown as Record<string, unknown>)[
    remoteName
  ] as RemoteContainer | undefined;
  if (!container?.init || !container?.get) {
    return undefined;
  }
  return container;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      const status = existing.dataset.mfStatus;
      if (status === 'loaded') {
        resolve();
        return;
      }
      if (status === 'error') {
        reject(new Error(`Failed to load script: ${src}`));
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error(`Failed to load script: ${src}`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.mfStatus = 'loaded';
      resolve();
    };
    script.onerror = () => {
      script.dataset.mfStatus = 'error';
      script.remove();
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
}

function reactShareVersion(): string {
  return React.version || '18.3.1';
}

async function initSharedScope(container: RemoteContainer): Promise<void> {
  const win = window as Window & {
    __webpack_init_sharing__?: (scope: string) => Promise<void>;
    __webpack_share_scopes__?: {
      default: Record<string, Record<string, unknown>>;
    };
  };
  if (typeof win.__webpack_init_sharing__ === 'function') {
    await win.__webpack_init_sharing__('default');
  }

  const scope = win.__webpack_share_scopes__?.default ?? {};
  const version = reactShareVersion();
  const ensureReactInScope = () => {
    if (!scope.react) {
      scope.react = {
        [version]: {
          get: () => Promise.resolve(() => React),
          loaded: 1,
          from: 'desktopUI',
        },
      };
    }
    if (!scope['react-dom']) {
      scope['react-dom'] = {
        [version]: {
          get: () => Promise.resolve(() => ReactDOM),
          loaded: 1,
          from: 'desktopUI',
        },
      };
    }
    if (!scope['react/jsx-runtime']) {
      scope['react/jsx-runtime'] = {
        [version]: {
          get: () => Promise.resolve(() => ReactJsxRuntime),
          loaded: 1,
          from: 'desktopUI',
        },
      };
    }
    if (!scope['react-dom/client']) {
      scope['react-dom/client'] = {
        [version]: {
          get: () => Promise.resolve(() => ReactDOMClient),
          loaded: 1,
          from: 'desktopUI',
        },
      };
    }
  };
  ensureReactInScope();
  await container.init(scope);
}

function isRemoteContainer(value: unknown): value is RemoteContainer {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as RemoteContainer;
  return (
    typeof candidate.init === 'function' && typeof candidate.get === 'function'
  );
}

export function resolveEsmRemoteContainer(
  imported: unknown,
  entryUrl: string
): RemoteContainer {
  if (isRemoteContainer(imported)) {
    return imported;
  }
  if (
    imported != null &&
    typeof imported === 'object' &&
    'default' in imported &&
    isRemoteContainer((imported as { default: unknown }).default)
  ) {
    return (imported as { default: RemoteContainer }).default;
  }
  throw new Error(`ESM remoteEntry at ${entryUrl} does not export init/get`);
}

async function importEsmContainer(entryUrl: string): Promise<RemoteContainer> {
  const imported: unknown = await import(/* webpackIgnore: true */ entryUrl);
  return resolveEsmRemoteContainer(imported, entryUrl);
}

function toFeatureModule(
  config: RemoteConfig,
  mod: Record<string, unknown>
): FeatureModule {
  const maybeFeature = mod.default as FeatureModule | undefined;
  if (maybeFeature?.name && maybeFeature?.component) {
    return maybeFeature;
  }

  const component = (mod.UsersPage ||
    mod.FormDynamic ||
    mod.default ||
    mod.App) as ComponentType<Record<string, unknown>> | undefined;

  if (!component) {
    throw new Error(
      `Invalid module from remote "${config.name}" expose "${config.expose}"`
    );
  }

  const Wrapped: React.FC<RemoteWindowProps> = () =>
    React.createElement(component);

  return {
    name: config.name,
    displayName: config.displayName,
    component: Wrapped,
  };
}

async function loadWebpackContainer(
  config: RemoteConfig
): Promise<{ container: RemoteContainer; loadError: Error | null }> {
  let loadError: Error | null = null;
  let container: RemoteContainer | undefined;

  for (const entryUrl of config.entryUrls) {
    try {
      await loadScript(entryUrl);
      container = getRemoteContainer(config.name);
      if (container) {
        return { container, loadError: null };
      }
      loadError = new Error(
        `Script loaded from ${entryUrl} but remote "${config.name}" container was not found`
      );
    } catch (error) {
      loadError = error instanceof Error ? error : new Error(String(error));
    }
  }

  return { container: container as RemoteContainer, loadError };
}

async function loadEsmContainer(
  config: RemoteConfig
): Promise<{ container: RemoteContainer; loadError: Error | null }> {
  const errors: string[] = [];

  for (const entryUrl of config.entryUrls) {
    try {
      const container = await importEsmContainer(entryUrl);
      return { container, loadError: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${entryUrl}: ${message}`);
    }
  }

  return {
    container: undefined as unknown as RemoteContainer,
    loadError: errors.length
      ? new Error(errors.join(' | '))
      : new Error('No ESM remoteEntry URLs to try'),
  };
}

async function loadRemoteFeatureUncached(
  remoteName: string
): Promise<FeatureModule> {
  const registered = getFeature(remoteName);
  if (registered) {
    return registered;
  }

  const config = getRemoteConfigMap()[remoteName];
  if (!config) {
    throw new Error(`Unknown remote: ${remoteName}`);
  }

  const loaded =
    config.kind === 'esm'
      ? await loadEsmContainer(config)
      : await loadWebpackContainer(config);

  const container = loaded.container;
  const loadError = loaded.loadError;

  if (!container?.init || !container?.get) {
    const availableContainerGlobals = Object.keys(
      window as unknown as Record<string, unknown>
    )
      .filter((key) => /^[a-zA-Z_$][\w$]*$/.test(key))
      .filter(
        (key) =>
          [
            'desktopUI',
            REMOTE_FEATURE_NAMES.ANALYTICS,
            REMOTE_FEATURE_NAMES.SCHEMA_UI,
            'host',
          ].includes(key) || key.toLowerCase().includes('remote')
      )
      .slice(0, 10);

    throw new Error(
      `Remote "${remoteName}" container not found. Tried: ${config.entryUrls.join(
        ', '
      )}. Ensure one URL serves a valid remoteEntry.js that exposes "${remoteName}".` +
        (availableContainerGlobals.length
          ? ` Available container-like globals: ${availableContainerGlobals.join(', ')}.`
          : '') +
        (loadError ? ` Last error: ${loadError.message}` : '')
    );
  }

  await initSharedScope(container);

  const factory = await container.get(config.expose);
  const mod = factory();
  const feature = toFeatureModule(config, mod);

  if (!feature?.name || !feature?.component) {
    throw new Error(`Invalid FeatureModule from remote "${remoteName}"`);
  }

  registerFeature(feature);

  if (feature.reducer) {
    const storeWithManager = store as typeof store & {
      reducerManager?: { add: (key: string, reducer: Reducer) => void };
    };
    if (storeWithManager.reducerManager) {
      storeWithManager.reducerManager.add(
        feature.reducer.name,
        feature.reducer.reducer
      );
    }
  }

  if (feature.init) {
    await feature.init();
  }

  return feature;
}

/**
 * Load a feature from a remote micro-frontend and register it.
 * Injects the reducer if present. Concurrent calls share one in-flight promise.
 */
export function loadRemoteFeature(remoteName: string): Promise<FeatureModule> {
  const existing = loadPromises.get(remoteName);
  if (existing) {
    return existing;
  }

  const pending = loadRemoteFeatureUncached(remoteName).catch((error) => {
    loadPromises.delete(remoteName);
    throw error;
  });
  loadPromises.set(remoteName, pending);
  return pending;
}

export function getRemoteConfig(remoteName: string): RemoteConfig | undefined {
  return getRemoteConfigMap()[remoteName];
}

export function getAvailableRemotes(): string[] {
  return Object.keys(getRemoteConfigMap());
}

export {
  buildRemoteEntryUrls,
  getAnalyticsRemoteBaseUrl,
  getSchemaUiRemoteBaseUrl,
};
