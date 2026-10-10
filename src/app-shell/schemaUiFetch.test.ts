import {
  installSchemaUiNetworkFetch,
  resetSchemaUiNetworkFetchForTests,
  shouldBypassHttpCache,
  uninstallSchemaUiNetworkFetch,
} from './schemaUiFetch';

describe('schemaUiFetch', () => {
  const originalFetch = window.fetch;

  afterEach(() => {
    resetSchemaUiNetworkFetchForTests();
    window.fetch = originalFetch;
  });

  it('bypasses cache for the schema-ui remote origin', () => {
    expect(
      shouldBypassHttpCache(
        'https://schema-ui-mf-remote.vercel.app/api/users/schema',
        'https://schema-ui-mf-remote.vercel.app'
      )
    ).toBe(true);
  });

  it('does not bypass cache for unrelated URLs', () => {
    expect(
      shouldBypassHttpCache(
        'https://example.com/api/users',
        'https://schema-ui-mf-remote.vercel.app'
      )
    ).toBe(false);
  });

  it('forces cache no-store on schema-ui requests and restores fetch', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    window.fetch = fetchMock as unknown as typeof fetch;

    installSchemaUiNetworkFetch();
    await window.fetch(
      'https://schema-ui-mf-remote.vercel.app/api/users/schema'
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://schema-ui-mf-remote.vercel.app/api/users/schema',
      expect.objectContaining({ cache: 'no-store' })
    );

    uninstallSchemaUiNetworkFetch();
    fetchMock.mockClear();
    await window.fetch('/local');
    expect(fetchMock).toHaveBeenCalledWith('/local');
  });
});
