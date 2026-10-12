/**
 * Redux Hooks
 *
 * Type-safe versions of Redux hooks for use throughout the application.
 * These hooks are pre-typed with the application's RootState and AppDispatch types.
 *
 * @example
 * ```typescript
 * // Instead of useDispatch()
 * const dispatch = useAppDispatch();
 *
 * // Instead of useSelector()
 * const count = useAppSelector((state) => state.counter.value);
 * ```
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed version of useDispatch hook
 * Returns a dispatch function typed with AppDispatch
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Provides type-safe access to the Redux store state
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
