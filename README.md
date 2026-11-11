# desktop-ui · Module Federation

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Webpack](https://img.shields.io/badge/Webpack_5-Module_Federation-8dd6f9?logo=webpack)
![License](https://img.shields.io/badge/license-MIT-green)

**A desktop-style React dashboard that composes local feature modules, runtime-loaded micro-frontends, and cross-origin iframe apps in one window grid.**

This repository grew out of [desktop-ui](https://github.com/milenstanev/desktop-ui), the original modular SPA starter (feature folders, dynamic reducer injection, lazy loading). `desktop-ui.module-federation` keeps that core and adds:

- **Webpack Module Federation host**: loads remote features at runtime
  - `analytics`: a classic webpack `remoteEntry.js` script, in-tree at `src/features/remotes/analytics`
  - `schemaUi`: an ESM (Vite) `remoteEntry.js` from [schema-ui-mf-remote](https://schema-ui-mf-remote.vercel.app) that renders schema-driven CRUD forms
- **Module Federation remote**: desktop-ui exposes itself as the `desktopUI` container (`./App`, `./Desktop`, `./Counter`, `./Notes`), and the [`host/`](./host/README.md) app consumes it
- **Iframe SDK**: a cross-origin AngularJS (JSPM) app talks to the dashboard through a versioned `postMessage` protocol
- **Schema-as-design sync**: a record edited in the iframe or the Forms remote is shared through a localStorage overlay, and every dashboard surface re-renders it
- **Dashboard configurator**: export, paste, or share the whole dashboard (windows + layouts) as JSON or as a `?desktopConfig=` URL
- **Feature contract and registry**: local and remote features share one `FeatureModule` interface

→ [Full docs index](#-documentation)

---

## 🚀 Quick Start

```bash
git clone https://github.com/milenstanev/desktop-ui.module-federation.git
cd desktop-ui.module-federation
npm install
npm run mf:install        # installs host/ and the analytics remote
```

Run the dashboard together with the local analytics remote:

```bash
npm run start             # desktop-ui on http://localhost:3000
npm run analytics:start   # analytics remote on http://localhost:3002
```

The Forms window loads `schemaUi` from `https://schema-ui-mf-remote.vercel.app` by default, and the JSPM App window embeds `https://jspm-app.vercel.app`. Neither needs a local server.

Optional: run desktop-ui as a **remote** inside the standalone host app:

```bash
npm run mf:demo           # build + serve desktop-ui on :3000
npm run host:start        # host on http://localhost:3001 renders desktopUI/App
```

Tests:

```bash
npm run test:unit         # Jest + React Testing Library
npm run test:e2e          # Playwright (starts :3000 and the analytics remote on :3002)
npm run test:memory       # long-running memory endurance suite (@memory)
```

---

## ⚙️ How It Works

```
                           desktop-ui  (MF container "desktopUI")
   ┌──────────────────────────────────────────────────────────────────────────┐
   │  Header ─ addWindow({ lazyLoadComponent | remoteFeatureName })           │
   │     │                                                                    │
   │  Redux store (Desktop slice + injected reducers) ─ storage middleware    │
   │     │                                                                    │
   │  Desktop grid (react-grid-layout) ─ one Window + ErrorBoundary per item  │
   │     │                                                                    │
   │     ├── ComponentLoader ──► componentLoader  (local, code-split)         │
   │     │     Simple Example · Counter · Notes · Timer · Form Editor ·       │
   │     │     JSPM App ─────────► <iframe> + postMessage SDK                 │
   │     │                                                                    │
   │     └── RemoteFeatureLoader ─► loadRemoteFeature()  (Module Federation)  │
   │           analytics  ─ webpack script remoteEntry.js  (:3002 / /remote)  │
   │           schemaUi   ─ ESM remoteEntry.js + fetch overlay  (Forms)       │
   └──────────────────────────────────────────────────────────────────────────┘
                 ▲
                 │  desktopUI/App
            host/ (MF host on :3001)
```

1. `src/index.tsx` does `import('./bootstrap')` so the MF shared scope (React, Redux) is initialised before the app renders.
2. Each window is a `DesktopUIWindow`. It names either a **local** component (`lazyLoadComponent`) or a **remote** feature (`remoteFeatureName`).
3. Local features are code-split via `componentLoader`. Their reducers are injected with `useLazyLoadReducer`.
4. Remote features are resolved by `loadRemoteFeature()`. It fetches the remote container, shares the host's React into its scope, and calls `container.get(expose)`. Then it registers the resulting `FeatureModule` and injects its reducer.
5. Desktop state (windows, layouts) is persisted by `desktopStorageMiddleware`. The initial dashboard comes from, in order: a `?desktopConfig=` query, saved localStorage, a saved bootstrap snapshot, and the built-in layout.

Details: [Architecture](./docs/ARCHITECTURE.md) · [Micro-frontends](./docs/MICRO_FRONTENDS.md) · [Iframe SDK](./docs/IFRAME_SDK.md)

---

## 🧩 What's on the Dashboard

| Window         | Kind                  | Source                                           |
| -------------- | --------------------- | ------------------------------------------------ |
| Simple Example | Local                 | `src/features/SimpleExample`                     |
| Counter        | Local + reducer       | `src/features/Counter` (`CounterReducer`)        |
| Notes          | Local + reducer       | `src/features/Notes` (`NotesReducer`)            |
| Timer          | Local                 | `src/features/Timer`                             |
| Form Editor    | Local                 | `src/features/FormEditor` (mock API, validation) |
| JSPM App       | Local iframe guest    | `src/features/JspmApp` → `jspm-app.vercel.app`   |
| Analytics      | Remote (webpack MF)   | `src/features/remotes/analytics`                 |
| Forms          | Remote (ESM MF)       | `schema-ui-mf-remote` container `schemaUi`       |

The header also has a theme selector (Light / Dark / Gradient), **Grid**, **Reset**, and **Close All** buttons, the **JSON** dashboard configurator, and the **Architecture** panel that loads the analytics remote on demand.

---

## 📂 Repository Layout

```
.
├── src/
│   ├── index.tsx / bootstrap.tsx   # async MF entry → real bootstrap
│   ├── app/                        # App, Header, FooterTaskbar
│   ├── app-shell/                  # remote loading, ESM import, schema-ui fetch overlay, iframe bridge
│   ├── core/                       # store, reducer manager, feature registry/contract, middleware, theme, GA
│   ├── features/                   # Desktop, Counter, Notes, Timer, FormEditor, JspmApp, MicroFrontendDemo, …
│   │   └── remotes/analytics/      # standalone analytics remote (own package.json + webpack)
│   └── shared/                     # Window, ErrorBoundary, Loader, forms, constants, test selectors
├── host/                           # standalone MF host that consumes desktopUI/App
├── tests/                          # Playwright suites (MF, schema-ui, JSPM, configurator, memory…)
├── scripts/                        # e2e server launcher, Vercel deploy + artifact checks
├── config-overrides.js             # react-app-rewired: ModuleFederationPlugin, Workbox, analyzer
├── microfrontends.json             # Vercel microfrontends routing (/remote → analytics)
└── docs/
```

---

## 📦 Core Concepts

- **Feature-based modules**: each feature folder owns its component, slice, styles, and tests. → [Feature Components](./docs/FEATURE_COMPONENTS.md)
- **Dynamic reducer injection**: slices are added when a window opens and removed when the last window that uses them closes. → [ADR 0001](./docs/decisions/0001-dynamic-reducer-injection.md)
- **One feature contract**: `FeatureModule { name, displayName, component, reducer?, init? }` works for both local and remote features. → [Micro-frontends](./docs/MICRO_FRONTENDS.md)
- **Runtime federation**: remotes are deployed independently and resolved at runtime from configurable URLs, with fallbacks. → [ADR 0005](./docs/decisions/0005-runtime-module-federation.md)
- **Isolation by default**: each window gets its own error boundary. Iframe guests can only reach the dashboard through origin-checked messages. → [ADR 0003](./docs/decisions/0003-error-boundary-per-window.md), [ADR 0004](./docs/decisions/0004-iframe-postmessage-sdk.md)
- **Persistence in middleware**: reducers stay pure, and localStorage writes happen in one place. → [Middleware Persistence](./docs/MIDDLEWARE_PERSISTENCE.md)

---

## ⚖️ Trade-Offs

Module Federation buys independent deployment. In exchange:

- **Shared dependency discipline**: React, React DOM, React Redux, and Redux Toolkit must stay singleton-compatible across the host and every remote.
- **Runtime failure modes**: a remote can be down, stale, or serve HTML instead of JS. The loader reports which URLs it tried, and the window shows the error instead of crashing.
- **More moving parts**: three deployables (dashboard, analytics remote, host) plus external services (schema-ui, JSPM).
- **Cross-origin limits**: iframe guests can't share React or Redux. Everything goes through JSON `postMessage`.

This is overkill for small apps and prototypes. It fits multi-team frontends that need to ship features independently.

---

## 📚 Documentation

### Architecture
- [Architecture Overview](./docs/ARCHITECTURE.md): structure, patterns, load flows
- [Micro-Frontends](./docs/MICRO_FRONTENDS.md): Module Federation host/remote, remote URLs, shared scope, troubleshooting
- [Iframe SDK](./docs/IFRAME_SDK.md) · [Protocol](./docs/IFRAME_SDK_PROTOCOL.md) · [Guest](./docs/IFRAME_SDK_GUEST.md): `window.desktopUi` + `postMessage`
- [Architecture Decision Records](./docs/decisions/): reducer injection, storage, error boundaries, iframe SDK, runtime federation

### Development
- [Feature Components](./docs/FEATURE_COMPONENTS.md): add local or remote features
- [Middleware Persistence](./docs/MIDDLEWARE_PERSISTENCE.md): Desktop actions, localStorage keys, bootstrap snapshot
- [Configuration](./docs/CONFIGURATION.md): environment variables and storage keys
- [API & Hooks](./docs/API_DOCUMENTATION.md): hooks, utilities, app-shell APIs
- [Best Practices](./docs/BEST_PRACTICES.md) · [Debugging](./docs/DEBUGGING.md) · [PWA Guide](./docs/PWA_GUIDE.md)
- [Deployment](./docs/DEPLOYMENT.md): Vercel/Netlify for the dashboard, analytics remote, and host

### Testing
- [E2E Tests](./docs/WINDOW_INTERACTIONS_TESTS.md): Playwright suites and window interaction patterns
- [Performance Testing](./docs/PERFORMANCE.md): Web Vitals, bundle analysis, memory endurance

### Features & Reference
- [Implemented Features](./docs/IMPLEMENTED_FEATURES.md): current feature set
- [Mock API](./docs/MOCK_API.md) · [Shared Forms](./src/shared/forms/README.md) · [Analytics remote](./src/features/remotes/analytics/README.md) · [Host app](./host/README.md)

---

## 📬 Feedback

Discussions and architectural feedback on modular SPA and micro-frontend strategies are welcome.
