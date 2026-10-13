import React, { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { DASHBOARD_DATA_SYNC_EVENT } from '~/app-shell/iframeBridge/protocol';
import { loadRemoteFeature } from '~/app-shell/loadRemoteFeature';
import { getFeature } from '~/core/feature-registry';
import Loader from '~/shared/components/Loader/Loader';
import type { FeatureModule } from '~/core/feature-types';
import {
  MICRO_FRONTEND_STRINGS,
  REMOTE_FEATURE_NAMES,
} from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import {
  installSchemaUiNetworkFetch,
  uninstallSchemaUiNetworkFetch,
} from '~/app-shell/schemaUiFetch';
import styles from './RemoteFeatureLoader.module.css';

export interface RemoteFeatureLoaderProps {
  remoteFeatureName: string;
  windowId: string;
  windowName: string;
}

const SchemaUiFetchGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useLayoutEffect(() => {
    installSchemaUiNetworkFetch();
    return () => {
      uninstallSchemaUiNetworkFetch();
    };
  }, []);

  return <>{children}</>;
};

const RemoteFeatureLoader: React.FC<RemoteFeatureLoaderProps> = ({
  remoteFeatureName,
  windowId,
  windowName,
}) => {
  const [feature, setFeature] = useState<FeatureModule | undefined>(() =>
    getFeature(remoteFeatureName)
  );
  const [error, setError] = useState<string | null>(null);
  const [syncEpoch, setSyncEpoch] = useState(0);

  useEffect(() => {
    if (remoteFeatureName !== REMOTE_FEATURE_NAMES.SCHEMA_UI) {
      return;
    }
    const onSync = (): void => {
      setSyncEpoch((epoch) => epoch + 1);
    };
    window.addEventListener(DASHBOARD_DATA_SYNC_EVENT, onSync);
    return () => {
      window.removeEventListener(DASHBOARD_DATA_SYNC_EVENT, onSync);
    };
  }, [remoteFeatureName]);

  useEffect(() => {
    if (feature) {
      return;
    }

    let cancelled = false;
    setError(null);
    loadRemoteFeature(remoteFeatureName)
      .then((loaded) => {
        if (!cancelled) {
          setFeature(loaded);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : `${MICRO_FRONTEND_STRINGS.LOAD_FAILED_UNKNOWN} "${remoteFeatureName}"`
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [remoteFeatureName, feature]);

  if (error) {
    return (
      <div className={styles.error} role="alert">
        {MICRO_FRONTEND_STRINGS.LOAD_FAILED_PREFIX} &quot;{remoteFeatureName}
        &quot; {MICRO_FRONTEND_STRINGS.LOAD_FAILED_MIDDLE} {error}
      </div>
    );
  }

  if (!feature) {
    return <Loader />;
  }

  const Component = feature.component;
  const isSchemaUi = remoteFeatureName === REMOTE_FEATURE_NAMES.SCHEMA_UI;

  const content = (
    <div
      className={isSchemaUi ? styles.schemaUiHost : undefined}
      data-testid={isSchemaUi ? TEST_SELECTORS.SCHEMA_UI_HOST : undefined}
    >
      <Component
        key={isSchemaUi ? `${windowId}-${syncEpoch}` : windowId}
        windowId={windowId}
        windowName={windowName}
      />
    </div>
  );

  return (
    <Suspense fallback={<Loader />}>
      {isSchemaUi ? <SchemaUiFetchGate>{content}</SchemaUiFetchGate> : content}
    </Suspense>
  );
};

export default RemoteFeatureLoader;
