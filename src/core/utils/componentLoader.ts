import { lazy, LazyExoticComponent, ComponentType } from 'react';

/**
 * Component Loader
 *
 * Centralized registry for lazy-loaded feature components.
 * Each entry returns a dynamic import that enables code splitting.
 *
 * Use getLazyComponent(name) for cached lazy components to avoid
 * remounting on re-renders (e.g. when focusing windows).
 *
 * To add a new feature:
 * 1. Add an entry here with the component's dynamic import
 * 2. The component will be automatically code-split
 * 3. Use the key when creating windows in Desktop
 */
export const componentLoader = {
  SimpleExample: () => import('~/features/SimpleExample/SimpleExample'),
  Counter: () => import('~/features/Counter/Counter'),
  FormEditor: () => import('~/features/FormEditor/FormEditor'),
  Notes: () => import('~/features/Notes/Notes'),
  Timer: () => import('~/features/Timer/Timer'),
};

/**
 * Type representing all available component names in the loader
 */
export type ComponentNames = keyof typeof componentLoader;

const lazyComponentCache = new Map<
  ComponentNames,
  LazyExoticComponent<ComponentType<unknown>>
>();

/**
 * Returns a cached lazy component for the given name.
 * Reuses the same component reference across renders to prevent
 * unnecessary remounts and loader flashes (e.g. on window focus).
 */
export function getLazyComponent(
  componentName: ComponentNames
): LazyExoticComponent<ComponentType<unknown>> {
  let cached = lazyComponentCache.get(componentName);

  if (!cached) {
    const loader = componentLoader[componentName];

    if (!loader) {
      throw new Error(`Unknown component: ${componentName}`);
    }

    cached = lazy(() =>
      loader().then((module) => ({
        default: module.default as ComponentType<unknown>,
      }))
    );
    lazyComponentCache.set(componentName, cached);
  }

  return cached;
}
