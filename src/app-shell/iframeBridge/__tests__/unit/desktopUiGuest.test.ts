import { createDesktopUiGuest } from '../../desktopUiGuest';
import {
  GUEST_EVENT,
  IFRAME_BRIDGE_CHANNEL,
  IFRAME_QUERY,
} from '../../protocol';

describe('createDesktopUiGuest', () => {
  it('posts Angular events to parent with the host origin', () => {
    const posted: Array<{ data: unknown; origin: string }> = [];
    const parent = {
      postMessage: (data: unknown, origin: string) => {
        posted.push({ data, origin });
      },
    };
    const hostOrigin = 'https://desktop-ui-mf.vercel.app';
    const guestWindow = {
      location: {
        search: `?${IFRAME_QUERY.WINDOW_ID}=w1&${IFRAME_QUERY.HOST_ORIGIN}=${encodeURIComponent(hostOrigin)}`,
      },
      parent,
      addEventListener: jest.fn(),
    } as unknown as Window;

    const guest = createDesktopUiGuest(guestWindow);
    expect(guest).not.toBeNull();
    guest?.emit('formSubmitted', { id: 4 });
    guest?.close();

    expect(posted).toHaveLength(2);
    expect(posted[0].origin).toBe(hostOrigin);
    expect(posted[0].data).toMatchObject({
      channel: IFRAME_BRIDGE_CHANNEL,
      windowId: 'w1',
      name: 'formSubmitted',
      payload: { id: 4 },
    });
    expect(posted[1].data).toMatchObject({ name: GUEST_EVENT.CLOSE });
  });

  it('does not install when handshake query is missing', () => {
    const guestWindow = {
      location: { search: '' },
      parent: { postMessage: jest.fn() },
      addEventListener: jest.fn(),
    } as unknown as Window;

    expect(createDesktopUiGuest(guestWindow)).toBeNull();
  });
});
