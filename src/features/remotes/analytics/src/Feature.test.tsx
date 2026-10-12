import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import AnalyticsFeature, { analyticsSlice } from './Feature';
import { ANALYTICS_STRINGS, ANALYTICS_TEST_ID } from './analyticsCopy';
import { MICRO_FRONTEND_STRINGS, REDUCER_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

describe('analytics copy contract', () => {
  it('matches host test ids and captions', () => {
    expect(ANALYTICS_TEST_ID).toBe(TEST_SELECTORS.ANALYTICS_REMOTE_FEATURE);
    expect(ANALYTICS_STRINGS.LOADED_CAPTION).toBe(
      MICRO_FRONTEND_STRINGS.LOADED_CAPTION
    );
  });
});

describe('analyticsSlice', () => {
  it('increments views and clicks', () => {
    let state = analyticsSlice.getInitialState();
    state = analyticsSlice.reducer(
      state,
      analyticsSlice.actions.incrementViews()
    );
    state = analyticsSlice.reducer(
      state,
      analyticsSlice.actions.incrementClicks()
    );
    expect(state).toEqual({ views: 1, clicks: 1 });
  });
});

describe('AnalyticsFeature component', () => {
  it('renders and dispatches increment actions', async () => {
    const store = configureStore({
      reducer: {
        [REDUCER_NAMES.ANALYTICS]: analyticsSlice.reducer,
      },
    });
    const Component = AnalyticsFeature.component;

    render(
      <Provider store={store}>
        <Component windowId="w1" windowName="Analytics" />
      </Provider>
    );

    expect(screen.getByTestId(ANALYTICS_TEST_ID)).toBeInTheDocument();
    expect(
      screen.getByText(ANALYTICS_STRINGS.LOADED_CAPTION)
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: ANALYTICS_STRINGS.INCREMENT_VIEWS_ARIA,
      })
    );
    expect(store.getState().analytics.views).toBe(1);
  });
});
