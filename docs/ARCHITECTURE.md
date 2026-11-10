# Architecture

This document describes the architectural patterns behind **desktop-ui.module-federation**: a desktop-style React dashboard that composes local feature modules, runtime Module Federation remotes, and cross-origin iframe guests.

It grew out of [desktop-ui](https://github.com/milenstanev/desktop-ui) (modular SPA: feature folders, dynamic reducer injection, lazy loading). This repo keeps that core and adds runtime federation, an iframe SDK, and dashboard sharing.

For Module Federation specifics see [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md) and [ADR 0005](./decisions/0005-runtime-module-federation.md).

---

## Overview

The app prevents a monolithic SPA from becoming unmaintainable through:

- Feature-based modules with clear ownership
- Dynamic reducer injection
- Lazy loading for local features
- Runtime Module Federation for independently deployed remotes
- Per-window error boundaries
- Middleware-based persistence (and optional `?desktopConfig=` sharing)

---

## Project Structure

```
src/
├── index.tsx / bootstrap.tsx   → async MF entry, then real bootstrap
├── app/                        → App, Header, FooterTaskbar
├── app-shell/                  → remote loading, ESM import, schema-ui fetch overlay, iframe bridge
├── core/                       → store, reducer manager, feature registry/contract, middleware, theme, GA
│   ├── store.ts
│   ├── feature-types.ts / feature-registry.ts
│   ├── hooks/                  # useLazyLoadReducer, useKeyboardShortcuts, …
│   ├── middleware/             # desktopStorageMiddleware
│   ├── contexts/               # ThemeContext
│   └── utils/                  # reducerManager, lazyLoadReducer, componentLoader
├── shared/                     → Window, ErrorBoundary, Loader, ComponentLoader, forms, constants, testSelectors
└── features/                   → Desktop, Counter, Notes, Timer, FormEditor, JspmApp, MicroFrontendDemo, …
    └── remotes/analytics/      → standalone webpack MF remote (own package.json)

host/                           → standalone MF host that consumes desktopUI/App
tests/                          → Playwright suites
scripts/                        → e2e servers, Vercel deploy + artifact checks
config-overrides.js             → ModuleFederationPlugin, Workbox, analyzer
microfrontends.json             → Vercel routing (/remote → analytics)
```

---

## Core Architectural Patterns

### 1. Feature-Based Module Structure

Each local feature is self-contained:

```
src/features/FeatureName/
├── __tests__/
│   ├── unit/
│   └── e2e/            # optional; many E2E specs live under tests/
├── FeatureName.tsx
├── FeatureNameSlice.ts # optional
└── README.md           # optional
```

Remote features live outside the main CRA bundle (in-tree under `src/features/remotes/*`, or an external deploy such as schema-ui) and still resolve to the same `FeatureModule` contract.

### 2. Dynamic Reducer Injection

Reducers are injected at runtime when features load ([ADR 0001](./decisions/0001-dynamic-reducer-injection.md)).

- Local: `useLazyLoadReducer` on mount; removed when the last window that uses the slice closes
- Remote: `store.reducerManager.add()` inside `loadRemoteFeature()` when the remote exports a reducer

### 3. Local lazy loading vs remote federation

| Path | Window field | Loader | Deployed with |
| ---- | ------------ | ------ | ------------- |
| Local | `lazyLoadComponent` | `ComponentLoader` → `componentLoader` | Main app |
| Remote | `remoteFeatureName` | `RemoteFeatureLoader` → `loadRemoteFeature` | Independently |

**Local load flow**

1. Header dispatches `addWindow({ lazyLoadComponent, … })`
2. Desktop renders `<ComponentLoader />`
3. `getLazyComponent()` dynamic-imports the feature (cached per name)
4. Optional reducer injects via `useLazyLoadReducer`

**Remote load flow**

1. Header (or restored layout) opens a window with `remoteFeatureName`
2. `RemoteFeatureLoader` calls `loadRemoteFeature(name)`
3. Container is fetched (`webpack-script` or `esm`), share scope is seeded with the host's React, then `container.get(expose)` runs
4. Result is normalised to `FeatureModule`, registered, reducer injected if present

Details: [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md).

### 4. Middleware-Based Persistence

Desktop windows and layouts persist through `desktopStorageMiddleware` ([ADR 0002](./decisions/0002-local-storage-persistence.md)). Reducers stay pure.

Initial dashboard resolution order (`desktopSnapshot.ts`):

1. `?desktopConfig=` query (share / paste URL)
2. Saved localStorage (`desktopUI.desktop` / `desktopUI.layouts`)
3. Saved bootstrap snapshot (`desktopUI.bootstrap`)
4. Built-in `INITIAL_STATE_CONFIG`

Schema-as-design edits from the iframe or Forms remote use a separate overlay key (`desktopUI.schemaUi.overlay`). See [MIDDLEWARE_PERSISTENCE.md](./MIDDLEWARE_PERSISTENCE.md) and [IFRAME_SDK.md](./IFRAME_SDK.md).

### 5. Isolated Error Boundaries

Each window wraps content in its own `ErrorBoundary` ([ADR 0003](./decisions/0003-error-boundary-per-window.md)). Remote load failures show an inline alert with tried URLs instead of crashing the shell.

### 6. Iframe guests (non-federated)

Apps that cannot share React (AngularJS JSPM, etc.) embed via `<iframe>` and a versioned `postMessage` protocol ([ADR 0004](./decisions/0004-iframe-postmessage-sdk.md), [IFRAME_SDK.md](./IFRAME_SDK.md)).

---

## Runtime composition

```
                           desktop-ui  (MF container "desktopUI")
   ┌──────────────────────────────────────────────────────────────────────────┐
   │  Header ─ addWindow({ lazyLoadComponent | remoteFeatureName })           │
   │  Redux store (Desktop + injected reducers) ─ storage middleware          │
   │  Desktop grid ─ Window + ErrorBoundary per item                         │
   │     ├── ComponentLoader ── local features (+ JspmApp iframe)             │
   │     └── RemoteFeatureLoader ── analytics (webpack), schemaUi (ESM)       │
   └──────────────────────────────────────────────────────────────────────────┘
                 ▲
                 │  desktopUI/App
            host/ (MF host on :3001)
```

`src/index.tsx` uses `import('./bootstrap')` so the Module Federation shared scope initialises before React renders—whether this app is the browser entry or a remote consumed by `host/`.

---

## State Management

```plaintext
desktop: { desktopWindows, layouts, focusedWindowId, … }
CounterReducer?: { value: number }
NotesReducer?: { notes: Note[] }
analytics?: …   # injected when the analytics remote loads
# other dynamic slices as features mount
```

---

## Performance

- Initial shell stays small; local features code-split; remotes never ship in the main bundle
- Workbox marks `remoteEntry.js` and the schema-ui origin as `NetworkOnly` so remotes are not served stale from the PWA cache ([PWA_GUIDE.md](./PWA_GUIDE.md))
- Unused local reducers are removed when their last window closes
- Memory endurance covered by `npm run test:memory` (`@memory` Playwright suite)

---

## Testing Strategy

| Layer | Tool | Notes |
| ----- | ---- | ----- |
| Unit | Jest + RTL | Features, app-shell, middleware |
| E2E | Playwright | `npm run test:e2e` starts `:3000` + analytics on `:3002` via `scripts/start-e2e-servers.sh` |
| Memory | Playwright `@memory` | Long-running endurance |

Suite index: [WINDOW_INTERACTIONS_TESTS.md](./WINDOW_INTERACTIONS_TESTS.md).

---

## Scalability

### Add a local feature

1. Folder under `src/features/`
2. Register in `componentLoader`
3. Header button + constants / test selectors
4. Unit + E2E tests

### Add a remote feature

1. Build a container that exposes a `FeatureModule` (or a page adapted by `toFeatureModule`)
2. Register remote config + URL helpers in `app-shell`
3. Open windows with `remoteFeatureName`
4. See [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md) and [FEATURE_COMPONENTS.md](./FEATURE_COMPONENTS.md)

### Multi-team

- Local features: same repo, feature folders
- Remotes: separate deploys / cadence (analytics, schema-ui)
- Non-React guests: iframe SDK only

---

## Trade-offs

**Fits well:** multi-team dashboards, independent feature releases, long-lived platforms.

**Overkill:** small apps, quick prototypes, single-bundle products with no remote ownership.

Module Federation costs: shared dependency discipline, runtime failure modes (CORS, wrong content-type, missing chunks), and more deployables. Details in [ADR 0005](./decisions/0005-runtime-module-federation.md).

---

## Related Documentation

- [Micro-Frontends](./MICRO_FRONTENDS.md)
- [Architecture Decision Records](./decisions/)
- [Feature Components](./FEATURE_COMPONENTS.md)
- [Iframe SDK](./IFRAME_SDK.md)
- [Middleware Persistence](./MIDDLEWARE_PERSISTENCE.md)
- [Deployment](./DEPLOYMENT.md)
- [Performance](./PERFORMANCE.md)
- [Best Practices](./BEST_PRACTICES.md)
