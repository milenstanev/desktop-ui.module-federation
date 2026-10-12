import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useStore } from 'react-redux';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useAppSelector, useAppDispatch } from '~/core/hooks';
import { removeWindow, updateLayouts, setFocus } from './DesktopSlice';
import { LayoutBreakpoint, DesktopUIWindow } from './types';
import WindowComponent from '~/shared/components/Window/Window';
import ComponentLoader from '~/shared/components/ComponentLoader/ComponentLoader';
import RemoteFeatureLoader from '~/app-shell/RemoteFeatureLoader';
import { removeLazyLoadedReducer } from '~/core/utils/lazyLoadReducer';
import type { StoreWithReducerManager } from '~/core/store';
import styles from './Desktop.module.css';
import { useTheme } from '~/core/contexts/ThemeContext';
import { DESKTOP_STRINGS, LAYOUT_CONFIG } from '~/shared/constants';
import { useKeyboardShortcuts } from '~/core/hooks/useKeyboardShortcuts';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const Desktop: React.FC = () => {
  //region states
  const windows = useAppSelector((state) => state.Desktop.desktopWindows);
  const savedLayouts = useAppSelector((state) => state.Desktop.layouts);
  const focusedWindowId = useAppSelector(
    (state) => state.Desktop.focusedWindowId
  );
  const [breakpoint, setBreakpoint] = useState<LayoutBreakpoint>('lg');
  //endregion

  //region hooks
  const dispatch = useAppDispatch();
  const store = useStore();
  const { theme } = useTheme();
  const prevReducersRef = React.useRef<Set<string>>(new Set());

  useKeyboardShortcuts(
    () => {
      if (focusedWindowId) dispatch(removeWindow(focusedWindowId));
    },
    () => {
      if (focusedWindowId) dispatch(removeWindow(focusedWindowId));
    },
    !!focusedWindowId
  );
  //endregion

  //region memos
  const windowsSorted = useMemo(() => {
    if (!focusedWindowId) return windows;
    const focused = windows.find(
      (w: DesktopUIWindow) => w.id === focusedWindowId
    );
    if (!focused) return windows;
    const rest = windows.filter(
      (w: DesktopUIWindow) => w.id !== focusedWindowId
    );
    return [...rest, focused];
  }, [windows, focusedWindowId]);

  const gridMargin = useMemo<[number, number]>(() => {
    return theme === 'gradient' ? [20, 20] : [10, 10];
  }, [theme]);

  const containerPadding = useMemo<[number, number]>(() => {
    return theme === 'gradient' ? [20, 20] : [10, 10];
  }, [theme]);

  const windowStyles = useMemo(() => {
    const map = new Map<string, React.CSSProperties>();
    windowsSorted.forEach((w: DesktopUIWindow) => {
      map.set(w.id, {
        zIndex:
          w.id === focusedWindowId
            ? LAYOUT_CONFIG.Z_INDEX_FOCUSED
            : LAYOUT_CONFIG.Z_INDEX_NORMAL,
      });
    });
    return map;
  }, [windowsSorted, focusedWindowId]);
  //endregion

  //region callbacks
  const handleRemoveWindow = useCallback(
    (id: string) => dispatch(removeWindow(id)),
    [dispatch]
  );

  const handleFocusWindow = useCallback(
    (id: string) => dispatch(setFocus(id)),
    [dispatch]
  );

  const handleLayoutChange = useCallback(
    (layout: ReactGridLayout.Layout[]) => {
      dispatch(updateLayouts({ layout, breakpoint }));
    },
    [dispatch, breakpoint]
  );

  const handleBreakpointChange = useCallback(
    (newBreakpoint: LayoutBreakpoint) => setBreakpoint(newBreakpoint),
    []
  );
  //endregion

  useEffect(() => {
    const currentReducers = new Set<string>();
    windows.forEach((window: DesktopUIWindow) => {
      if (window.lazyLoadReducerName) {
        currentReducers.add(window.lazyLoadReducerName);
      }
    });

    const reducersToRemove = Array.from(prevReducersRef.current).filter(
      (reducerName) => !currentReducers.has(reducerName)
    );
    reducersToRemove.forEach((reducerName) => {
      removeLazyLoadedReducer(store as StoreWithReducerManager, reducerName);
    });
    prevReducersRef.current = currentReducers;
  }, [windows, store]);

  return (
    <div
      className={styles.desktop}
      data-testid={TEST_SELECTORS.DESKTOP_CONTAINER}
      role="application"
      aria-label={DESKTOP_STRINGS.DESKTOP_ARIA_LABEL}
    >
      <ResponsiveReactGridLayout
        cols={LAYOUT_CONFIG.COLS}
        layouts={savedLayouts}
        breakpoints={LAYOUT_CONFIG.BREAKPOINTS}
        rowHeight={80}
        margin={gridMargin}
        containerPadding={containerPadding}
        onDragStop={handleLayoutChange}
        onResizeStop={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        draggableHandle={`.${LAYOUT_CONFIG.DRAG_HANDLE_CLASS}`}
      >
        {windowsSorted.map((window: DesktopUIWindow) => (
          <div key={window.id} style={windowStyles.get(window.id)}>
            <WindowComponent
              name={window.name}
              id={window.id}
              removeWindow={handleRemoveWindow}
              lazyLoadReducerName={window.lazyLoadReducerName}
              isFocused={window.id === focusedWindowId}
              onFocus={handleFocusWindow}
            >
              {window.lazyLoadComponent && (
                <ComponentLoader
                  componentName={window.lazyLoadComponent}
                  windowId={window.id}
                  windowName={window.name}
                  lazyLoadReducerName={window.lazyLoadReducerName}
                />
              )}
              {window.remoteFeatureName && (
                <RemoteFeatureLoader
                  remoteFeatureName={window.remoteFeatureName}
                  windowId={window.id}
                  windowName={window.name}
                />
              )}
            </WindowComponent>
          </div>
        ))}
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default Desktop;
