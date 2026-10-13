import React from 'react';
import { JSPM_APP_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { getJspmAppUrl } from './jspmAppUrl';
import styles from './JspmApp.module.css';

interface JspmAppProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}

const JspmApp: React.FC<JspmAppProps> = () => {
  const src = getJspmAppUrl();

  return (
    <div className={styles.host}>
      <iframe
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
