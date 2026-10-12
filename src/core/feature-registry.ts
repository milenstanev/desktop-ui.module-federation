/**
 * Feature Registry
 *
 * Central registry for features (local and remote).
 * Used by the app shell to resolve components and inject reducers.
 */
import type { FeatureModule } from './feature-types';

const registry = new Map<string, FeatureModule>();

export function registerFeature(feature: FeatureModule): void {
  if (!feature?.name) {
    throw new Error('Feature must have a name');
  }
  registry.set(feature.name, feature);
}

export function getFeature(name: string): FeatureModule | undefined {
  return registry.get(name);
}

export function hasFeature(name: string): boolean {
  return registry.has(name);
}

export function listFeatures(): FeatureModule[] {
  return Array.from(registry.values());
}
