import React, { Suspense } from 'react';
import { getLazyComponent } from '~/core/utils/componentLoader';
import type { ComponentNames } from '~/core/utils/componentLoader';
import Loader from '~/shared/components/Loader/Loader';

export interface ComponentLoaderProps {
  componentName: ComponentNames;
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}

type LazyWindowProps = {
  windowId: string;
  windowName: string;
  lazyLoadReducerName: string;
};

const ComponentLoader: React.FC<ComponentLoaderProps> = ({
  componentName,
  windowId,
  windowName,
  lazyLoadReducerName,
}) => {
  const LazyComponent = getLazyComponent(
    componentName
  ) as React.ComponentType<LazyWindowProps>;
  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent
        windowId={windowId}
        windowName={windowName}
        lazyLoadReducerName={lazyLoadReducerName ?? ''}
      />
    </Suspense>
  );
};

export default ComponentLoader;
