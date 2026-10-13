/**
 * Vanilla guest SDK for iframe apps (AngularJS, Vue, anything).
 * Copy this into the guest, or load it as a script, then call
 * `window.desktopUi.ready()` / `emit('close')`.
 *
 * Cross-origin iframes cannot share objects with the host. This facade
 * sits on the guest `window` and sends JSON through `parent.postMessage`.
 */
import {
  createIframeEnvelope,
  IFRAME_BRIDGE_CHANNEL,
  IFRAME_QUERY,
  type IframeEnvelope,
} from './protocol';

export interface DesktopUiGuest {
  windowId: string;
  hostOrigin: string;
  emit: (name: string, payload?: unknown) => void;
  ready: () => void;
  close: () => void;
  setTitle: (title: string) => void;
  ping: () => void;
  on: (name: string, handler: (payload: unknown) => void) => () => void;
}

function readQuery(search: string): {
  windowId: string;
  hostOrigin: string;
} {
  const params = new URLSearchParams(search);
  return {
    windowId: params.get(IFRAME_QUERY.WINDOW_ID) ?? '',
    hostOrigin: params.get(IFRAME_QUERY.HOST_ORIGIN) ?? '',
  };
}

export function createDesktopUiGuest(
  guestWindow: Window = window
): DesktopUiGuest | null {
  const { windowId, hostOrigin } = readQuery(guestWindow.location.search);
  if (!windowId || !hostOrigin) {
    return null;
  }

  const emit = (name: string, payload?: unknown): void => {
    if (guestWindow.parent === guestWindow) {
      return;
    }
    guestWindow.parent.postMessage(
      createIframeEnvelope(windowId, name, payload),
      hostOrigin
    );
  };

  const listeners = new Map<string, Set<(payload: unknown) => void>>();

  const onMessage = (event: MessageEvent): void => {
    if (event.origin !== hostOrigin) {
      return;
    }
    const data = event.data as IframeEnvelope | null;
    if (
      !data ||
      data.channel !== IFRAME_BRIDGE_CHANNEL ||
      data.windowId !== windowId
    ) {
      return;
    }
    const handlers = listeners.get(data.name);
    if (!handlers) {
      return;
    }
    handlers.forEach((handler) => {
      handler(data.payload);
    });
  };

  guestWindow.addEventListener('message', onMessage);

  return {
    windowId,
    hostOrigin,
    emit,
    ready: () => {
      emit('ready');
    },
    close: () => {
      emit('close');
    },
    setTitle: (title: string) => {
      emit('setTitle', { title });
    },
    ping: () => {
      emit('ping');
    },
    on: (name: string, handler: (payload: unknown) => void): (() => void) => {
      let set = listeners.get(name);
      if (!set) {
        set = new Set();
        listeners.set(name, set);
      }
      set.add(handler);
      return () => {
        set?.delete(handler);
      };
    },
  };
}

export function installDesktopUiGuest(guestWindow: Window = window): void {
  const guest = createDesktopUiGuest(guestWindow);
  if (!guest) {
    return;
  }
  (guestWindow as Window & { desktopUi?: DesktopUiGuest }).desktopUi = guest;
}
