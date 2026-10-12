import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Braces } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '~/core/hooks';
import { useTheme } from '~/core/contexts/ThemeContext';
import { APP_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { applyDesktopConfig } from './DesktopSlice';
import {
  getBuiltInDesktopSnapshot,
  parseDesktopSnapshotJson,
  readDesktopConfigFromSearch,
  saveBootstrapSnapshot,
  serializeDesktopSnapshot,
} from './desktopSnapshot';
import styles from './DesktopConfigurator.module.css';

const DesktopConfigurator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const windows = useAppSelector((state) => state.Desktop.desktopWindows);
  const layouts = useAppSelector((state) => state.Desktop.layouts);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const fromQuery = readDesktopConfigFromSearch(window.location.search);
    if (fromQuery) {
      saveBootstrapSnapshot(fromQuery);
    }
  }, []);

  const handleOpen = useCallback(() => {
    setDraft(serializeDesktopSnapshot({ windows, layouts }));
    setStatus(null);
    setInvalid(false);
    setOpen(true);
  }, [windows, layouts]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setStatus(null);
    setInvalid(false);
  }, []);

  const handleDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
    },
    []
  );

  const handleDraftChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(event.target.value);
      setInvalid(false);
    },
    []
  );

  const handleApply = useCallback(() => {
    const snapshot = parseDesktopSnapshotJson(draft);
    if (!snapshot) {
      setInvalid(true);
      setStatus(APP_STRINGS.CONFIGURATOR_INVALID);
      return;
    }
    dispatch(applyDesktopConfig(snapshot));
    saveBootstrapSnapshot(snapshot);
    setInvalid(false);
    setStatus(APP_STRINGS.CONFIGURATOR_APPLIED);
  }, [dispatch, draft]);

  const handleCopyCurrent = useCallback(() => {
    const json = serializeDesktopSnapshot({ windows, layouts });
    setDraft(json);
    setInvalid(false);
    setStatus(APP_STRINGS.CONFIGURATOR_COPIED);
    if (typeof navigator.clipboard?.writeText === 'function') {
      void navigator.clipboard.writeText(json);
    }
  }, [windows, layouts]);

  const handleBuiltInDefault = useCallback(() => {
    const snapshot = getBuiltInDesktopSnapshot();
    dispatch(applyDesktopConfig(snapshot));
    saveBootstrapSnapshot(null);
    setDraft(serializeDesktopSnapshot(snapshot));
    setInvalid(false);
    setStatus(APP_STRINGS.CONFIGURATOR_RESTORED);
  }, [dispatch]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={styles.trigger}
        title={APP_STRINGS.CONFIGURATOR_BUTTON}
        aria-label={APP_STRINGS.CONFIGURATOR_BUTTON}
        aria-expanded={open}
        aria-controls={TEST_SELECTORS.DESKTOP_CONFIG_DIALOG}
      >
        <Braces size={16} />
        {theme === 'gradient' && (
          <span>{APP_STRINGS.CONFIGURATOR_BUTTON_SHORT}</span>
        )}
      </button>
      {open
        ? createPortal(
            <div
              className={styles.backdrop}
              role="presentation"
              onClick={handleClose}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="desktop-config-title"
                id={TEST_SELECTORS.DESKTOP_CONFIG_DIALOG}
                data-testid={TEST_SELECTORS.DESKTOP_CONFIG_DIALOG}
                className={styles.dialog}
                onClick={handleDialogClick}
              >
                <h2 id="desktop-config-title" className={styles.title}>
                  {APP_STRINGS.CONFIGURATOR_TITLE}
                </h2>
                <p className={styles.help}>{APP_STRINGS.CONFIGURATOR_HELP}</p>
                <label
                  htmlFor="desktop-config-json"
                  className={styles.textareaLabel}
                >
                  {APP_STRINGS.CONFIGURATOR_TEXTAREA_LABEL}
                </label>
                <textarea
                  id="desktop-config-json"
                  data-testid={TEST_SELECTORS.DESKTOP_CONFIG_TEXTAREA}
                  className={styles.textarea}
                  value={draft}
                  onChange={handleDraftChange}
                  spellCheck={false}
                  aria-invalid={invalid}
                />
                {status ? (
                  <p
                    className={invalid ? styles.error : styles.status}
                    role="status"
                    data-testid={TEST_SELECTORS.DESKTOP_CONFIG_STATUS}
                  >
                    {status}
                  </p>
                ) : null}
                <div className={styles.actions}>
                  <button type="button" onClick={handleApply}>
                    {APP_STRINGS.CONFIGURATOR_APPLY}
                  </button>
                  <button type="button" onClick={handleCopyCurrent}>
                    {APP_STRINGS.CONFIGURATOR_COPY}
                  </button>
                  <button type="button" onClick={handleBuiltInDefault}>
                    {APP_STRINGS.CONFIGURATOR_DEFAULT}
                  </button>
                  <button type="button" onClick={handleClose}>
                    {APP_STRINGS.CONFIGURATOR_CLOSE}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default DesktopConfigurator;
