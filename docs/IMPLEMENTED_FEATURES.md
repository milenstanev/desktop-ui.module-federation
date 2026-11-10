# Implemented Features

Current feature set in **desktop-ui.module-federation** (beyond the modular core inherited from [desktop-ui](https://github.com/milenstanev/desktop-ui)).

---

## Shell & desktop

| Capability | Notes |
| ---------- | ----- |
| Window grid | `react-grid-layout`, drag by title handle, resize, per-breakpoint layouts |
| Focus / z-index | Focused window on top; Escape and Cmd/Ctrl+W close focused window |
| Themes | Light / Dark / Gradient via `ThemeContext`, persisted as `desktopUI.theme` |
| Persistence | Middleware writes windows/layouts; Close All clears Desktop keys |
| Dashboard configurator | Export / paste / share JSON; `?desktopConfig=` URL bootstrap |
| Architecture panel | Loads analytics remote on demand for demos |
| PWA | Service worker in production; remotes forced `NetworkOnly` |

---

## Local features (`lazyLoadComponent`)

| Window | Path | State |
| ------ | ---- | ----- |
| Simple Example | `src/features/SimpleExample` | none |
| Counter | `src/features/Counter` | `CounterReducer` |
| Notes | `src/features/Notes` | `NotesReducer` |
| Timer | `src/features/Timer` | local only |
| Form Editor | `src/features/FormEditor` | mock API + validation ([MOCK_API.md](./MOCK_API.md)) |
| JSPM App | `src/features/JspmApp` | iframe guest → [IFRAME_SDK.md](./IFRAME_SDK.md) |

---

## Remote features (`remoteFeatureName`)

| Window | Container | Kind | Source |
| ------ | --------- | ---- | ------ |
| Analytics | `analytics` | webpack `remoteEntry.js` | `src/features/remotes/analytics` (:3002 / `{origin}/remote`) |
| Forms | `schemaUi` | ESM `remoteEntry.js` | [schema-ui-mf-remote](https://schema-ui-mf-remote.vercel.app) |

Default first-visit layout (`INITIAL_STATE_CONFIG`) opens Analytics, Counter, Timer, Forms, Notes, and Form Editor. See [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md).

---

## Cross-cutting integrations

| Feature | What it does |
| ------- | ------------ |
| Feature contract / registry | Local and remote features share `FeatureModule` |
| Schema-as-design sync | Iframe or Forms edits merge into `desktopUI.schemaUi.overlay`; Surfaces remount on `desktop-ui:dashboard-sync` |
| desktop-ui as remote | Exposes `desktopUI` (`./App`, `./Desktop`, `./Counter`, `./Notes`); [`host/`](../host/README.md) consumes it |
| Google Analytics 4 | Optional `REACT_APP_GA_MEASUREMENT_ID` for pageviews / vitals in production |

---

## How to verify

```bash
npm run test:unit
npm run test:e2e          # builds/serves dashboard + analytics remote
npm run test:memory       # endurance (@memory)
```

Docs index: [README](../README.md#-documentation).
