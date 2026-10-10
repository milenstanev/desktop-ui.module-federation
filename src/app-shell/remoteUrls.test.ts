import {
  buildRemoteEntryUrls,
  getAnalyticsRemoteBaseUrl,
  getSchemaUiRemoteBaseUrl,
} from './remoteUrls';

describe('getAnalyticsRemoteBaseUrl', () => {
  const localLocation = {
    hostname: 'localhost',
    origin: 'http://localhost:3000',
  };
  const prodLocation = {
    hostname: 'desktop-ui.example.com',
    origin: 'https://desktop-ui.example.com',
  };

  it('uses REACT_APP_ANALYTICS_REMOTE_URL when set', () => {
    expect(
      getAnalyticsRemoteBaseUrl(
        { REACT_APP_ANALYTICS_REMOTE_URL: 'https://analytics.example.com/' },
        prodLocation
      )
    ).toBe('https://analytics.example.com');
  });

  it('defaults to localhost:3002 on local hosts', () => {
    expect(
      getAnalyticsRemoteBaseUrl({ NODE_ENV: 'production' }, localLocation)
    ).toBe('http://localhost:3002');
  });

  it('defaults production to origin/remote so host remoteEntry is not first', () => {
    expect(
      getAnalyticsRemoteBaseUrl({ NODE_ENV: 'production' }, prodLocation)
    ).toBe('https://desktop-ui.example.com/remote');
  });
});

describe('getSchemaUiRemoteBaseUrl', () => {
  it('defaults to the public schema-ui remote', () => {
    expect(getSchemaUiRemoteBaseUrl({})).toBe(
      'https://schema-ui-mf-remote.vercel.app'
    );
  });

  it('uses REACT_APP_SCHEMA_UI_REMOTE_URL when set', () => {
    expect(
      getSchemaUiRemoteBaseUrl({
        REACT_APP_SCHEMA_UI_REMOTE_URL: 'https://schema.example.com/',
      })
    ).toBe('https://schema.example.com');
  });
});

describe('buildRemoteEntryUrls', () => {
  const origin = 'https://desktop-ui.example.com';

  it('tries /remote before site root when the base is a /remote path', () => {
    expect(
      buildRemoteEntryUrls('https://desktop-ui.example.com/remote', origin)
    ).toEqual([
      'https://desktop-ui.example.com/remote/remoteEntry.js',
      'https://desktop-ui.example.com/remoteEntry.js',
    ]);
  });

  it('includes a /remote variant for a dedicated remote origin', () => {
    expect(
      buildRemoteEntryUrls('https://analytics.example.com', origin)
    ).toEqual([
      'https://analytics.example.com/remoteEntry.js',
      'https://analytics.example.com/remote/remoteEntry.js',
    ]);
  });
});
