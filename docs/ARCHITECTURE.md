# Architecture

This document describes the architectural patterns and design decisions behind the desktop-ui modular SPA starter.

---

## Overview

This project explores a feature-based modular architecture for React applications, focusing on preventing monolithic SPA growth through:

- Dynamic reducer injection
- Lazy loading
- Feature isolation
- Performance-aware rendering

---

## Project Structure

```
src/
├── app/        → Application bootstrap & routing
│   ├── App.tsx
│   ├── Header.tsx
│   └── FooterTaskbar.tsx
├── core/       → Infrastructure, store configuration, runtime logic
│   ├── store.ts
│   ├── hooks/           # useLazyLoadReducer, useKeyboardShortcuts, app hooks
│   ├── middleware/      # desktopStorageMiddleware
│   ├── contexts/        # ThemeContext
│   └── utils/           # reducerManager, lazyLoadReducer, componentLoader
├── shared/     → Reusable components & utilities
│   ├── components/      # Window, ErrorBoundary, Icons, Loader, ComponentLoader
│   ├── forms/           # Form field components (TextField, NumberField, etc.) – used by FormEditor and any feature with forms
│   ├── utils/           # storage, mockApi
│   ├── constants.ts
│   └── testSelectors.ts
└── features/   → Independent feature modules
    ├── Desktop/         # Grid, windows, layouts
    ├── Counter/
    ├── FormEditor/
    ├── Notes/
    ├── Timer/
    └── SimpleExample/
```

---

## Core Architectural Patterns

### 1. Feature-Based Module Structure

Each feature is self-contained with clear boundaries:

```
src/features/FeatureName/
├── __tests__/
│   ├── unit/           # Jest unit tests
│   └── e2e/            # Playwright E2E tests
├── FeatureName.tsx     # Component
├── FeatureNameSlice.ts # Redux slice (optional)
└── README.md           # Feature documentation
```

**Benefits:**
- Clear ownership and responsibility
- Easy to locate and modify feature code
- Simple to add/remove features
- Tests co-located with implementation

**Trade-offs:**
- Requires discipline to maintain boundaries
- Initial setup overhead per feature

---

### 2. Dynamic Reducer Injection

Instead of a static Redux store, reducers are injected at runtime when features are loaded.

**Implementation:**
- Custom `reducerManager` handles adding/removing reducers
- `useLazyLoadReducer` hook injects reducer when component mounts
- Reducer is removed when last instance of feature unmounts

**Benefits:**
- Smaller initial bundle size
- No unused state in memory
- Independent feature evolution
- Cleaner state tree

**Trade-offs:**
- More complex store setup
- Optional typing for dynamic slices: `state[featureName]?.value`
- Requires coordination of reducer keys

See [ADR 0001: Dynamic Reducer Injection](./decisions/0001-dynamic-reducer-injection.md)

---

### 3. Lazy Loading & Code Splitting

Features are loaded on demand using dynamic imports and a cached lazy component registry:

```
// src/core/utils/componentLoader.ts
export const componentLoader = {
  Counter: () => import('~/features/Counter/Counter'),
  FormEditor: () => import('~/features/FormEditor/FormEditor'),
  // ...
};

// getLazyComponent() returns cached lazy components to avoid remounts on re-renders
export function getLazyComponent(name: ComponentNames): LazyExoticComponent;
```

The `ComponentLoader` component (`src/shared/components/ComponentLoader/`) wraps lazy components in `Suspense` with a loader fallback. Desktop uses it to render each window's content.

**Loading Flow:**
1. User clicks "Add Feature" button
2. `addWindow` action dispatched with `lazyLoadComponent` key
3. Desktop renders `<ComponentLoader componentName={...} ... />`
4. Component dynamically imported via `getLazyComponent()` (cached per name)
5. Reducer injected (if specified)
6. Component rendered in window

**Benefits:**
- Reduced initial bundle size
- Faster initial page load
- Better perceived performance
- Scales well with many features

**Trade-offs:**
- Slight delay on first feature load
- More complex component registration

---

### 4. Middleware-Based Persistence

State persistence is handled by Redux middleware, keeping reducers pure.

**Implementation:**
```
// desktopStorageMiddleware.ts
if (
  addWindow.match(action) ||
  removeWindow.match(action) ||
  updateLayouts.match(action)
) {
  // Save to localStorage after state update
  localStorage.setItem('desktopState', JSON.stringify(state.desktop));
}
```

**Benefits:**
- Reducers stay pure and testable
- Single source of truth for persistence logic
- Easy to swap storage (localStorage → IndexedDB)
- No backend required

**Trade-offs:**
- Limited to ~5MB in localStorage
- No multi-device sync
- Must handle corrupted data gracefully

See [ADR 0002: Local Storage Persistence](./decisions/0002-local-storage-persistence.md)

---

### 5. Isolated Error Boundaries

Each window has its own error boundary to prevent cascading failures.

**Implementation:**
```
<ErrorBoundary key={window.id}>
  <LazyComponent />
</ErrorBoundary>
```

**Benefits:**
- One broken feature doesn't crash the app
- Better user experience
- Easier debugging (isolated failures)
- App remains responsive

**Trade-offs:**
- Users must manually reset/close failed windows
- Need error reporting integration for production

See [ADR 0003: Error Boundary Per Window](./decisions/0003-error-boundary-per-window.md)

---

## State Management

### Store Structure

```plaintext
desktop: { windows, layouts, focusedWindowId }
CounterReducer?: { value: number }
NotesReducer?: { notes: Note[] }
// Dynamic feature slices injected at runtime
```

### State Flow

1. **Window Creation:**
   - User action → `addWindow` dispatched
   - Desktop slice updated with new window
   - Middleware persists to localStorage
   - Component lazy loaded
   - Reducer injected (if needed)

2. **Feature State:**
   - Feature dispatches actions to its own slice
   - Reducer updates feature state
   - Component re-renders

3. **Window Removal:**
   - User closes window → `removeWindow` dispatched
   - Desktop slice updated
   - Middleware persists
   - If last instance: reducer removed from store

---

## Performance Considerations

### Bundle Optimization

- **Initial bundle:** Only shell + Desktop component
- **Feature bundles:** Loaded on demand
- **Shared dependencies:** Automatically code-split by webpack

### Memory Management

- **Reducer cleanup:** Unused reducers removed from store
- **Component unmounting:** Proper cleanup in useEffect
- **Memory leak prevention:** `useRef` for async operations

### Rendering Optimization

- **React.memo:** Used for expensive components
- **useCallback/useMemo:** For stable references
- **Error boundaries:** Prevent unnecessary re-renders on errors

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

- Test components in isolation
- Mock Redux store
- Test reducer logic
- Test custom hooks

### E2E Tests (Playwright)

- Test full user workflows
- Test window interactions
- Test persistence
- Test error scenarios

### Architectural Tests

- Validate feature isolation
- Test dynamic reducer injection
- Test lazy loading behavior
- Memory leak detection

---

## Scalability Patterns

### Adding New Features

1. Create feature folder under `src/features/`
2. Implement component (optionally with Redux slice)
3. Register in `src/core/utils/componentLoader.ts`
4. Add button in Header
5. Write tests

No changes to core store or routing required.

### Multi-Team Development

- Each team owns specific features
- Clear boundaries prevent conflicts
- Independent deployment possible (with module federation)
- Shared components in `src/components/`

### Long-Term Maintenance

- Features can be deprecated/removed easily
- Refactoring isolated to feature boundaries
- Clear ownership and documentation
- Type safety with TypeScript

---

## Trade-Offs & Limitations

### When This Architecture Works Well

✅ Large enterprise applications
✅ Multi-team development
✅ Long-term maintainability focus
✅ Feature isolation requirements
✅ Performance-critical applications

### When This Architecture Is Overkill

❌ Small applications (<10 components)
❌ Rapid prototypes
❌ Simple CRUD dashboards
❌ Single-developer projects
❌ Short-lived applications

---

## Future Considerations

### Potential Enhancements

- **Module Federation:** Runtime feature loading from separate deployments
- **Independent Deployments:** Deploy features independently
- **Advanced Instrumentation:** Performance monitoring per feature
- **DevTools:** Visualize injected modules and state
- **Micro-frontends:** Full feature independence with separate builds

### Known Limitations

- Increased initial complexity
- Learning curve for new developers
- More boilerplate per feature
- Requires architectural discipline

---

## Related Documentation

- [Architecture Decision Records](./decisions/0001-dynamic-reducer-injection.md) - Detailed design decisions
- [Best Practices](./BEST_PRACTICES.md) - Code quality guidelines
- [Feature Components](./FEATURE_COMPONENTS.md) - How to add features
- [Middleware Persistence](./MIDDLEWARE_PERSISTENCE.md) - Persistence patterns
- [Performance](./PERFORMANCE.md) - Performance optimization guide

---

## Conclusion

This architecture prioritizes:

1. **Scalability** over simplicity
2. **Maintainability** over rapid development
3. **Isolation** over tight integration
4. **Long-term** over short-term gains

It demonstrates how to build large-scale React applications that remain maintainable as they grow.
