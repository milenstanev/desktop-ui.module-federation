import React, { useCallback, useMemo, useRef } from 'react';
import { buildIframeGuestUrl } from '~/app-shell/iframeBridge/protocol';
import { useIframeGuestEvents } from '~/app-shell/iframeBridge/useIframeGuestEvents';
import { useTheme } from '~/core/contexts/ThemeContext';
import { useAppDispatch } from '~/core/hooks';
import { removeWindow } from '~/features/Desktop/DesktopSlice';
import { JSPM_APP_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { getJspmAppUrl } from './jspmAppUrl';
import styles from './JspmApp.module.css';

interface JspmAppProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}

const JspmApp: React.FC<JspmAppProps> = ({ windowId }) => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const src = useMemo(
    () =>
      buildIframeGuestUrl(getJspmAppUrl(), windowId, window.location.origin),
    [windowId]
  );

  const handleClose = useCallback(() => {
    dispatch(removeWindow(windowId));
  }, [dispatch, windowId]);

  useIframeGuestEvents({
    windowId,
    iframeSrc: src,
    iframeRef,
    theme,
    onClose: handleClose,
  });

  return (
    <div className={styles.host}>
      <iframe
        ref={iframeRef}
        className={styles.frame}
        src={src}
        title={JSPM_APP_STRINGS.IFRAME_TITLE}
        data-testid={TEST_SELECTORS.JSPM_APP_FRAME}
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default JspmApp;
