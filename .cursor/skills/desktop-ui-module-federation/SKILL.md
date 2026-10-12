---
name: desktop-ui-module-federation
description: >-
  Implement or debug Webpack Module Federation in desktop-ui (host, analytics
  remote, loadRemoteFeature, RemoteFeatureLoader, Vercel remotes). Use when
  changing remotes, remoteEntry, shared React, or micro-frontend loading.
---

# desktop-ui Module Federation

Guide: [docs/MICRO_FRONTENDS.md](../../../docs/MICRO_FRONTENDS.md).

## Roles

| App | Path | Port | Container name |
|-----|------|------|----------------|
| Shell (also exposes `desktopUI`) | repo root CRA + `config-overrides.js` | 3000 | `desktopUI` |
| Consumer host | `host/` | 3001 | `host` |
| Analytics remote | `src/features/remotes/analytics` | 3002 | `analytics` |

Shared: React / react-dom / `react/jsx-runtime` / react-redux / RTK as **singletons**. `publicPath: 'auto'` on federated builds.

Entry: `src/index.tsx` only `import('./bootstrap')` so share scope initializes.

Install nested apps: `npm run mf:install`.

## Feature contract

Remotes export default `FeatureModule` (`src/core/feature-types.ts`). Analytics mirrors types in `src/features/remotes/analytics/src/shared/feature-types.ts` — keep them in sync.

```ts
interface FeatureModule {
  name: string;
  displayName: string;
  component: ComponentType<RemoteWindowProps>;
  reducer?: { name: string; reducer: Reducer };
  init?: () => void | Promise<void>;
}
```

If the remote declares a reducer, the UI must use that slice (host `Provider` + injected reducer). Standalone remote entry wraps its own store.

## Loading remotes

- URLs: `src/app-shell/remoteUrls.ts`
  - Env: `REACT_APP_ANALYTICS_REMOTE_URL` (no trailing slash, no `remoteEntry.js`)
  - Local hostname → `http://localhost:3002`
  - Production unset → `{origin}/remote` (not origin root; host `remoteEntry.js` is `desktopUI`)
- `loadRemoteFeature` (`src/app-shell/loadRemoteFeature.ts`):
  - In-flight promise cache per remote name
  - Try candidate URLs until `window[remoteName].init` exists (not merely script 200)
  - Failed `<script>` tags: mark error and **remove** so the same URL can retry
  - Register feature, `reducerManager.add`, optional `init()`
- Windows: `remoteFeatureName` on `DesktopUIWindow`
- `RemoteFeatureLoader` **must** call `loadRemoteFeature` on mount so persisted windows work after refresh

Do not treat host `/remoteEntry.js` as analytics. Do not `break` on first successful script download.

## Deploy

- Host Vercel: `vercel.json` `ignoreCommand` **exit 1 on `master`** (build), **exit 0 otherwise** (skip). Vercel: 0 = skip build.
- Analytics: CORS headers on `remoteEntry` and chunks (`Access-Control-Allow-Origin`).
- Workbox: `remoteEntry.js` is `NetworkOnly` (not SWR with other JS).
- Verify host artifact: `scripts/verify-remote-entry-build.sh`
- E2E serves **built** analytics `dist/` with CORS (`scripts/start-e2e-servers.sh`)

## Consumer `host/`

Must share `react/jsx-runtime` as singleton. `REMOTE_URL` is the **desktop-ui** origin that serves `desktopUI/remoteEntry.js`, not the analytics remote.

## Tests

- Unit: `src/app-shell/remoteUrls.test.ts` (URL order and production `/remote` default)
- E2E: load Analytics, then reload and expect the remote window still renders
