/**
 * Analytics Feature Module
 *
 * Exported for Module Federation. Implements FeatureModule contract.
 */
import React, { useCallback } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { FeatureModule, RemoteWindowProps } from './shared/feature-types';
import { ANALYTICS_STRINGS, ANALYTICS_TEST_ID } from './analyticsCopy';
import './Feature.css';

const ANALYTICS_NAME = 'analytics';
const ANALYTICS_DISPLAY_NAME = 'Analytics';

export type AnalyticsState = { views: number; clicks: number };

export const analyticsSlice = createSlice({
  name: ANALYTICS_NAME,
  initialState: { views: 0, clicks: 0 } satisfies AnalyticsState,
  reducers: {
    incrementViews: (state) => {
      state.views += 1;
    },
    incrementClicks: (state) => {
      state.clicks += 1;
    },
  },
});

const AnalyticsComponent: React.FC<RemoteWindowProps> = ({ windowName }) => {
  const views = useSelector(
    (state: { analytics?: AnalyticsState }) => state.analytics?.views ?? 0
  );
  const clicks = useSelector(
    (state: { analytics?: AnalyticsState }) => state.analytics?.clicks ?? 0
  );
  const dispatch = useDispatch();

  const handleIncrementViews = useCallback(() => {
    dispatch(analyticsSlice.actions.incrementViews());
  }, [dispatch]);

  const handleIncrementClicks = useCallback(() => {
    dispatch(analyticsSlice.actions.incrementClicks());
  }, [dispatch]);

  return (
    <div className="analytics" data-testid={ANALYTICS_TEST_ID}>
      <h3 className="title">
        {windowName} {ANALYTICS_STRINGS.REMOTE_SUFFIX}
      </h3>
      <div className="stats">
        <div>
          <span className="label">{ANALYTICS_STRINGS.VIEWS_LABEL} </span>
          <strong>{views}</strong>
          <button
            type="button"
            onClick={handleIncrementViews}
            className="increment"
            aria-label={ANALYTICS_STRINGS.INCREMENT_VIEWS_ARIA}
          >
            {ANALYTICS_STRINGS.INCREMENT}
          </button>
        </div>
        <div>
          <span className="label">{ANALYTICS_STRINGS.CLICKS_LABEL} </span>
          <strong>{clicks}</strong>
          <button
            type="button"
            onClick={handleIncrementClicks}
            className="increment"
            aria-label={ANALYTICS_STRINGS.INCREMENT_CLICKS_ARIA}
          >
            {ANALYTICS_STRINGS.INCREMENT}
          </button>
        </div>
      </div>
      <p className="caption">{ANALYTICS_STRINGS.LOADED_CAPTION}</p>
    </div>
  );
};

const AnalyticsFeature: FeatureModule = {
  name: ANALYTICS_NAME,
  displayName: ANALYTICS_DISPLAY_NAME,
  component: AnalyticsComponent,
  reducer: {
    name: analyticsSlice.name,
    reducer: analyticsSlice.reducer,
  },
};

export default AnalyticsFeature;
