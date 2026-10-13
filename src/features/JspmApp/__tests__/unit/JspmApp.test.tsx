import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { buildIframeGuestUrl } from '~/app-shell/iframeBridge/protocol';
import { ThemeProvider } from '~/core/contexts/ThemeContext';
import { setupStore } from '~/core/store';
import JspmApp from '~/features/JspmApp/JspmApp';
import { DEFAULT_JSPM_APP_URL } from '~/features/JspmApp/jspmAppUrl';
import { COMPONENT_NAMES, JSPM_APP_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY } from '~/features/Desktop/config';
import {
  DASHBOARD_DATA_SYNC_EVENT,
  GUEST_EVENT,
  IFRAME_BRIDGE_CHANNEL,
  IFRAME_BRIDGE_VERSION,
  IFRAME_HOST_WINDOW_EVENT,
  MESSAGE_KIND,
} from '~/app-shell/iframeBridge/protocol';

function renderJspm(
  store = setupStore({
    Desktop: {
      desktopWindows: [
        {
          id: TEST_SELECTORS.WINDOW_ID_W1,
          name: COMPONENT_NAMES.JSPM_APP,
          lazyLoadComponent: 'JspmApp',
          layout: undefined,
        },
      ],
      layouts: { xl: [], lg: [], md: [], sm: [] },
      focusedWindowId: TEST_SELECTORS.WINDOW_ID_W1,
    },
  })
) {
  render(
    <Provider store={store}>
      <ThemeProvider>
        <JspmApp
          windowId={TEST_SELECTORS.WINDOW_ID_W1}
          windowName={COMPONENT_NAMES.JSPM_APP}
        />
      </ThemeProvider>
    </Provider>
  );
  return store;
}

describe('JspmApp', () => {
  it('embeds the AngularJS JSPM app in an iframe with host handshake query', () => {
    renderJspm();

    const frame = screen.getByTitle(JSPM_APP_STRINGS.IFRAME_TITLE);
    const expectedSrc = buildIframeGuestUrl(
      DEFAULT_JSPM_APP_URL,
      TEST_SELECTORS.WINDOW_ID_W1,
      window.location.origin
    );
    expect(frame).toHaveAttribute('src', expectedSrc);
    expect(frame).toHaveAttribute('data-testid', TEST_SELECTORS.JSPM_APP_FRAME);
  });

  it('closes the desktop window when the iframe posts a close event', () => {
    const utils = renderJspm();
    const frame = screen.getByTestId(
      TEST_SELECTORS.JSPM_APP_FRAME
    ) as HTMLIFrameElement;

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: new URL(DEFAULT_JSPM_APP_URL).origin,
        source: frame.contentWindow,
        data: {
          v: IFRAME_BRIDGE_VERSION,
          channel: IFRAME_BRIDGE_CHANNEL,
          id: 'close-1',
          windowId: TEST_SELECTORS.WINDOW_ID_W1,
          type: MESSAGE_KIND.EVENT,
          name: GUEST_EVENT.CLOSE,
        },
      })
    );

    expect(utils.getState().Desktop.desktopWindows).toHaveLength(0);
  });

  it('ignores close events from another origin', () => {
    const utils = renderJspm();

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://evil.example',
        data: {
          v: IFRAME_BRIDGE_VERSION,
          channel: IFRAME_BRIDGE_CHANNEL,
          id: 'close-2',
          windowId: TEST_SELECTORS.WINDOW_ID_W1,
          type: MESSAGE_KIND.EVENT,
          name: GUEST_EVENT.CLOSE,
        },
      })
    );

    expect(utils.getState().Desktop.desktopWindows).toHaveLength(1);
  });

  it('rebrands a custom Angular event onto window', () => {
    renderJspm();
    const seen: string[] = [];
    const onHost = (event: Event): void => {
      const custom = event as CustomEvent<{ name: string }>;
      seen.push(custom.detail.name);
    };
    window.addEventListener(IFRAME_HOST_WINDOW_EVENT, onHost);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: new URL(DEFAULT_JSPM_APP_URL).origin,
        data: {
          v: IFRAME_BRIDGE_VERSION,
          channel: IFRAME_BRIDGE_CHANNEL,
          id: 'custom-1',
          windowId: TEST_SELECTORS.WINDOW_ID_W1,
          type: MESSAGE_KIND.EVENT,
          name: 'formSubmitted',
          payload: { id: 9 },
        },
      })
    );

    window.removeEventListener(IFRAME_HOST_WINDOW_EVENT, onHost);
    expect(seen).toEqual(['formSubmitted']);
  });

  it('syncs schema-ui overlay when Angular posts userUpdated', () => {
    localStorage.removeItem(LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY);
    renderJspm();
    const synced: unknown[] = [];
    const onSync = (event: Event): void => {
      synced.push((event as CustomEvent).detail);
    };
    window.addEventListener(DASHBOARD_DATA_SYNC_EVENT, onSync);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: new URL(DEFAULT_JSPM_APP_URL).origin,
        data: {
          v: IFRAME_BRIDGE_VERSION,
          channel: IFRAME_BRIDGE_CHANNEL,
          id: 'user-1',
          windowId: TEST_SELECTORS.WINDOW_ID_W1,
          type: MESSAGE_KIND.EVENT,
          name: GUEST_EVENT.USER_UPDATED,
          payload: {
            entity: 'users',
            record: { _id: 'user-demo', username: 'from-angular' },
          },
        },
      })
    );

    window.removeEventListener(DASHBOARD_DATA_SYNC_EVENT, onSync);
    expect(localStorage.getItem(LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY)).toContain(
      'from-angular'
    );
    expect(synced).toHaveLength(1);
  });
});
