# Feature Components

New feature components live in `src/features/` in their own folders, with unit tests and E2E coverage.

## Structure (per feature)

```
src/features/<FeatureName>/
  <FeatureName>.tsx       # Main component
  <FeatureName>.module.css
  <FeatureName>.test.tsx   # Unit tests
  [<FeatureName>Slice.ts] # Optional Redux slice
```

## Implemented features

### Notes (`features/Notes/`)

- **What**: Add and remove text notes in a list.
- **Redux**: `NotesSlice` (items array, addNote, removeNote), lazy-loaded as `NotesReducer`.
- **Unit tests**: `Notes.test.tsx` (render, add note, remove note).
- **E2E**: `tests/notes.spec.ts` (open Notes window, add note).

### Timer (`features/Timer/`)

- **What**: Simple stopwatch (Start, Pause, Reset).
- **Redux**: None (local state only).
- **Unit tests**: `Timer.test.tsx` (render, start/increment, reset).
- **E2E**: `tests/timer.spec.ts` (open Timer window, see controls).

### FormEditor (`features/FormEditor/`)

- **What**: Dynamic form editor with mock API integration.
- **Redux**: None (local state only).
- **API**: Uses `mockApi.ts` for data fetching and submission (see [MOCK_API.md](./MOCK_API.md)).
- **Features**: Text, number, checkbox, and select fields; loading states; form validation.
- **Unit tests**: `FormEditor.test.tsx` (render, field types, submission).
- **E2E**: `tests/form-editor.spec.ts` (6 tests: load form, populate data, edit fields, submit, loading state, button states).
- **data-testid**: All form fields have `data-testid="form-field-{fieldName}"` for testing.

### JSPM App (`features/JspmApp/`)

- **What**: Cross-origin AngularJS app in an iframe (`https://jspm-app.vercel.app`).
- **Redux**: None in the guest. Host listens for iframe events and can `removeWindow`.
- **Events**: Guest `window.desktopUi.emit('userUpdated', { entity, record })` → overlay + Forms remount + `dashboardSync`. Schema is the design: [IFRAME_SDK.md](./IFRAME_SDK.md).
- **Unit tests**: iframe URL handshake query; origin-checked `close`.
- **E2E**: `tests/jspm-app.spec.ts`.

### Analytics remote (`features/remotes/analytics/`)

- **What**: Webpack Module Federation remote (`analytics` / `./Feature`).
- **Window field**: `remoteFeatureName: 'analytics'` (not `lazyLoadComponent`).
- **Rendered by**: `RemoteFeatureLoader` → `loadRemoteFeature('analytics')`.
- **Dev**: `npm run analytics:start` on `:3002`. Docs: [analytics README](../src/features/remotes/analytics/README.md), [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md).

### Forms remote (`schemaUi`)

- **What**: External Vite ESM remote ([schema-ui-mf-remote](https://schema-ui-mf-remote.vercel.app)).
- **Window field**: `remoteFeatureName: 'schemaUi'`.
- **Adaptation**: `toFeatureModule()` wraps `EntityPage` and injects `{ entity: 'users', apiBase, … }`.
- **Fetch overlay**: `SchemaUiFetchGate` while Forms windows are mounted.
- **E2E**: `tests/schema-ui-forms.spec.ts`.

## Adding a new feature

1. **Create feature folder**: `src/features/<Name>/` with component and `*.test.tsx`.

2. **Register in componentLoader**: Add to `src/core/utils/componentLoader.ts`:
   ```
   export const componentLoader = {
     YourFeature: () => import('~/features/YourFeature/YourFeature'),
   };
   ```
   ⚠️ **Important**: The key (e.g., `'YourFeature'`) must exactly match the `lazyLoadComponent` parameter you use in `addWindow()` calls.

3. **Add constants**: Update `src/constants.ts`:
   - `COMPONENT_NAMES.YOUR_FEATURE`: Display name for the window
   - `REDUCER_NAMES.YOUR_FEATURE`: Reducer name (if using Redux)
   - `APP_STRINGS.BUTTON_ADD_YOUR_FEATURE`: Button label
   - `YOUR_FEATURE_STRINGS`: Feature-specific UI text

4. **Add Header button**: In `src/app/Header.tsx`:
   ```
   const handleAddYourFeature = useCallback(() => {
     const id = uuidv4();

     dispatch(
       addWindow({
         id,
         name: COMPONENT_NAMES.YOUR_FEATURE,
         lazyLoadComponent: 'YourFeature', // Must match componentLoader key!
         layout: undefined,
         lazyLoadReducerName: REDUCER_NAMES.YOUR_FEATURE, // Optional
       })
     );
   }, [dispatch]);
   ```

5. **Add E2E spec**: Create `tests/<name>.spec.ts` for end-to-end testing. Use centralized test selectors from `src/shared/testSelectors.ts` for all `data-testid` values. Call `closeAllWindows(page)` from `~/tests/helpers` when tests assume an empty initial state.

## Adding a new remote feature

1. Expose a default `FeatureModule` (or a page component that `toFeatureModule()` can adapt) from a federation container.
2. Add remote config in `src/app-shell/loadRemoteFeature.ts` (`name`, `kind`, `expose`, entry URL builder).
3. Add URL helpers / env defaults in `src/app-shell/remoteUrls.ts` and `.env.example`.
4. Open windows with `remoteFeatureName` (see Header “Add Analytics” / “Add Forms”).
5. Share React (and Redux if needed) as singletons; enable CORS on the remote origin.
6. Cover load failures and happy path in unit / E2E tests (`tests/micro-frontends.spec.ts` pattern).

Full topology and troubleshooting: [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md).

## Adding Desktop Actions (IMPORTANT!)

If you need to add a new action to `DesktopSlice` that modifies windows or layouts:

1. **Add the action** to `src/features/Desktop/DesktopSlice.ts`
2. **Register it in middleware** at `src/core/middleware/desktopStorageMiddleware.ts`: import the action and add `yourNewAction.match(action)` to the if condition.

⚠️ **WARNING**: If you don't register the action in the middleware, your changes won't be saved to localStorage and will be lost on page reload!

## Test Selectors

All `data-testid` values are centralized in `src/shared/testSelectors.ts`:

Use `TEST_SELECTORS` and `getFormFieldTestId` from `~/shared/testSelectors` in both components and E2E tests.

This ensures consistency and makes refactoring easier.

## Running tests

- **Unit**: `npm run test:unit`
- **E2E**: `npm run test:e2e` (Playwright starts the built dashboard on `:3000` and analytics on `:3002` via `scripts/start-e2e-servers.sh`)
- **Memory**: `npm run test:memory`
