import { useEffect, type RefObject } from 'react';
import type { Theme } from '~/core/contexts/ThemeContext';
import { parseGuestMessage, readSetTitle } from './parseGuestMessage';
import {
  createIframeEnvelope,
  GUEST_EVENT,
  HOST_EVENT,
  IFRAME_HOST_WINDOW_EVENT,
  isAllowedIframeOrigin,
} from './protocol';
import { applyGuestEntityUpdate } from './syncDashboardFromGuest';

interface UseIframeGuestEventsOptions {
  windowId: string;
  iframeSrc: string;
  iframeRef: RefObject<HTMLIFrameElement>;
  theme: Theme;
  onClose: () => void;
}

function postToGuest(
  iframe: HTMLIFrameElement | null,
  origin: string,
  envelope: ReturnType<typeof createIframeEnvelope>
): void {
  const target = iframe?.contentWindow;
  if (!target) {
    return;
  }
  target.postMessage(envelope, origin);
}

/**
 * Host side of the iframe SDK: listen on `window` for guest `postMessage`
 * events, re-dispatch them as `desktop-ui:iframe` CustomEvents, and answer
 * ready/ping with theme/pong.
 */
export function useIframeGuestEvents({
  windowId,
  iframeSrc,
  iframeRef,
  theme,
  onClose,
}: UseIframeGuestEventsOptions): void {
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      if (!isAllowedIframeOrigin(event.origin, iframeSrc)) {
        return;
      }

      const message = parseGuestMessage(event.data, windowId);
      if (!message) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent(IFRAME_HOST_WINDOW_EVENT, { detail: message })
      );

      if (message.name === GUEST_EVENT.USER_UPDATED) {
        applyGuestEntityUpdate(message.payload);
        return;
      }

      if (message.name === GUEST_EVENT.CLOSE) {
        onClose();
        return;
      }

      if (message.name === GUEST_EVENT.SET_TITLE) {
        const title = readSetTitle(message.payload);
        if (title && iframeRef.current) {
          iframeRef.current.title = title;
        }
        return;
      }

      if (message.name === GUEST_EVENT.PING) {
        postToGuest(
          iframeRef.current,
          event.origin,
          createIframeEnvelope(windowId, HOST_EVENT.PONG)
        );
        return;
      }

      if (message.name === GUEST_EVENT.READY) {
        postToGuest(
          iframeRef.current,
          event.origin,
          createIframeEnvelope(windowId, HOST_EVENT.THEME, { theme })
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeRef, iframeSrc, onClose, theme, windowId]);

  useEffect(() => {
    const origin = new URL(iframeSrc).origin;
    postToGuest(
      iframeRef.current,
      origin,
      createIframeEnvelope(windowId, HOST_EVENT.THEME, { theme })
    );
  }, [iframeRef, iframeSrc, theme, windowId]);
}
