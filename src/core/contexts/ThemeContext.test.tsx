import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const THEME_VALUES = {
  LIGHT: 'light',
  DARK: 'dark',
  GRADIENT: 'gradient',
} as const;

const BUTTON_TEXT = {
  SET_DARK: 'Set dark',
  SET_LIGHT: 'Set light',
  TOGGLE: 'Toggle',
} as const;

const DOM_ATTRIBUTES = {
  DATA_THEME: 'data-theme',
} as const;

const ERROR_MESSAGES = {
  USE_THEME_OUTSIDE_PROVIDER: 'useTheme must be used within ThemeProvider',
} as const;

const CONSOLE_METHOD = 'error';

function TestConsumer() {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid={TEST_SELECTORS.THEME_DISPLAY}>{theme}</span>
      <button type="button" onClick={() => setTheme(THEME_VALUES.DARK)}>
        {BUTTON_TEXT.SET_DARK}
      </button>
      <button type="button" onClick={() => setTheme(THEME_VALUES.LIGHT)}>
        {BUTTON_TEXT.SET_LIGHT}
      </button>
      <button type="button" onClick={toggleTheme}>
        {BUTTON_TEXT.TOGGLE}
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to gradient theme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)).toHaveTextContent(
      THEME_VALUES.GRADIENT
    );
  });

  it('setTheme updates theme', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)).toHaveTextContent(
      THEME_VALUES.GRADIENT
    );
    await act(async () => {
      screen.getByText(BUTTON_TEXT.SET_DARK).click();
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)
      ).toHaveTextContent(THEME_VALUES.DARK);
    });
    await act(async () => {
      screen.getByText(BUTTON_TEXT.SET_LIGHT).click();
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)
      ).toHaveTextContent(THEME_VALUES.LIGHT);
    });
  });

  it('toggleTheme switches between light and dark', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)).toHaveTextContent(
      THEME_VALUES.GRADIENT
    );
    await act(async () => {
      screen.getByText(BUTTON_TEXT.TOGGLE).click();
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)
      ).toHaveTextContent(THEME_VALUES.LIGHT);
    });
    await act(async () => {
      screen.getByText(BUTTON_TEXT.TOGGLE).click();
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_SELECTORS.THEME_DISPLAY)
      ).toHaveTextContent(THEME_VALUES.DARK);
    });
  });

  it('sets data-theme on documentElement', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(
      document.documentElement.getAttribute(DOM_ATTRIBUTES.DATA_THEME)
    ).toBe(THEME_VALUES.GRADIENT);
    await act(async () => {
      screen.getByText(BUTTON_TEXT.SET_DARK).click();
    });
    await waitFor(() => {
      expect(
        document.documentElement.getAttribute(DOM_ATTRIBUTES.DATA_THEME)
      ).toBe(THEME_VALUES.DARK);
    });
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const consoleSpy = jest
      .spyOn(console, CONSOLE_METHOD)
      .mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      ERROR_MESSAGES.USE_THEME_OUTSIDE_PROVIDER
    );
    consoleSpy.mockRestore();
  });
});
