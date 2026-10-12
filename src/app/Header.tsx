import React, { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Sparkles,
  Calculator,
  FileEdit,
  StickyNote,
  Timer,
  BarChart3,
  Table2,
  RotateCcw,
  X,
  Grid3x3,
} from 'lucide-react';
import MicroFrontendDemo, {
  type RemoteWindowSpec,
} from '~/features/MicroFrontendDemo/MicroFrontendDemo';
import styles from './Header.module.css';
import { useAppDispatch } from '~/core/hooks';
import {
  addWindow,
  resetLayouts,
  removeAllWindows,
  organizeGrid,
} from '~/features/Desktop/DesktopSlice';
import DesktopConfigurator from '~/features/Desktop/DesktopConfigurator';
import { useTheme, Theme } from '~/core/contexts/ThemeContext';
import {
  APP_STRINGS,
  COMPONENT_NAMES,
  LAYOUT_CONFIG,
  REDUCER_NAMES,
  REMOTE_FEATURE_NAMES,
  THEME_STRINGS,
  THEME_OPTIONS,
} from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const Header: React.FC = () => {
  //region states
  const { theme, setTheme } = useTheme();
  //endregion

  //region hooks
  const dispatch = useAppDispatch();
  //endregion

  //region callbacks
  const handleThemeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTheme(event.target.value as Theme);
    },
    [setTheme]
  );

  const handleAddSimpleExample = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.SIMPLE_EXAMPLE,
        lazyLoadComponent: 'SimpleExample',
        layout: undefined,
      })
    );
  }, [dispatch]);

  const handleAddCounter = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.COUNTER,
        lazyLoadComponent: 'Counter',
        layout: undefined,
        lazyLoadReducerName: REDUCER_NAMES.COUNTER,
      })
    );
  }, [dispatch]);

  const handleAddFormEditor = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.FORM_EDITOR,
        lazyLoadComponent: 'FormEditor',
        layout: undefined,
      })
    );
  }, [dispatch]);

  const handleAddNotes = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.NOTES,
        lazyLoadComponent: 'Notes',
        layout: undefined,
        lazyLoadReducerName: REDUCER_NAMES.NOTES,
      })
    );
  }, [dispatch]);

  const handleAddTimer = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.TIMER,
        lazyLoadComponent: 'Timer',
        layout: undefined,
      })
    );
  }, [dispatch]);

  const handleAddForms = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.FORMS,
        remoteFeatureName: REMOTE_FEATURE_NAMES.SCHEMA_UI,
        layout: undefined,
        preferredSize: { h: LAYOUT_CONFIG.FORMS_WINDOW_HEIGHT },
      })
    );
  }, [dispatch]);

  const handleAddAnalytics = useCallback(() => {
    const id = uuidv4();

    dispatch(
      addWindow({
        id,
        name: COMPONENT_NAMES.ANALYTICS,
        remoteFeatureName: REMOTE_FEATURE_NAMES.ANALYTICS,
        layout: undefined,
        lazyLoadReducerName: REDUCER_NAMES.ANALYTICS,
      })
    );
  }, [dispatch]);

  const handleOrganizeGrid = useCallback(() => {
    dispatch(organizeGrid());
  }, [dispatch]);

  const handleResetLayout = useCallback(() => {
    dispatch(resetLayouts());
  }, [dispatch]);

  const handleRemoveAllWindows = useCallback(() => {
    dispatch(removeAllWindows());
  }, [dispatch]);

  const handleOpenRemoteWindow = useCallback(
    (feature: RemoteWindowSpec) => {
      dispatch(
        addWindow({
          id: uuidv4(),
          name: feature.displayName,
          remoteFeatureName: feature.name,
          layout: undefined,
          lazyLoadReducerName: feature.reducerName,
        })
      );
    },
    [dispatch]
  );
  //endregion

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 data-testid={TEST_SELECTORS.APP_HEADING}>
          {APP_STRINGS.HEADING_TITLE}
        </h1>
        <div className={styles.themeControl}>
          <label htmlFor="theme-select" className={styles.themeLabel}>
            {THEME_STRINGS.SELECT_THEME_LABEL}:
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={handleThemeChange}
            className={styles.themeSelect}
            aria-label={THEME_STRINGS.SELECT_THEME_LABEL}
          >
            {THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles.separator} aria-hidden="true"></div>
          <button
            onClick={handleOrganizeGrid}
            className={styles.organizeButton}
            title={APP_STRINGS.ORGANIZE_GRID_BUTTON}
            aria-label={APP_STRINGS.ORGANIZE_GRID_BUTTON}
          >
            <Grid3x3 size={16} />
            {theme === 'gradient' && <span>Grid</span>}
          </button>
          <button
            onClick={handleResetLayout}
            className={styles.resetButton}
            title={APP_STRINGS.RESET_LAYOUT_BUTTON}
            aria-label={APP_STRINGS.RESET_LAYOUT_BUTTON}
          >
            <RotateCcw size={16} />
            {theme === 'gradient' && <span>Reset</span>}
          </button>
          <button
            onClick={handleRemoveAllWindows}
            className={styles.closeAllButton}
            title={APP_STRINGS.CLOSE_ALL_BUTTON}
            aria-label={APP_STRINGS.CLOSE_ALL_BUTTON}
          >
            <X size={16} />
            {theme === 'gradient' && <span>Close All</span>}
          </button>
          <DesktopConfigurator />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={handleAddSimpleExample}>
          {theme === 'gradient' && <Sparkles size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_SIMPLE_EXAMPLE}</span>
        </button>
        <button onClick={handleAddCounter}>
          {theme === 'gradient' && <Calculator size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_COUNTER}</span>
        </button>
        <button onClick={handleAddFormEditor}>
          {theme === 'gradient' && <FileEdit size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_FORM_EDITOR}</span>
        </button>
        <button onClick={handleAddNotes}>
          {theme === 'gradient' && <StickyNote size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_NOTES}</span>
        </button>
        <button onClick={handleAddTimer}>
          {theme === 'gradient' && <Timer size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_TIMER}</span>
        </button>
        <button
          type="button"
          onClick={handleAddForms}
          aria-label={APP_STRINGS.BUTTON_ADD_FORMS}
        >
          {theme === 'gradient' && <Table2 size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_FORMS}</span>
        </button>
        <button
          type="button"
          onClick={handleAddAnalytics}
          aria-label={APP_STRINGS.BUTTON_ADD_ANALYTICS}
        >
          {theme === 'gradient' && <BarChart3 size={16} />}
          <span>{APP_STRINGS.BUTTON_ADD_ANALYTICS}</span>
        </button>
        <MicroFrontendDemo onOpenRemoteWindow={handleOpenRemoteWindow} />
      </div>
    </header>
  );
};

export default Header;
