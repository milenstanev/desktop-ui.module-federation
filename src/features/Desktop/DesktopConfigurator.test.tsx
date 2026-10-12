import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DesktopSlice, { applyDesktopConfig } from './DesktopSlice';
import DesktopConfigurator from './DesktopConfigurator';
import { parseDesktopSnapshot } from './desktopSnapshot';
import { ThemeProvider } from '~/core/contexts/ThemeContext';
import { APP_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import {
  DESKTOP_CONFIG_QUERY_PARAM,
  LOCAL_STORAGE_BOOTSTRAP_KEY,
} from './config';

jest.mock('./config', () => {
  const actual = jest.requireActual('./config');
  return {
    ...actual,
    INITIAL_STATE_CONFIG: {
      ...actual.INITIAL_STATE_CONFIG,
      initialWindows: [],
      initialLayouts: { xl: [], lg: [], md: [], sm: [] },
    },
  };
});

const mountConfigurator = () => {
  const appStore = configureStore({
    reducer: { Desktop: DesktopSlice },
  });
  render(
    <Provider store={appStore}>
      <ThemeProvider>
        <DesktopConfigurator />
      </ThemeProvider>
    </Provider>
  );
  return appStore;
};

describe('DesktopConfigurator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('applies pasted JSON as the dashboard and stores it as bootstrap', async () => {
    const appStore = mountConfigurator();

    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_BUTTON })
    );
    const textarea = screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_TEXTAREA);
    await userEvent.clear(textarea);
    await userEvent.paste(
      textarea,
      JSON.stringify([
        {
          id: 'pasted-timer',
          name: 'Timer',
          lazyLoadComponent: 'Timer',
        },
      ])
    );
    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_APPLY })
    );

    expect(appStore.getState().Desktop.desktopWindows[0].id).toBe(
      'pasted-timer'
    );
    expect(
      screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_STATUS)
    ).toHaveTextContent(APP_STRINGS.CONFIGURATOR_APPLIED);
    expect(localStorage.getItem(LOCAL_STORAGE_BOOTSTRAP_KEY)).toContain(
      'pasted-timer'
    );
  });

  it('copies a share URL from the auto-filled dashboard JSON', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const snapshot = parseDesktopSnapshot([
      {
        id: 'live-timer',
        name: 'Timer',
        lazyLoadComponent: 'Timer',
      },
    ]);
    const appStore = mountConfigurator();
    appStore.dispatch(applyDesktopConfig(snapshot!));

    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_BUTTON })
    );
    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_COPY_URL })
    );

    expect(
      screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_STATUS)
    ).toHaveTextContent(APP_STRINGS.CONFIGURATOR_URL_COPIED);
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain(`${DESKTOP_CONFIG_QUERY_PARAM}=`);
    expect(copied).toContain('live-timer');
  });

  it('copies a share URL for the open dashboard even if the editor JSON is invalid', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const snapshot = parseDesktopSnapshot([
      {
        id: 'live-timer',
        name: 'Timer',
        lazyLoadComponent: 'Timer',
      },
    ]);
    const appStore = mountConfigurator();
    appStore.dispatch(applyDesktopConfig(snapshot!));

    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_BUTTON })
    );
    const textarea = screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_TEXTAREA);
    await userEvent.clear(textarea);
    await userEvent.paste(textarea, '{ not json');
    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_COPY_URL })
    );

    expect(
      screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_STATUS)
    ).toHaveTextContent(APP_STRINGS.CONFIGURATOR_URL_COPIED);
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain(`${DESKTOP_CONFIG_QUERY_PARAM}=`);
    expect(copied).toContain('live-timer');
  });

  it('copies a desktopConfig share URL for valid JSON', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    mountConfigurator();

    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_BUTTON })
    );
    const textarea = screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_TEXTAREA);
    await userEvent.clear(textarea);
    await userEvent.paste(
      textarea,
      JSON.stringify([
        {
          id: 'share-timer',
          name: 'Timer',
          lazyLoadComponent: 'Timer',
        },
      ])
    );
    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_COPY_URL })
    );

    expect(
      screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_STATUS)
    ).toHaveTextContent(APP_STRINGS.CONFIGURATOR_URL_COPIED);
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain(`${DESKTOP_CONFIG_QUERY_PARAM}=`);
    expect(copied).toContain('share-timer');
  });

  it('shows an error for invalid JSON', async () => {
    mountConfigurator();

    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_BUTTON })
    );
    const textarea = screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_TEXTAREA);
    await userEvent.clear(textarea);
    await userEvent.paste(textarea, '{ not json');
    await userEvent.click(
      screen.getByRole('button', { name: APP_STRINGS.CONFIGURATOR_APPLY })
    );

    expect(
      screen.getByTestId(TEST_SELECTORS.DESKTOP_CONFIG_STATUS)
    ).toHaveTextContent(APP_STRINGS.CONFIGURATOR_INVALID);
  });
});
