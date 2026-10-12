---
name: desktop-ui-testing
description: >-
  Write Jest, Testing Library, and Playwright tests for desktop-ui. Use when
  adding unit tests, E2E specs, test IDs, coverage, or debugging flaky tests.
---

# desktop-ui testing

## Commands

```bash
npm run test:unit          # Jest, watchAll=false (react-scripts)
npm run test:e2e           # Playwright (webServer starts host + analytics)
npm run test:all
```

Jest `testMatch` only picks `*.test.ts(x)` (and `__tests__/**/*.test.*`). Playwright specs are `*.spec.ts` — do not change `test:unit` to a runner that also loads `*.spec.ts`.

## Unit / component tests

- Reducers: every action, including “do not add duplicate window”.
- Components: render + user-visible behavior.
- Integration: reducer cleanup, localStorage middleware.
- Queries: `getByRole` / name, not CSS class scraping.
- Interactions: `@testing-library/user-event`, not `fireEvent`, unless there is no alternative.
- `describe` / `it` with behavior names.
- No committed `.skip` or `.only`.
- Alias `~/` works via Jest `moduleNameMapper` in `package.json`.

Colocation:

```
src/features/<Name>/__tests__/unit/<Name>.test.tsx
src/shared/…/*.test.tsx
src/core/…/*.test.ts
```

## E2E (Playwright)

- Config: `playwright.config.ts`. Memory suite is separate (`playwright.memory.config.ts`, tag `@memory`).
- `webServer` command: `./scripts/start-e2e-servers.sh` (serves `build/` on :3000 and analytics `dist/` on :3002 with CORS).
- Before click/fill: `await expect(locator).toBeVisible()`.
- Empty-desktop specs: `closeAllWindows(page)` from `~/tests/helpers`.
- Root specs: `tests/*.spec.ts`. Feature e2e: `src/**/__tests__/e2e/**/*.spec.ts`.
- Micro-frontends: `tests/micro-frontends.spec.ts` (load remote + reload persistence).

CI builds the host with `REACT_APP_ANALYTICS_REMOTE_URL=http://localhost:3002` and builds the analytics remote before Playwright.

## Test IDs

Single source: `src/shared/testSelectors.ts`.

```tsx
data-testid={TEST_SELECTORS.DESKTOP_CONTAINER}
data-testid={getFormFieldTestId('firstName')}
```

E2E imports the same constants. Never duplicate string literals.

## Coverage expectations

- New reducer → action tests.
- New UI feature → component test + E2E for the happy path.
- New Desktop persist action → middleware test.
