# Checklists (from docs/BEST_PRACTICES.md)

## Anti-patterns

- Magic numbers → `LAYOUT_CONFIG` / constants
- Hardcoded UI strings → `APP_STRINGS` / feature string maps
- `localStorage` inside reducers → middleware
- Desktop slice action not registered in `desktopStorageMiddleware`
- Inline arrow functions in JSX for handlers → `useCallback`
- `key={index}` → stable `item.id`

## New feature

- Folder `src/features/YourFeature/`
- Register in `src/core/utils/componentLoader.ts`
- Constants in `src/shared/constants.ts`
- Header button with `useCallback` + `addWindow`
- Unit tests; E2E for critical flow
- No `any`; ARIA on interactive elements
- If Redux: slice, lazy inject, cleanup, action tests

## PR / review

- `npm run test:unit`, `npm run lint`, `npm run format`, build when relevant
- No `console.log`, TODO/FIXME, commented-out code
- Explicit types; ARIA labels; constants; `TEST_SELECTORS`
- Middleware registered if Desktop state changed
- Docs updated if behavior or architecture changed

## Performance

- `React.memo` / `useCallback` / `useMemo` where it prevents real extra work
- Features stay lazy; check `npm run build` after large UI/deps changes
- Main bundle target: under 100KB gzipped
