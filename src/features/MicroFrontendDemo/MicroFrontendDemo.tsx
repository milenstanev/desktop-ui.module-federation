import React, { useCallback, useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import {
  loadRemoteFeature,
  getAvailableRemotes,
} from '~/app-shell/loadRemoteFeature';
import { hasFeature } from '~/core/feature-registry';
import { MICRO_FRONTEND_STRINGS, REDUCER_NAMES } from '~/shared/constants';
import styles from './MicroFrontendDemo.module.css';

const ANALYTICS_REMOTE = REDUCER_NAMES.ANALYTICS;

export interface RemoteWindowSpec {
  displayName: string;
  name: string;
  reducerName?: string;
}

export interface MicroFrontendDemoProps {
  onOpenRemoteWindow: (feature: RemoteWindowSpec) => void;
}

const MicroFrontendDemo: React.FC<MicroFrontendDemoProps> = ({
  onOpenRemoteWindow,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remotes = getAvailableRemotes();
  const analyticsLoaded = hasFeature(ANALYTICS_REMOTE);

  const handleToggle = useCallback(() => {
    setExpanded((isExpanded) => !isExpanded);
  }, []);

  const handleLoadAnalytics = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const feature = await loadRemoteFeature(ANALYTICS_REMOTE);
      onOpenRemoteWindow({
        displayName: feature.displayName,
        name: feature.name,
        reducerName: feature.reducer?.name,
      });
      setExpanded(false);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : MICRO_FRONTEND_STRINGS.LOAD_ERROR_FALLBACK
      );
    } finally {
      setLoading(false);
    }
  }, [onOpenRemoteWindow]);

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.toggle}
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-label={MICRO_FRONTEND_STRINGS.TOGGLE_ARIA_LABEL}
      >
        <BarChart3 size={16} />
        <span>{MICRO_FRONTEND_STRINGS.TOGGLE_LABEL}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && (
        <div className={styles.content}>
          <p className={styles.description}>
            <strong>{MICRO_FRONTEND_STRINGS.DESCRIPTION_LOCAL}</strong>{' '}
            {MICRO_FRONTEND_STRINGS.DESCRIPTION_LOCAL_DETAIL}{' '}
            <strong>{MICRO_FRONTEND_STRINGS.DESCRIPTION_REMOTE}</strong>{' '}
            {MICRO_FRONTEND_STRINGS.DESCRIPTION_REMOTE_DETAIL}
          </p>
          <div className={styles.actions}>
            {remotes.includes(ANALYTICS_REMOTE) && (
              <button
                type="button"
                onClick={handleLoadAnalytics}
                disabled={loading}
                className={styles.loadButton}
              >
                {loading
                  ? MICRO_FRONTEND_STRINGS.LOADING
                  : MICRO_FRONTEND_STRINGS.LOAD_ANALYTICS}
              </button>
            )}
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {analyticsLoaded && (
            <p className={styles.success}>
              {MICRO_FRONTEND_STRINGS.LOADED_SUCCESS}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MicroFrontendDemo;
