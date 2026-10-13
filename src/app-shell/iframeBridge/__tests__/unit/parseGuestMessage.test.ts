import { parseGuestMessage } from '../../parseGuestMessage';
import {
  buildIframeGuestUrl,
  GUEST_EVENT,
  IFRAME_BRIDGE_CHANNEL,
  IFRAME_BRIDGE_VERSION,
  isAllowedIframeOrigin,
  MESSAGE_KIND,
} from '../../protocol';

const WINDOW_ID = 'window-1';

function envelope(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    v: IFRAME_BRIDGE_VERSION,
    channel: IFRAME_BRIDGE_CHANNEL,
    id: 'msg-1',
    windowId: WINDOW_ID,
    type: MESSAGE_KIND.EVENT,
    name: GUEST_EVENT.READY,
    ...overrides,
  };
}

describe('parseGuestMessage', () => {
  it('accepts a ready event for the expected window', () => {
    expect(parseGuestMessage(envelope(), WINDOW_ID)).toMatchObject({
      name: GUEST_EVENT.READY,
      windowId: WINDOW_ID,
    });
  });

  it('accepts a custom Angular event name', () => {
    const parsed = parseGuestMessage(
      envelope({ name: 'formSubmitted', payload: { id: 3 } }),
      WINDOW_ID
    );
    expect(parsed?.name).toBe('formSubmitted');
    expect(parsed?.payload).toEqual({ id: 3 });
  });

  it('rejects a message for another window', () => {
    expect(
      parseGuestMessage(envelope({ windowId: 'other' }), WINDOW_ID)
    ).toBeNull();
  });

  it('rejects a different channel or version', () => {
    expect(
      parseGuestMessage(envelope({ channel: 'other' }), WINDOW_ID)
    ).toBeNull();
    expect(parseGuestMessage(envelope({ v: 99 }), WINDOW_ID)).toBeNull();
  });
});

describe('buildIframeGuestUrl', () => {
  it('puts handshake query before the Angular home hash', () => {
    expect(
      buildIframeGuestUrl(
        'https://jspm-app.vercel.app',
        'w1',
        'https://desktop-ui-mf.vercel.app'
      )
    ).toBe(
      'https://jspm-app.vercel.app/?desktopWindowId=w1&desktopHostOrigin=https%3A%2F%2Fdesktop-ui-mf.vercel.app#!/home'
    );
  });
});

describe('isAllowedIframeOrigin', () => {
  const src = 'https://jspm-app.vercel.app/?desktopWindowId=w1';

  it('allows the iframe origin', () => {
    expect(isAllowedIframeOrigin('https://jspm-app.vercel.app', src)).toBe(
      true
    );
  });

  it('rejects a different origin', () => {
    expect(isAllowedIframeOrigin('https://evil.example', src)).toBe(false);
  });
});
