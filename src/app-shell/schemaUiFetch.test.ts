import { LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY } from '~/features/Desktop/config';
import {
  applyOverlayToList,
  attachRecordIdToJsonBody,
  installSchemaUiNetworkFetch,
  parseSchemaUiApiUrl,
  resetSchemaUiNetworkFetchForTests,
  resolveSchemaUiFetchUrl,
  shouldBypassHttpCache,
  uninstallSchemaUiNetworkFetch,
} from './schemaUiFetch';

describe('schemaUiFetch', () => {
  const originalFetch = window.fetch;
  const remoteBase = 'https://schema-ui-mf-remote.vercel.app';

  afterEach(() => {
    resetSchemaUiNetworkFetchForTests();
    window.fetch = originalFetch;
  });

  it('bypasses cache for the schema-ui remote origin', () => {
    expect(
      shouldBypassHttpCache(`${remoteBase}/api/users/schema`, remoteBase)
    ).toBe(true);
  });

  it('does not bypass cache for unrelated URLs', () => {
    expect(
      shouldBypassHttpCache('https://example.com/api/users', remoteBase)
    ).toBe(false);
  });

  it('rewrites host /api/users to the schema-ui remote (UsersPage apiBase)', () => {
    expect(
      resolveSchemaUiFetchUrl(
        '/api/users/schema',
        remoteBase,
        'https://desktop-ui-mf.vercel.app'
      )
    ).toBe(`${remoteBase}/api/users/schema`);
    expect(
      shouldBypassHttpCache(
        '/api/users',
        remoteBase,
        'https://desktop-ui-mf.vercel.app'
      )
    ).toBe(true);
  });

  it('parses collection, record, and schema API URLs', () => {
    expect(parseSchemaUiApiUrl(`${remoteBase}/api/users`, remoteBase)).toEqual({
      entity: 'users',
      recordId: null,
      isSchema: false,
    });
    expect(
      parseSchemaUiApiUrl(
        `${remoteBase}/api/users/6addb3d3-fcc9-43a2-881b-696a50d41534`,
        remoteBase
      )
    ).toEqual({
      entity: 'users',
      recordId: '6addb3d3-fcc9-43a2-881b-696a50d41534',
      isSchema: false,
    });
    expect(
      parseSchemaUiApiUrl(`${remoteBase}/api/users/schema`, remoteBase)
    ).toEqual({
      entity: 'users',
      recordId: null,
      isSchema: true,
    });
  });

  it('attaches _id from the URL onto a PUT JSON body', () => {
    const next = attachRecordIdToJsonBody(
      {
        method: 'PUT',
        body: JSON.stringify({ username: 'demo 4' }),
      },
      '6addb3d3-fcc9-43a2-881b-696a50d41534'
    );
    expect(JSON.parse(String(next.body))).toEqual({
      username: 'demo 4',
      _id: '6addb3d3-fcc9-43a2-881b-696a50d41534',
    });
  });

  it('sends host-relative /api/users to the schema-ui remote', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    window.fetch = fetchMock as unknown as typeof fetch;
    installSchemaUiNetworkFetch();

    await window.fetch('/api/users/schema');

    expect(fetchMock).toHaveBeenCalledWith(
      `${remoteBase}/api/users/schema`,
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('forces cache no-store on schema-ui requests and restores fetch', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    window.fetch = fetchMock as unknown as typeof fetch;

    installSchemaUiNetworkFetch();
    await window.fetch(`${remoteBase}/assets/remoteEntry.js`);
    expect(fetchMock).toHaveBeenCalledWith(
      `${remoteBase}/assets/remoteEntry.js`,
      expect.objectContaining({ cache: 'no-store' })
    );

    uninstallSchemaUiNetworkFetch();
    fetchMock.mockClear();
    await window.fetch('/local');
    expect(fetchMock).toHaveBeenCalledWith('/local');
  });

  it('includes _id on PUT and returns the edited record when the remote answers 404', async () => {
    const recordId = '6addb3d3-fcc9-43a2-881b-696a50d41534';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    });
    window.fetch = fetchMock as unknown as typeof fetch;
    installSchemaUiNetworkFetch();

    const response = await window.fetch(`${remoteBase}/api/users/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'demo 4',
        mobileNumber: '5551234',
        OtherNewProp: false,
        LastBoolean: true,
        selectItem: 2,
        phone: '555-123-4567',
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        username: 'demo 4',
        _id: recordId,
      })
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))._id).toBe(
      recordId
    );
    expect(localStorage.getItem(LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY)).toContain(
      'demo 4'
    );
  });

  it('merges overlay records into a subsequent list GET', async () => {
    const recordId = '6addb3d3-fcc9-43a2-881b-696a50d41534';
    localStorage.setItem(
      LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY,
      JSON.stringify({
        users: {
          [recordId]: { _id: recordId, username: 'demo 4' },
        },
      })
    );

    const merged = applyOverlayToList('users', [
      { _id: recordId, username: 'demo 3' },
      { _id: 'other', username: 'mstanev' },
    ]);
    expect(merged).toEqual([
      { _id: recordId, username: 'demo 4' },
      { _id: 'other', username: 'mstanev' },
    ]);
  });

  it('does not mask a non-404 update failure', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Update failed' }),
    });
    window.fetch = fetchMock as unknown as typeof fetch;
    installSchemaUiNetworkFetch();

    const response = await window.fetch(
      `${remoteBase}/api/users/6addb3d3-fcc9-43a2-881b-696a50d41534`,
      {
        method: 'PUT',
        body: JSON.stringify({ username: 'demo 4' }),
      }
    );
    expect(response.status).toBe(500);
  });
});
