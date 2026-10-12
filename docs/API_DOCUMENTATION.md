# API Documentation

This document provides an overview of the key APIs and utilities in the Desktop UI project. All functions, hooks, and components are documented with JSDoc/ESDoc comments for better IDE support and developer experience.

## Table of Contents

- [Hooks](#hooks)
- [Utilities](#utilities)
- [Context](#context)
- [Redux](#redux)

---

## Hooks

### useKeyboardShortcuts

Provides a reusable hook for handling keyboard shortcuts. Supports Escape and Cmd/Ctrl+W for closing windows.

**Location:** `src/core/hooks/useKeyboardShortcuts.ts`

**Parameters:**
- `onEscape?: () => void` - Callback function to execute when Escape is pressed
- `onClose?: () => void` - Callback function to execute when Cmd/Ctrl+W is pressed
- `enabled?: boolean` - Whether the shortcuts are enabled (default: true)

**Example:**
```
import { useKeyboardShortcuts } from '~/hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts(
    () => console.log('Escape pressed'),
    () => console.log('Cmd/Ctrl+W pressed'),
    true
  );
}
```

### useLazyLoadReducer

Injects a feature's Redux reducer when the feature component mounts. The reducer is automatically added to the store's reducer manager.

**Location:** `src/core/hooks/useLazyLoadReducer.ts`

**Parameters:**
- `lazyLoadReducerName: string` - Unique name for the reducer (must match the slice name)
- `featureReducer: Reducer` - The Redux reducer to inject

**Example:**
```
import useLazyLoadReducer from '~/hooks/useLazyLoadReducer';
import counterReducer from './CounterSlice';

function Counter() {
  useLazyLoadReducer({
    lazyLoadReducerName: 'counter',
    featureReducer: counterReducer,
  });

  const count = useAppSelector((state) => state.counter.value);
  // ...
}
```

### useAppDispatch

Typed version of Redux's `useDispatch` hook. Returns a dispatch function typed with `AppDispatch`.

**Location:** `src/core/hooks.ts`

**Example:**
```
import { useAppDispatch } from '~/core/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  dispatch(someAction());
}
```

### useAppSelector

Typed version of Redux's `useSelector` hook. Provides type-safe access to the Redux store state.

**Location:** `src/core/hooks.ts`

**Example:**
```
import { useAppSelector } from '~/core/hooks';

function MyComponent() {
  const count = useAppSelector((state) => state.counter.value);
}
```

### useTheme

Access theme context from any component. Must be used within a `ThemeProvider`.

**Location:** `src/contexts/ThemeContext.tsx`

**Returns:**
- `theme: Theme` - Current active theme ('light' | 'dark' | 'gradient')
- `setTheme: (theme: Theme) => void` - Set a specific theme
- `toggleTheme: () => void` - Toggle between available themes

**Example:** `const { theme, setTheme, toggleTheme } = useTheme()` then use in JSX (e.g. `onClick={toggleTheme}`).

---

## Utilities

### componentLoader

Centralized registry for lazy-loaded feature components. Each entry returns a dynamic import that enables code splitting.

**Location:** `src/core/utils/componentLoader.ts`

**Available Components:**
- `SimpleExample`
- `Counter`
- `FormEditor`
- `Notes`
- `Timer`

**getLazyComponent(componentName):** Returns a cached lazy component for the given name. Reuses the same component reference across renders to prevent unnecessary remounts and loader flashes (e.g. when focusing windows).

**Example:** `const LazyComponent = getLazyComponent('Counter')`

**Adding a New Feature:**
1. Add an entry to `componentLoader` with the component's dynamic import
2. The component will be automatically code-split
3. Use the key when creating windows in Desktop

### ComponentLoader

Reusable component that wraps a lazy-loaded feature in `Suspense` with a loader fallback. Used by Desktop to render each window's content.

**Location:** `src/shared/components/ComponentLoader/ComponentLoader.tsx`

**Props:**
- `componentName: ComponentNames` - Key from componentLoader (e.g. 'Counter', 'Notes')
- `windowId: string` - Window ID
- `windowName: string` - Display name
- `lazyLoadReducerName?: string` - Reducer name for lazy injection (optional)

**Example:** Import ComponentLoader, pass componentName, windowId, windowName, lazyLoadReducerName.

### lazyLoadReducer

Registers a reducer under the specified key with the store's reducer manager and replaces the store's root reducer.

**Location:** `src/core/utils/lazyLoadReducer.ts`

**Parameters:**
- `store: StoreWithReducerManager` - Redux store with reducer manager
- `key: string` - Unique key for the reducer (must match slice name)
- `reducer: Reducer` - The Redux reducer to inject

**Example:**
```
import { lazyLoadReducer } from '~/utils/lazyLoadReducer';

lazyLoadReducer(store, 'counter', counterReducer);
// Now state.counter is available
```

### removeLazyLoadedReducer

Removes the reducer for the specified key and replaces the root reducer so the slice's state is no longer in the tree.

**Location:** `src/core/utils/lazyLoadReducer.ts`

**Parameters:**
- `store: StoreWithReducerManager` - Redux store with reducer manager
- `key: string` - Key of the reducer to remove

**Example:**
```
import { removeLazyLoadedReducer } from '~/utils/lazyLoadReducer';

removeLazyLoadedReducer(store, 'counter');
// Now state.counter is undefined
```

### safeParseJson

Safely parse JSON from localStorage with fallback handling. Returns the fallback value on parse errors or invalid data.

**Location:** `src/shared/utils/storage.ts`

**Type Parameters:**
- `T` - Type of the expected data

**Parameters:**
- `key: string` - localStorage key to read from
- `fallback: T` - Value to return if parsing fails or data is invalid
- `validator?: (value: unknown) => value is T` - Optional type guard function to validate parsed data

**Returns:** Parsed data of type T, or fallback if parsing fails

**Example:**
```
import { safeParseJson } from '~/utils/storage';

// Simple usage
const data = safeParseJson('myKey', { default: 'value' });

// With validator
const isUserData = (value: unknown): value is UserData => {
  return typeof value === 'object' && value !== null && 'id' in value;
};
const user = safeParseJson('user', null, isUserData);
```

### Mock API Functions

**Location:** `src/shared/utils/mockApi.ts`

#### fetchUsers
Fetches mock user data.

**Returns:** `Promise<UserData[]>`

#### fetchFormSchema
Fetches mock form schema.

**Returns:** `Promise<FormSchema>`

#### updateUser
Updates mock user data.

**Parameters:**
- `userId: string` - User ID to update
- `data: Partial<UserData>` - Data to update

**Returns:** `Promise<{ success: boolean; user: UserData }>`

#### simulateApiError
Simulates an API error for testing error handling.

**Returns:** `Promise<never>` (always throws)

---

## Context

### ThemeProvider

Wraps the application to provide theme context. Automatically applies theme to document root and persists changes.

**Location:** `src/contexts/ThemeContext.tsx`

**Props:**
- `children: React.ReactNode` - Child components to wrap

**Example:**
Wrap your app in ThemeProvider.

---

## Redux

### Reducer Manager

Dynamic Redux reducer injection system that allows adding and removing reducers at runtime.

**Location:** `src/core/utils/reducerManager.ts`

**Interface:**
```
interface ReducerManager {
  getReducerMap: () => { [key: string]: Reducer };
  reduce: (state: any, action: any) => any;
  add: (key: string, reducer: Reducer) => void;
  remove: (key: string) => void;
}
```

**How It Works:**
1. Holds a mutable map of reducers and rebuilds the combined reducer when add() or remove() is called
2. Exposes a single reduce(state, action) that behaves like a normal root reducer
3. On remove(), queues keys for removal and strips them at the start of the next reduce() call

**Example:**
```
import { createReducerManager } from '~/utils/reducerManager';

const reducerManager = createReducerManager({
  desktop: desktopReducer,
});

// Add a reducer
reducerManager.add('counter', counterReducer);

// Remove a reducer
reducerManager.remove('counter');
```

---

## Type Definitions

### ComponentNames

Type representing all available component names in the component loader.

**Location:** `src/core/utils/componentLoader.ts`

```
type ComponentNames = 'SimpleExample' | 'Counter' | 'FormEditor' | 'Notes' | 'Timer';
```

### Theme

Available theme options.

**Location:** `src/contexts/ThemeContext.tsx`

```
type Theme = 'light' | 'dark' | 'gradient';
```

### StoreWithReducerManager

Redux store extended with reducer manager functionality.

**Location:** `src/core/store.ts`

```
interface StoreWithReducerManager extends EnhancedStore {
  reducerManager: ReducerManager;
}
```

---

## Best Practices

### Using Hooks

1. **Always use typed hooks**: Use `useAppDispatch` and `useAppSelector` instead of plain Redux hooks
2. **Lazy load reducers**: Use `useLazyLoadReducer` for features with their own state
3. **Keyboard shortcuts**: Use `useKeyboardShortcuts` for consistent keyboard handling

### Adding New Features

1. Create feature folder under `src/features/`
2. Add component to `componentLoader`
3. If feature needs state, create a slice and use `useLazyLoadReducer`
4. Add test selectors to `src/shared/testSelectors.ts`
5. Write unit and E2E tests

### Working with localStorage

1. **Always use safeParseJson**: Never use `JSON.parse` directly with localStorage
2. **Provide validators**: Use type guards for runtime type safety
3. **Handle errors gracefully**: Always provide sensible fallback values

### Theme Management

1. **Use ThemeProvider**: Wrap your app with ThemeProvider at the root
2. **Access with useTheme**: Use the hook to read/update theme
3. **Persist automatically**: Theme changes are automatically saved to localStorage

---

## IDE Support

All functions, hooks, and components are documented with JSDoc comments. This provides:

- **IntelliSense**: Hover over any function to see documentation
- **Type Safety**: TypeScript types are inferred from JSDoc
- **Parameter Hints**: See parameter descriptions while typing
- **Examples**: Code examples are shown in IDE tooltips

To get the best experience:
1. Use VS Code or WebStorm
2. Enable TypeScript language features
3. Hover over functions to see documentation
4. Use Cmd/Ctrl+Click to jump to definitions

---

## Additional Resources

- [Main README](../README.md)
