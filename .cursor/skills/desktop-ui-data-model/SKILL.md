---
name: desktop-ui-data-model
description: >-
  Desktop-ui window snapshot, dashboard JSON, desktopConfig URLs, localStorage
  bootstrap, and layout identity. Use when building share links, pasting
  dashboard JSON, adding duplicate window types, or changing Desktop persistence.
---

# desktop-ui data model

Canonical types: `src/features/Desktop/types.ts`, parse/serialize in `src/features/Desktop/desktopSnapshot.ts`, defaults in `src/features/Desktop/config.ts`.

A **window type** (`name`, `lazyLoadComponent`, `remoteFeatureName`) may appear **many times**. Identity is **`id`**, never type. Two Analytics + two Forms is valid if the four `id`s differ.

## Window (`DesktopUIWindow`)

| Field | Role |
|-------|------|
| `id` | Unique. Grid `layout.i` and React `key`. |
| `name` | Title / aria (`Analytics`, `Forms`, …). Duplicates OK. |
| `lazyLoadComponent` | Local feature key in `componentLoader`. |
| `remoteFeatureName` | Remote key in `REMOTE_FEATURE_NAMES`. |
| `lazyLoadReducerName` | Optional injected slice key. Shared across windows of that type. |
| `preferredSize` | `{ w?, h? }` used when auto-placing. Forms default `h: LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT` (8). |
| `layout` | Per-window override; snapshots usually omit it (`undefined`) and use `layouts`. |

Each window must have **either** `lazyLoadComponent` **or** `remoteFeatureName` (parser rejects neither / unknown keys). Do not put both on one window unless there is a clear reason.

Local keys must exist on `componentLoader`. Remote names must be `analytics` or `schemaUi`.

### Built-in types

| `name` | Load | Reducer |
|--------|------|---------|
| Analytics | `remoteFeatureName: 'analytics'` | `analytics` |
| Forms | `remoteFeatureName: 'schemaUi'` | none |
| Counter | `lazyLoadComponent: 'Counter'` | `CounterReducer` |
| Timer | `lazyLoadComponent: 'Timer'` | none |
| Notes | `lazyLoadComponent: 'Notes'` | `NotesReducer` |
| Form Editor | `lazyLoadComponent: 'FormEditor'` | none |
| Simple Example | `lazyLoadComponent: 'SimpleExample'` | none |
| JSPM App | `lazyLoadComponent: 'JspmApp'` (iframe of AngularJS `jspm.app`) | none |

`addWindow` only rejects duplicate **`id`**. Header Add buttons always `uuidv4()`.

## Snapshot (`DesktopSnapshot`)

```ts
{ windows: DesktopUIWindow[]; layouts: Layouts }
```

`Layouts` = react-grid-layout `{ xl, lg, md, sm }[]` of `{ i, x, y, w, h }` where `i` === window `id`.

Accepted JSON:

1. **Array of windows** — layouts generated (`generateLayouts`: 3-up on lg/xl).
2. **Object** `{ windows }` or `{ desktopWindows }` — optional `layouts`; regenerated if a breakpoint is missing an id (`lg`/`md`/`sm` required if `layouts` is present).

Reject: unknown component/remote, empty/duplicate ids, invalid layout items.

Pretty-print via `serializeDesktopSnapshot`. Apply via `applyDesktopConfig` (must stay registered in `desktopStorageMiddleware`).

## Boot order

`resolveInitialDesktopState` / `DesktopConfigurator` mount:

1. **`?desktopConfig=`** (`DESKTOP_CONFIG_QUERY_PARAM`) — wins over saved desktop. Parsed JSON (URI-decoded). Also written to bootstrap storage.
2. **Persisted session** — `localStorage` `desktopUI.desktop` + `desktopUI.layouts` if windows length > 0.
3. **Bootstrap** — `desktopUI.bootstrap` (configurator “Apply JSON” / query).
4. **Built-in mosaic** — `INITIAL_STATE_CONFIG` (one of each: Analytics, Counter, Timer, Forms, Notes, Form Editor).

`Close all` **removes** desktop+layout keys (not bootstrap). Next load without query uses bootstrap or built-in.

`setFocus` is not persisted.

Query + configurator dispatch `applyDesktopConfig` so a share URL replaces the current grid even after a prior visit.

## Share URLs

Base: production host `https://desktop-ui-mf.vercel.app` (never `desktop-ui-eight.vercel.app`).

```
https://desktop-ui-mf.vercel.app/?desktopConfig=<encodeURIComponent(JSON.stringify(windowsArrayOrSnapshot))>
```

Compact JSON (no spaces). Unique `id`s per window. Same `name` / remote is how you get two of a type. The configurator **Copy URL** button builds this from the current desktop (`buildDesktopShareUrl`).

Hard-refresh if an old host bundle still prefers localStorage over the query.

Recipes: [examples.md](examples.md).

## Persistence keys

| Key | Content |
|-----|---------|
| `desktopUI.desktop` | `DesktopUIWindow[]` |
| `desktopUI.layouts` | `Layouts` |
| `desktopUI.bootstrap` | snapshot JSON (initial after Close All) |
| `desktopUI.theme` | theme |
| `desktopUI.schemaUi.overlay` | schema-ui CRUD overlay (not part of the window snapshot) |

New Desktop actions that change windows/layouts: register in `desktopStorageMiddleware.ts`.

## Redux vs windows

One injected reducer **key** per type (`lazyLoadReducerName`). Two Analytics windows share `state.analytics`. Closing the **last** window with that key removes the reducer.

Grid instances are still two DOM windows.

## Agent checklist

- Need N windows of one type → N distinct `id`s, same load fields.
- Share link ignored → confirm query precedence still query-first; user may need a new deploy.
- JSON invalid → unknown `lazyLoadComponent` / `remoteFeatureName`, or duplicate ids.
- Do not unique-by-`name` in `addWindow` or the parser.
- Strings/test ids stay in `constants.ts` / `testSelectors.ts`.

Related: `desktop-ui-features`, `desktop-ui-module-federation`, `desktop-ui-schema-as-design`.
