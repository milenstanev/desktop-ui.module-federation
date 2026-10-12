/**
 * Safe JSON Parser for localStorage
 *
 * Safely parse JSON from localStorage with fallback handling.
 * Returns the fallback value on parse errors or invalid data.
 *
 * @template T - Type of the expected data
 * @param key - localStorage key to read from
 * @param fallback - Value to return if parsing fails or data is invalid
 * @param validator - Optional type guard function to validate parsed data
 * @returns Parsed data of type T, or fallback if parsing fails
 *
 * @example
 * ```typescript
 * // Simple usage
 * const data = safeParseJson('myKey', { default: 'value' });
 *
 * // With validator
 * const isUserData = (value: unknown): value is UserData => {
 *   return typeof value === 'object' && value !== null && 'id' in value;
 * };
 * const user = safeParseJson('user', null, isUserData);
 * ```
 */
export function safeParseJson<T>(
  key: string,
  fallback: T,
  validator?: (value: unknown) => value is T
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (validator && !validator(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}
