---
name: desktop-ui-best-practices
description: >-
  Apply desktop-ui coding standards (TypeScript, React, Redux, a11y, security,
  formatting, git). Use when implementing, refactoring, reviewing, or adding
  code in this repository.
---

# desktop-ui best practices

Follow this project's documented standards. Prefer existing files over new patterns.

Canonical docs (read when the task needs detail):

- [docs/BEST_PRACTICES.md](../../../docs/BEST_PRACTICES.md)
- [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)
- Checklists and anti-patterns: [checklists.md](checklists.md)

## TypeScript

- Strict mode: no unused locals/params, no implicit returns.
- Avoid `any`. Use types, generics, or `unknown` + guards.
- Public functions: explicit return types.
- Never `@ts-ignore` / `@ts-nocheck`.
- Known `any` exceptions only: `reducerManager.reduce`, one localStorage layout migration line.

## React

- Functional components: `const X: React.FC<Props> = …` then default export.
- Event handlers: `useCallback`. Do not put inline arrows in JSX for dispatched actions.
- Expensive work: `useMemo`. Components with complex props: `React.memo`.
- Stable empty arrays/objects as module-level constants (do not allocate `[]` in render/selectors).
- Lazy features go through `componentLoader` + `ComponentLoader` (Suspense). Do not ad-hoc `lazy()` in Desktop.
- Window failures stay isolated (`ErrorBoundary` per window).

## Redux

- Redux Toolkit only (`createSlice`, `PayloadAction`). No hand-written action creators.
- Use `useAppDispatch` / `useAppSelector` from `~/core/hooks`.
- Reducers stay pure. Persistence and I/O live in middleware.
- New Desktop window/layout actions **must** be registered in `desktopStorageMiddleware.ts` or they will not persist. See [docs/MIDDLEWARE_PERSISTENCE.md](../../../docs/MIDDLEWARE_PERSISTENCE.md).
- Feature reducers: inject on load, remove when the last window of that type closes (`useLazyLoadReducer`).

## Imports, strings, IDs

- Alias: `~/…` → `src/…`.
- UI copy and layout numbers live in `src/shared/constants.ts` (`APP_STRINGS`, `LAYOUT_CONFIG`, etc.). No magic numbers or hardcoded button labels.
- `data-testid` values live in `src/shared/testSelectors.ts`. Never hardcode test ids in components or specs.

## A11y and security

- Interactive controls: real `<button>`s, `aria-label`, keyboard access, `:focus-visible`.
- Escape / Cmd+Ctrl+W close the focused window (existing shortcut hook).
- No `dangerouslySetInnerHTML`, `eval`, or `Function()`.
- Secrets only in gitignored env files (`.env.local`). Do not commit credentials.

## Formatting and git

- Prettier: semis, single quotes, tabWidth 2, trailingComma es5. Run `npm run format`.
- Commits: conventional `<type>: <short description>` (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`).
- Branches: `feature/*`, `bugfix/*`, `refactor/*`; production is `master`.
- Do not commit `console.log`, TODOs, or commented-out code in PRs.

## Commands before claiming done

```bash
npm run lint
npx tsc --noEmit
npm run test:unit
```

UI changes: exercise the flow in the browser (or Playwright) across related windows/routes.

## Related skills

- New local window/feature: `desktop-ui-features`
- Tests: `desktop-ui-testing`
- Remotes / Module Federation: `desktop-ui-module-federation`
