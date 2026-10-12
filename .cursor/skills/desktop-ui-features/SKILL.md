---
name: desktop-ui-features
description: >-
  Add or change desktop-ui local features, windows, Header buttons, lazy
  componentLoader entries, and dynamic Redux slices. Use when creating a
  feature module, addWindow, lazyLoadComponent, or Desktop persistence.
---

# desktop-ui features

Local features live in `src/features/<Name>/` and open as Desktop windows.

Full guide: [docs/FEATURE_COMPONENTS.md](../../../docs/FEATURE_COMPONENTS.md).  
ADRs: [docs/decisions/](../../../docs/decisions/).

## Layout

```
src/features/<Name>/
├── __tests__/
│   ├── unit/<Name>.test.tsx
│   └── e2e/<name>.spec.ts    # optional; root tests/ is also used
├── <Name>.tsx
├── <Name>.module.css
├── <Name>Slice.ts            # optional
└── README.md                 # optional
```

CSS modules for feature styles. Shared form fields: `src/shared/forms/`.

## Add a local feature (order)

1. Implement `<Name>.tsx` (and slice if needed).
2. Register **exact key** in `src/core/utils/componentLoader.ts`:

```ts
export const componentLoader = {
  YourFeature: () => import('~/features/YourFeature/YourFeature'),
};
```

The key **must** match `lazyLoadComponent` on `addWindow`.

3. Constants in `src/shared/constants.ts`:
   - `COMPONENT_NAMES`
   - `REDUCER_NAMES` (if Redux)
   - `APP_STRINGS.BUTTON_ADD_…`
   - feature-specific string map
4. Header button in `src/app/Header.tsx`:

```ts
const handleAddYourFeature = useCallback(() => {
  const id = uuidv4();
  dispatch(
    addWindow({
      id,
      name: COMPONENT_NAMES.YOUR_FEATURE,
      lazyLoadComponent: 'YourFeature',
      layout: undefined,
      lazyLoadReducerName: REDUCER_NAMES.YOUR_FEATURE, // omit if no slice
    })
  );
}, [dispatch]);
```

5. Unit tests next to the feature. E2E: `tests/<name>.spec.ts` or `src/features/<Name>/__tests__/e2e/`.
6. Selectors: add to `src/shared/testSelectors.ts`; use `closeAllWindows(page)` from `~/tests/helpers` when the spec needs an empty desktop.

## Redux per feature

- Slice with `createSlice`.
- Inject via `lazyLoadReducerName` + `useLazyLoadReducer` (already used by `Window`).
- Last window with that reducer name closed → reducer removed (`removeLazyLoadedReducer` in Desktop).
- Do not add feature slices to the static store in `src/core/store.ts` (only `Desktop` is always-on).

## Desktop actions

If you add an action that changes `desktopWindows` or `layouts`:

1. Add it on `DesktopSlice`.
2. Import it in `desktopStorageMiddleware.ts` and add `yourAction.match(action)` to the persist `if`.
3. Cover it in `DesktopSlice.test.ts` and middleware tests.

`setFocus` is intentionally **not** persisted.

## Local vs remote

- Local: `lazyLoadComponent` + `componentLoader`.
- Remote (Module Federation): `remoteFeatureName` + `loadRemoteFeature` / `RemoteFeatureLoader`. See skill `desktop-ui-module-federation`.
- Do not mix both on the same window unless there is a clear reason.

## Architecture constraints

- Features must not import other features' internals. Share via `src/shared/` or `src/core/`.
- App shell: `src/app/`. Infrastructure: `src/core/`.
