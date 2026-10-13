import { LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY } from '~/features/Desktop/config';
import {
  DASHBOARD_DATA_SYNC_EVENT,
  GUEST_EVENT,
  HOST_EVENT,
} from '../../protocol';
import {
  applyGuestEntityUpdate,
  parseEntityUpdatePayload,
} from '../../syncDashboardFromGuest';

describe('parseEntityUpdatePayload', () => {
  it('accepts a nested entity record', () => {
    expect(
      parseEntityUpdatePayload({
        entity: 'users',
        record: { _id: 'user-demo', username: 'demo' },
      })
    ).toEqual({
      entity: 'users',
      record: { _id: 'user-demo', username: 'demo' },
    });
  });

  it('defaults entity to users when the guest sends a bare record', () => {
    expect(
      parseEntityUpdatePayload({ _id: 'user-1', username: 'mstanev' })
    ).toEqual({
      entity: 'users',
      record: { _id: 'user-1', username: 'mstanev' },
    });
  });

  it('rejects a payload without _id', () => {
    expect(parseEntityUpdatePayload({ username: 'demo' })).toBeNull();
  });
});

describe('applyGuestEntityUpdate', () => {
  beforeEach(() => {
    localStorage.removeItem(LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY);
  });

  it('writes the overlay and notifies the dashboard', () => {
    const seen: unknown[] = [];
    const onSync = (event: Event): void => {
      seen.push((event as CustomEvent).detail);
    };
    window.addEventListener(DASHBOARD_DATA_SYNC_EVENT, onSync);

    const iframe = document.createElement('iframe');
    iframe.src = 'https://jspm-app.vercel.app/?desktopWindowId=w1';
    const posted: Array<{ data: unknown; origin: string }> = [];
    Object.defineProperty(iframe, 'contentWindow', {
      value: {
        postMessage: (data: unknown, origin: string) => {
          posted.push({ data, origin });
        },
      },
    });
    document.body.appendChild(iframe);

    applyGuestEntityUpdate({
      entity: 'users',
      record: { _id: 'user-demo', username: 'synced' },
    });

    expect(localStorage.getItem(LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY)).toContain(
      'synced'
    );
    expect(seen).toEqual([
      {
        entity: 'users',
        record: expect.objectContaining({
          _id: 'user-demo',
          username: 'synced',
        }),
      },
    ]);
    expect(posted[0].origin).toBe('https://jspm-app.vercel.app');
    expect(posted[0].data).toMatchObject({
      name: HOST_EVENT.DASHBOARD_SYNC,
      payload: {
        entity: 'users',
        record: expect.objectContaining({ username: 'synced' }),
      },
    });
    expect(GUEST_EVENT.USER_UPDATED).toBe('userUpdated');

    window.removeEventListener(DASHBOARD_DATA_SYNC_EVENT, onSync);
    iframe.remove();
  });
});
