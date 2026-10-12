# ADR 0001: Dynamic Reducer Injection

## Status

Accepted

## Context

Windows can load different features (e.g. Counter, FormEditor, Notes), each with its own Redux slice. Loading all slices upfront would increase bundle size and state complexity.

## Decision

Use a reducer manager that supports adding and removing reducers at runtime. When a window with `lazyLoadReducerName` mounts, inject its reducer; when the last such window unmounts, remove the reducer.

## Consequences

- **Pros**: Smaller initial bundle, cleaner state when features are inactive
- **Cons**: Slightly more complex store setup; reducer keys must be coordinated
- **Note**: Store typings for dynamic slices require optional access (e.g. `state[lazyLoadReducerName]?.value`)
