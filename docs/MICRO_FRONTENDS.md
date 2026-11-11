# Micro-Frontend Architecture

desktop-ui is both a **Module Federation host** and a **Module Federation remote**:

- As a **host** it loads remote features into dashboard windows at runtime (`analytics`, `schemaUi`).
- As a **remote** it exposes itself as the `desktopUI` container, which the standalone [`host/`](../host/README.md) app renders.

Cross-origin apps that can't share React (AngularJS, Vue, …) use the [Iframe SDK](./IFRAME_SDK.md) instead.

## Problem

Large applications struggle with:
- Monolithic deployments (one team blocks all releases)
- Tight coupling (features depend on each other)
- Slow build and test cycles

## Topology

```
                 ┌───────────────────────────────────────────────┐
  host/ :3001 ──►│ desktop-ui  (container "desktopUI")  :3000    │
  desktopUI/App  │   exposes ./App ./Desktop ./Counter ./Notes   │
                 │                                               │
                 │   Local features (componentLoader)            │
                 │     SimpleExample · Counter · Notes · Timer   │
                 │     FormEditor · JspmApp (iframe guest)       │
                 │                                               │
                 │   Remote features (loadRemoteFeature)         │
                 │     analytics ─ webpack script remoteEntry ───┼──► :3002  or  {origin}/remote
                 │     schemaUi  ─ ESM remoteEntry (Forms) ──────┼──► schema-ui-mf-remote.vercel.app
                 └───────────────────────────────────────────────┘
```

| Container   | Role   | Build                              | Entry                      | Exposes                                 |
| ----------- | ------ | ---------------------------------- | -------------------------- | --------------------------------------- |
| `desktopUI` | both   | CRA + `config-overrides.js`        | `build/remoteEntry.js`     | `./App`, `./Desktop`, `./Counter`, `./Notes` |
| `analytics` | remote | `src/features/remotes/analytics`   | `dist/remoteEntry.js`      | `./Feature` (`FeatureModule` default export) |
| `schemaUi`  | remote | external Vite app (schema-ui-mf-remote) | ESM `remoteEntry.js` | `./EntityPage`                          |
| `host`      | host   | `host/webpack.config.js`           | n/a                        | n/a (consumes `desktopUI/App`)          |

## Feature Contract

Every feature, local or remote, resolves to a `FeatureModule` (`src/core/feature-types.ts`):

```typescript
interface FeatureModule {
  name: string;
  displayName: string;
  component: ComponentType<RemoteWindowProps>;
  reducer?: { name: string; reducer: Reducer };
  init?: () => void | Promise<void>;
}

interface RemoteWindowProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}
```

Loaded features are stored in the feature registry (`src/core/feature-registry.ts`: `registerFeature`, `getFeature`, `hasFeature`, `listFeatures`).

Remotes that don't export a `FeatureModule` (such as schema-ui's `EntityPage`) are adapted by `toFeatureModule()` in `loadRemoteFeature.ts`. It picks `UsersPage | EntityPage | FormDynamic | default | App`, wraps it in a component, and, for `schemaUi`, injects `{ entity: 'users', apiBase: '<schemaUi>/api', title, description }`.

## Local vs Remote

| Aspect         | Local                                   | Remote                                              |
| -------------- | --------------------------------------- | --------------------------------------------------- |
| Code location  | `src/features/*`                        | Separate deployable                                 |
| Window field   | `lazyLoadComponent: ComponentNames`     | `remoteFeatureName: 'analytics' \| 'schemaUi'`      |
| Rendered by    | `ComponentLoader` → `getLazyComponent`  | `RemoteFeatureLoader` → `loadRemoteFeature`         |
| Deployed with  | Main app                                | Independently                                       |
| Reducer        | `useLazyLoadReducer` on mount           | `store.reducerManager.add()` in `loadRemoteFeature` |
| Failure        | Window `ErrorBoundary`                  | Inline `role="alert"` message listing tried URLs    |

## Loading a Remote

`src/app-shell/loadRemoteFeature.ts`:

1. A window with `remoteFeatureName` mounts `RemoteFeatureLoader`. This happens when you click **Add Analytics** or **Add Forms**, use **Architecture → Load Analytics Feature**, or restore a persisted or shared dashboard.
2. `loadRemoteFeature(name)` returns the registered feature if it is already loaded. Concurrent callers share one in-flight promise. A failed load is evicted so it can be retried.
3. The container is fetched according to the remote's `kind`:
   - **`webpack-script`** (`analytics`): inject a `<script>` for each candidate URL until `window.analytics` exposes `init`/`get`.
   - **`esm`** (`schemaUi`): `assertEsmRemoteEntry()` checks that the URL returns JavaScript that exports `init`/`get` and that its first `./assets/*` chunk exists. Then `importRemoteEsmModule()` imports it natively through a `<script type="module">`, because CRA's webpack would otherwise rewrite `import()`.
4. `initSharedScope()` calls `__webpack_init_sharing__('default')` and puts the host's own `react`, `react-dom`, `react-dom/client`, and `react/jsx-runtime` into the scope (`from: 'desktopUI'`) when they are missing. This guarantees one React instance. Then it runs `container.init(scope)`.
5. `container.get(expose)()` returns the module, which is normalised by `toFeatureModule()` and passed to `registerFeature()`.
6. If the feature has a reducer, it is added via `store.reducerManager.add()`, and `feature.init()` runs if present.

`RemoteFeatureLoader` adds two schema-ui specific behaviours:

- **`SchemaUiFetchGate`** installs a reference-counted `window.fetch` wrapper (`schemaUiFetch.ts`) while any Forms window is mounted:
  - It rewrites same-origin `/api/*` calls to the schema-ui remote and disables HTTP caching.
  - It merges a localStorage overlay (`desktopUI.schemaUi.overlay`) into list and record responses, so edits survive a remote 404 or a reload.
- It listens for `desktop-ui:dashboard-sync` and remounts the Forms component when an iframe guest updates a record (see [Iframe SDK](./IFRAME_SDK.md#schema-as-design-jspm-default-home)).

## Remote URL Resolution

`src/app-shell/remoteUrls.ts`

| Remote      | Env var                          | Default                                                                                   |
| ----------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `analytics` | `REACT_APP_ANALYTICS_REMOTE_URL` | `http://localhost:3002` on localhost; `{window.location.origin}/remote` in production     |
| `schemaUi`  | `REACT_APP_SCHEMA_UI_REMOTE_URL` | `https://schema-ui-mf-remote.vercel.app`                                                  |

Values are base URLs without `/remoteEntry.js`. `buildRemoteEntryUrls()` expands them into candidates:

- `analytics`: `{base}/remoteEntry.js`, then the `/remote` sibling (added or stripped), then `{origin}/remoteEntry.js`. A candidate is only accepted once the `analytics` global exists, so loading the dashboard's own `desktopUI` entry by mistake is harmless.
- `schemaUi`: `{base}/remoteEntry.js` only.

The production default `{origin}/remote` matches the Vercel microfrontends routing in [`microfrontends.json`](../microfrontends.json), where `/remote/*` is served by the `analytics-remote` project.

## Shared Dependencies

Both `config-overrides.js` (desktopUI) and the analytics `webpack.config.js` declare these as `singleton: true, strictVersion: false`:

`react`, `react-dom`, `react/jsx-runtime`, `react-redux`, `@reduxjs/toolkit`

The host app adds `react-dom/client`. Keep major versions aligned (React 18, React Redux 9, RTK 2) across every container. The ESM `schemaUi` remote is not a webpack build, so the loader seeds React into the scope it receives.

`config-overrides.js` also sets `output.publicPath = 'auto'` so desktopUI chunks resolve from desktopUI's origin when another host consumes it. The Workbox service worker serves `remoteEntry.js` and `schema-ui-mf-remote.vercel.app` requests as `NetworkOnly`, so remotes are never stale.

## Remote Example: Analytics

`src/features/remotes/analytics/src/Feature.tsx`

```typescript
const AnalyticsFeature: FeatureModule = {
  name: 'analytics',
  displayName: 'Analytics',
  component: AnalyticsComponent,
  reducer: { name: 'analytics', reducer: analyticsSlice.reducer },
};
export default AnalyticsFeature;
```

`src/features/remotes/analytics/webpack.config.js`

```javascript
new ModuleFederationPlugin({
  name: 'analytics',
  filename: 'remoteEntry.js',
  exposes: { './Feature': './src/Feature' },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true }, /* … */ },
});
```

The remote keeps its own copy of the contract types in `src/shared/feature-types.ts` so it builds without the host. Its dev server and Vercel config send `Access-Control-Allow-Origin: *`, because Module Federation needs CORS.

## desktop-ui as a Remote: `host/`

`host/webpack.config.js` maps `desktopUI` → `desktopUI@${REMOTE_URL}/remoteEntry.js` (default `http://localhost:3000`) and renders `desktopUI/App`. `src/index.tsx` → `import('./bootstrap')` is the async boundary that lets the shared scope settle before React renders in either role.

`npm run build:vercel` runs `scripts/verify-remote-entry-build.sh`. The script fails the deploy if `build/remoteEntry.js` is missing or not in `asset-manifest.json`.

## Running Locally

| Goal                          | Commands                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| Dashboard + analytics (dev)   | `npm start` and `npm run analytics:start`                       |
| Production-like (what e2e uses) | `npm run build`, then `./scripts/start-e2e-servers.sh` (serves `build/` on :3000 and analytics `dist/` on :3002 with CORS) |
| desktop-ui inside host        | `npm run mf:demo` and `npm run host:start` → http://localhost:3001 |

Install the sub-project dependencies once with `npm run mf:install`.

### Analytics remote as a Git submodule

To move the analytics app into its own repository:

1. Create a repo (e.g. `desktop-ui-analytics-remote`) and push the contents of `src/features/remotes/analytics`.
2. Replace the in-tree folder:
   ```bash
   rm -rf src/features/remotes/analytics
   git submodule add <analytics-repo-url> src/features/remotes/analytics
   ```
3. After cloning, run `git submodule update --init --recursive`.

## Troubleshooting

| Symptom                                                        | Likely cause / fix                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Remote "analytics" container not found. Tried: …`             | Remote not running or wrong base URL. Start `npm run analytics:start` or set `REACT_APP_ANALYTICS_REMOTE_URL`. |
| `Script loaded from … but remote "analytics" container was not found` | URL served a different container (e.g. the dashboard's own `desktopUI` entry). Point the env var at the analytics deployment. |
| `remoteEntry at … returned text/html, not JavaScript`          | SPA fallback served `index.html`. The ESM remote path is wrong or not deployed.     |
| `ESM remoteEntry … imports …/assets/… which returned HTTP 404` | schema-ui remote deployed without its `/assets` chunks. Redeploy it.               |
| `Invalid hook call` / two Reacts                               | Shared singleton versions diverged. Align `react`/`react-dom` across containers.   |
| Remote looks stale after a deploy                              | A service worker from before the `NetworkOnly` rules. Unregister it (see [PWA Guide](./PWA_GUIDE.md)). |

## Related

- [ADR 0005: Runtime Module Federation](./decisions/0005-runtime-module-federation.md)
- [Iframe SDK](./IFRAME_SDK.md) for non-federated guests
- [Deployment](./DEPLOYMENT.md) for deploying each container
