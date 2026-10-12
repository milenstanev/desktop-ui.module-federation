/**
 * Theme Context
 *
 * Provides theme management functionality across the application.
 * Supports three themes: light, dark, and gradient.
 * Theme preference is persisted to localStorage.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { theme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  LOCAL_STORAGE_THEME_KEY,
  INITIAL_STATE_CONFIG,
} from '~/features/Desktop/config';

/**
 * Available theme options
 */
export type Theme = 'light' | 'dark' | 'gradient';

const THEME_VALUES = {
  LIGHT: 'light' as Theme,
  DARK: 'dark' as Theme,
  GRADIENT: 'gradient' as Theme,
} as const;

const DOM_ATTRIBUTE_THEME = 'data-theme';
const ERROR_MESSAGE_USE_THEME = 'useTheme must be used within ThemeProvider';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (
      stored === THEME_VALUES.DARK ||
      stored === THEME_VALUES.LIGHT ||
      stored === THEME_VALUES.GRADIENT
    )
      return stored;
  } catch {
    // ignore
  }
  return INITIAL_STATE_CONFIG.defaultTheme;
}

/**
 * Theme context value interface
 */
interface ThemeContextValue {
  /** Current active theme */
  theme: Theme;
  /** Set a specific theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between available themes */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme Provider Component
 *
 * Wraps the application to provide theme context.
 * Automatically applies theme to document root and persists changes.
 *
 * @param props - Component props
 * @param props.children - Child components to wrap
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute(DOM_ATTRIBUTE_THEME, theme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) =>
      prev === THEME_VALUES.LIGHT ? THEME_VALUES.DARK : THEME_VALUES.LIGHT
    );
  }, []);

  const value: ThemeContextValue = { theme, setTheme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * Access theme context from any component.
 * Must be used within a ThemeProvider.
 *
 * @returns Theme context value with current theme and setter functions
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error(ERROR_MESSAGE_USE_THEME);
  return ctx;
}
