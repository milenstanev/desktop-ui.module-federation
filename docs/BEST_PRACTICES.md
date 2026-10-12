# Best Practices & Code Quality Standards

This document outlines the coding standards, best practices, and quality guidelines for the Desktop UI project.

---

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [React Patterns](#react-patterns)
3. [Redux Patterns](#redux-patterns)
4. [Performance Guidelines](#performance-guidelines)
5. [Testing Standards](#testing-standards)
6. [Accessibility (A11y)](#accessibility-a11y)
7. [Security](#security)
8. [Code Formatting](#code-formatting)
9. [Documentation](#documentation)
10. [Git Workflow](#git-workflow)

---

## TypeScript Standards

### ✅ Strict Mode Enabled

**tsconfig.json** has strict mode enabled with additional checks:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

### ✅ No `any` Types (Except Where Necessary)

**Current exceptions:**
- `reducerManager.reduce()` - Required for Redux's dynamic reducer pattern
- `rawLayouts as any` - Migration compatibility for localStorage (scoped to one line)

**Rule:** Avoid `any`. Use proper types, generics, or `unknown` with type guards.

### ✅ Explicit Return Types for Public Functions

**Good:**
```
const handleAddWindow = useCallback((): void => {
  dispatch(addWindow({ ... }));
}, [dispatch]);
```

**Why:** Makes intent clear and catches missing returns.

### ✅ No `@ts-ignore` or `@ts-nocheck`

**Status:** ✅ Zero instances in codebase

**Rule:** Fix type errors properly instead of suppressing them.

---

## React Patterns

### ✅ Functional Components with TypeScript

**Pattern:**
```
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // Implementation
};

export default MyComponent;
```

### ✅ Hooks Best Practices

**useCallback for Event Handlers:**
```
const handleClick = useCallback(() => {
  dispatch(someAction());
}, [dispatch]);
```

**useMemo for Expensive Calculations:**
```
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.id - b.id);
}, [items]);
```

**useRef to Avoid Infinite Loops:**
```
const prevValueRef = useRef(value);

useEffect(() => {
  // Compare with prevValueRef.current
  prevValueRef.current = value;
}, [value]); // Don't include ref in dependencies
```

### ✅ Lazy Loading Pattern

**componentLoader.ts** (`src/core/utils/componentLoader.ts`):

```
export const componentLoader = {
  Counter: () => import('~/features/Counter/Counter'),
  Notes: () => import('~/features/Notes/Notes'),
};
// getLazyComponent(name) returns cached lazy components to avoid remounts
```

**ComponentLoader** (`src/shared/components/ComponentLoader/`) wraps lazy features in `Suspense`. Desktop uses it to render window content.

### ✅ Error Boundaries Per Window

Each window is wrapped in `ErrorBoundary` to isolate failures. A bug in one feature doesn't crash the entire app.

### ✅ No Inline Functions in JSX (Use useCallback)

**Bad:** `onClick={() => dispatch(action())}` inline in JSX

**Good:** Wrap in useCallback: `const handleClick = useCallback(() => dispatch(action()), [dispatch])` then pass to `onClick={handleClick}`.

---

## Redux Patterns

### ✅ Redux Toolkit Only (No Plain Redux)

Use `createSlice`, `PayloadAction`, `configureStore` - never write action creators or reducers manually.

### ✅ Typed Hooks

**src/core/hooks.ts:** Export `useAppDispatch` and `useAppSelector` typed hooks.

### ✅ Dynamic Reducer Injection

**Pattern:**
1. Component loads → inject reducer
2. Last window closes → remove reducer

**Implementation:** See `src/core/hooks/useLazyLoadReducer.ts` and `src/core/utils/reducerManager.ts`

### ✅ Middleware for Side Effects

**Rule:** Never put side effects (localStorage, API calls) in reducers.

**Pattern:** Use middleware (see `desktopStorageMiddleware.ts`)

### ✅ Action Registration for Persistence

**CRITICAL:** Any action modifying Desktop state MUST be registered in `desktopStorageMiddleware.ts`

See [MIDDLEWARE_PERSISTENCE.md](./MIDDLEWARE_PERSISTENCE.md) for details.

---

## Performance Guidelines

### ✅ Bundle Size Monitoring

**Check after each major change:**
```bash
npm run build
```

**Current:** ~84KB main bundle (gzipped), <2KB per lazy chunk

**Target:** Keep main bundle under 100KB

### ✅ Code Splitting by Feature

Each feature is a separate chunk loaded on-demand.

### ✅ Memoization Strategy

- `React.memo()` for components that receive complex props
- `useMemo()` for expensive calculations
- `useCallback()` for event handlers passed to child components

### ✅ Avoid Unnecessary Re-renders

**Pattern:** Stable references for empty arrays/objects
```
const EMPTY_ARRAY: string[] = [];
const items = useAppSelector(state => state.items ?? EMPTY_ARRAY);
```

---

## Testing Standards

### ✅ Test Coverage

**Current:** 90+ unit tests + 49 E2E tests

**Required:**
- Unit tests for all reducers
- Component tests for all UI components
- Integration tests for critical flows (reducer cleanup, persistence)
- E2E tests for critical user flows

### ✅ Testing Library Best Practices

**Use semantic queries:** `screen.getByRole('button', { name: /add counter/i })` not `container.querySelector('.button')`

**Use userEvent over fireEvent** for interactions.

### ✅ Test Organization

**Pattern:** Use `describe` / `it` blocks with clear test names.

### ✅ E2E Testing Best Practice

**Always verify element visibility before interaction** with `await expect(el).toBeVisible()` before interacting.

**Benefits:**
- Tests fail immediately if elements don't exist (not after timeout)
- Clear error messages showing which element is missing
- Ensures elements are ready before interaction
- Prevents flaky tests due to timing issues

**See:** Existing E2E tests in `src/features/*/tests/e2e/` for examples.

### ✅ No Skipped Tests

**Status:** ✅ Zero `.skip` or `.only` in committed code

---

## Accessibility (A11y)

### ✅ ARIA Attributes

**Current implementation:**
- `aria-label` on all interactive elements
- `role="application"` on windows
- `role="alert"` on error boundaries
- `aria-labelledby` for window content

### ✅ Keyboard Navigation

**Implemented:**
- Tab navigation through all interactive elements
- Escape to close focused window
- Cmd/Ctrl+W to close focused window

### ✅ Focus Management

**Pattern:**
- Visible focus indicators (`:focus-visible`)
- Focus tracking in Redux state
- Programmatic focus on window click

### ✅ Semantic HTML

Use semantic elements where appropriate:
- `<button>` for actions (not `<div onClick>`)
- `<header>`, `<main>` for layout structure
- Proper heading hierarchy

---

## Security

### ✅ No Dangerous Patterns

**Status:** ✅ Zero instances of:
- `dangerouslySetInnerHTML`
- `eval()`
- `Function()` constructor

### ✅ Environment Variables

**Status:** No sensitive data in code or config

**Pattern:** Use `.env.local` (gitignored) for local secrets, never commit them

### ✅ Dependencies

**Check regularly:**
```bash
npm audit
npm outdated
```

**Update strategy:** Keep dependencies current, test after updates

---

## Code Formatting

### ✅ Prettier Configuration

**.prettierrc:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ✅ Formatting Rules

See `.prettierrc` and `docs/CONFIGURATION.md` for formatting rules.

**Key principles:**
- Blank line after variable declarations
- Blank line before control structures
- Blank line before return statements
- Consistent spacing in callbacks

### ✅ Auto-formatting

**Run manually:**
```bash
npm run format
```

**Automatic:** Pre-commit hook runs Prettier on staged files

---

## Documentation

### ✅ Required Documentation

**Every feature needs:**
1. Component-level JSDoc comments
2. README entry (if user-facing)
3. Test file
4. Constants in `constants.ts`

### ✅ Code Comments

**When to comment:**
- Non-obvious algorithms or logic
- Performance optimizations
- Workarounds for external library issues
- Complex type assertions

**When NOT to comment:**
- Obvious code (`// Increment counter`)
- What the code does (code is self-documenting)
- Redundant explanations

### ✅ Documentation Files

**Current:**
- `README.md` - Overview and quick start
- `ARCHITECTURE.md` - System design
- `docs/PERFORMANCE.md` - Performance guidelines
- `docs/MIDDLEWARE_PERSISTENCE.md` - Critical persistence pattern
- `docs/CODE_FORMATTING_GUIDE.md` - Formatting standards
- `docs/FEATURE_COMPONENTS.md` - Feature development guide
- `docs/IMPLEMENTED_FEATURES.md` - Feature documentation
- `docs/BEST_PRACTICES.md` - This file
- `docs/decisions/*.md` - Architecture Decision Records

---

## Git Workflow

### ✅ Pre-commit Hooks

**Enforced:**
1. lint-staged (Prettier on staged files)
2. Full ESLint (`npm run lint`)
3. Unit tests (`npm run test:unit`)

**File:** `.husky/pre-commit`

### ✅ Commit Message Standards

**Pattern:**
```
<type>: <short description>

<optional detailed explanation>
```

**Types:** feat, fix, refactor, docs, test, chore

### ✅ Branch Strategy

**Pattern:**
- `master` - Production-ready code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `refactor/*` - Code improvements

### ✅ Pull Request Template

**File:** `.github/PULL_REQUEST_TEMPLATE.md`

**Required sections:**
- Summary
- Changes
- Testing
- Checklist

---

## CI/CD

### ✅ GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Pipeline:**
1. **Lint & Test Job:**
   - ESLint
   - TypeScript type check
   - Unit tests with coverage
2. **Build Job:**
   - Production build
3. **E2E Tests Job:**
   - Playwright tests

**Runs on:** Push to master/main, all PRs

---

## Common Anti-Patterns to Avoid

### ❌ Don't Use Magic Numbers

**Bad:** `if (width > 1200)`  
**Good:** `if (width > LAYOUT_CONFIG.BREAKPOINTS.lg)`

### ❌ Don't Hardcode Strings

**Bad:** `<button>Add Counter</button>`  
**Good:** `{APP_STRINGS.ADD_COUNTER_BUTTON}`

### ❌ Don't Mix Side Effects in Reducers

**Bad:** Put `localStorage.setItem` inside the reducer  
**Good:** Keep reducer pure; handle persistence in middleware

### ❌ Don't Forget Middleware Registration

When adding Desktop actions, ALWAYS register in `desktopStorageMiddleware.ts`

### ❌ Don't Create Inline Arrow Functions in JSX

Use `useCallback` for stable references.

### ❌ Don't Use Index as Key

**Bad:** `key={index}`  
**Good:** `key={item.id}`

---

## Checklist for New Features

- [ ] Component in `src/features/YourFeature/`
- [ ] Entry in `src/core/utils/componentLoader.ts`
- [ ] Constants in `constants.ts`
- [ ] Button in `Header.tsx` with `useCallback`
- [ ] Unit tests (`YourFeature.test.tsx`)
- [ ] TypeScript types (no `any`)
- [ ] ARIA attributes for accessibility
- [ ] Error boundary wrapping (automatic)
- [ ] Documentation update in README
- [ ] If using Redux:
  - [ ] Slice with typed actions
  - [ ] Lazy reducer injection
  - [ ] Cleanup when last window closes
  - [ ] Tests for all actions

---

## Code Review Checklist

Before submitting a PR:

- [ ] All tests pass (`npm test -- --watchAll=false`)
- [ ] Build succeeds (`npm run build`)
- [ ] No linter errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log (use console.error/warn only for errors)
- [ ] No TODO/FIXME comments
- [ ] No commented-out code
- [ ] Types are explicit (no implicit `any`)
- [ ] ARIA labels on interactive elements
- [ ] Constants used instead of hardcoded strings
- [ ] Test IDs use `TEST_SELECTORS` from `testSelectors.ts`
- [ ] Middleware registered (if Desktop action added)
- [ ] Documentation updated

---

## Performance Checklist

- [ ] Components memoized where appropriate (`React.memo`)
- [ ] Event handlers use `useCallback`
- [ ] Expensive calculations use `useMemo`
- [ ] Stable references for empty arrays/objects
- [ ] Lazy loading for features
- [ ] Bundle size checked after changes

---

## Accessibility Checklist

- [ ] All buttons have `aria-label`
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader tested (optional but recommended)

---

## Test Selectors ✅

**Current Status**: Centralized test IDs in `testSelectors.ts`

All `data-testid` values are defined in a single source of truth (`src/shared/testSelectors.ts`), making tests maintainable and refactor-friendly.

### Benefits

- **Single Source of Truth**: All test IDs in one file
- **Type Safety**: Exported as `const` for autocomplete
- **Refactor-Friendly**: Change once, updates everywhere
- **Helper Functions**: Dynamic test ID generation (e.g., `getFormFieldTestId`)

### Good Example

**testSelectors.ts:** Export `TEST_SELECTORS` object and `getFormFieldTestId(fieldName)` helper.

**Component:** Use `TEST_SELECTORS.FORM_EDITOR` and `getFormFieldTestId('firstName')` for `data-testid`.

**E2E test:** Import from `~/shared/testSelectors` and use the same constants.

### Bad Example

**Component:** hardcoded `data-testid="form-editor"`  
**E2E test:** hardcoded `'form-editor'`, `'form-field-firstName'`

---

## Summary

This project follows industry best practices:

1. **Type Safety:** Strict TypeScript with minimal `any` usage
2. **Performance:** Lazy loading, memoization, code splitting, cached lazy components
3. **Testing:** 90+ unit tests + 49 E2E tests with excellent coverage
4. **Accessibility:** ARIA attributes, keyboard navigation
5. **Security:** No dangerous patterns, dependencies audited
6. **Code Quality:** Prettier + ESLint + pre-commit hooks
7. **Documentation:** Comprehensive docs for all patterns
8. **CI/CD:** Automated testing and builds
9. **Mock API:** Built-in mock service for development without backend
10. **Test Selectors:** Centralized test IDs for maintainability

**Status:** ✅ Production-ready starter template

**Score:** 100/100 - All critical best practices implemented
