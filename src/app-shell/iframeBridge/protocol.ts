export const IFRAME_BRIDGE_CHANNEL = 'desktop-ui';
export const IFRAME_BRIDGE_VERSION = 1;

export const IFRAME_QUERY = {
  WINDOW_ID: 'desktopWindowId',
  HOST_ORIGIN: 'desktopHostOrigin',
} as const;

export const IFRAME_GUEST_HASH = '!/home';

export const GUEST_EVENT = {
  READY: 'ready',
  PING: 'ping',
  CLOSE: 'close',
  SET_TITLE: 'setTitle',
  USER_UPDATED: 'userUpdated',
} as const;

export const HOST_EVENT = {
  THEME: 'theme',
  FOCUS: 'focus',
  PONG: 'pong',
  DASHBOARD_SYNC: 'dashboardSync',
} as const;

export const IFRAME_HOST_WINDOW_EVENT = 'desktop-ui:iframe';
export const DASHBOARD_DATA_SYNC_EVENT = 'desktop-ui:dashboard-sync';

export const SCHEMA_ENTITY = {
  USERS: 'users',
} as const;

export const MESSAGE_KIND = {
  EVENT: 'event',
  REQUEST: 'request',
  RESPONSE: 'response',
} as const;

export type IframeMessageKind =
  (typeof MESSAGE_KIND)[keyof typeof MESSAGE_KIND];

export type GuestEventName = (typeof GUEST_EVENT)[keyof typeof GUEST_EVENT];

export type HostEventName = (typeof HOST_EVENT)[keyof typeof HOST_EVENT];

export interface IframeEnvelope {
  v: number;
  channel: string;
  id: string;
  windowId: string;
  type: IframeMessageKind;
  name: string;
  payload?: unknown;
}

export function createIframeEnvelope(
  windowId: string,
  name: string,
  payload?: unknown,
  type: IframeMessageKind = MESSAGE_KIND.EVENT
): IframeEnvelope {
  return {
    v: IFRAME_BRIDGE_VERSION,
    channel: IFRAME_BRIDGE_CHANNEL,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    windowId,
    type,
    name,
    payload,
  };
}

export function originOfUrl(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function isAllowedIframeOrigin(
  eventOrigin: string,
  iframeSrc: string
): boolean {
  const allowed = originOfUrl(iframeSrc);
  return allowed !== null && eventOrigin === allowed;
}

export function buildIframeGuestUrl(
  baseUrl: string,
  windowId: string,
  hostOrigin: string
): string {
  const url = new URL(baseUrl);
  url.searchParams.set(IFRAME_QUERY.WINDOW_ID, windowId);
  url.searchParams.set(IFRAME_QUERY.HOST_ORIGIN, hostOrigin);
  url.hash = IFRAME_GUEST_HASH;
  return url.toString();
}
