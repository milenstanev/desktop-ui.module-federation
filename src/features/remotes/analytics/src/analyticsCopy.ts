/**
 * Copy and test ids for the standalone analytics remote.
 * Keep in sync with src/shared/constants.ts MICRO_FRONTEND_STRINGS
 * and src/shared/testSelectors.ts ANALYTICS_REMOTE_FEATURE.
 */
export const ANALYTICS_TEST_ID = 'analytics-remote-feature';

export const ANALYTICS_STRINGS = {
  REMOTE_SUFFIX: '(remote)',
  VIEWS_LABEL: 'Views:',
  CLICKS_LABEL: 'Clicks:',
  INCREMENT: '+1',
  INCREMENT_VIEWS_ARIA: 'Increment views',
  INCREMENT_CLICKS_ARIA: 'Increment clicks',
  LOADED_CAPTION: 'Loaded from analytics remote via Module Federation',
} as const;
