import {
  assertEsmRemoteEntry,
  findEsmAssetImports,
  importRemoteEsmModule,
  isUsableEsmContentType,
} from './importRemoteEsm';

describe('findEsmAssetImports', () => {
  it('collects relative Vite asset specifiers', () => {
    expect(
      findEsmAssetImports(
        'import{_ as q}from"./assets/vite-preload-helper-uXat0MnT.js";import{i as It}from"./assets/index-CqrYeeB9.js";'
      )
    ).toEqual([
      './assets/vite-preload-helper-uXat0MnT.js',
      './assets/index-CqrYeeB9.js',
    ]);
  });
});

describe('isUsableEsmContentType', () => {
  it('accepts javascript MIME types', () => {
    expect(
      isUsableEsmContentType('application/javascript; charset=utf-8')
    ).toBe(true);
  });

  it('rejects HTML and JSON', () => {
    expect(isUsableEsmContentType('text/html; charset=utf-8')).toBe(false);
    expect(isUsableEsmContentType('application/json')).toBe(false);
  });
});

describe('assertEsmRemoteEntry', () => {
  const entryUrl = 'https://schema-ui-mf-remote.vercel.app/remoteEntry.js';
  const source =
    'import{_ as q}from"./assets/helper.js";export{qt as get,Ht as init};';

  it('rejects HTML served as remoteEntry', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/html' },
      text: async () => '<!doctype html>',
    });

    await expect(assertEsmRemoteEntry(entryUrl, fetchImpl)).rejects.toThrow(
      /not JavaScript/
    );
  });

  it('rejects when imported assets are missing', async () => {
    const fetchImpl = jest.fn(
      async (url: string, init?: { method?: string }) => {
        if (url === entryUrl) {
          return {
            ok: true,
            status: 200,
            headers: { get: () => 'application/javascript' },
            text: async () => source,
          };
        }
        expect(init?.method).toBe('HEAD');
        return {
          ok: false,
          status: 404,
          headers: { get: () => 'text/plain' },
          text: async () => 'NOT_FOUND',
        };
      }
    );

    await expect(assertEsmRemoteEntry(entryUrl, fetchImpl)).rejects.toThrow(
      /Publish the remote \/assets chunks/
    );
  });

  it('accepts an ESM container whose assets exist', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/javascript' },
      text: async () => source,
    }));

    await expect(
      assertEsmRemoteEntry(entryUrl, fetchImpl)
    ).resolves.toBeUndefined();
  });
});

describe('importRemoteEsmModule', () => {
  it('resolves with the module passed to the window callback', async () => {
    const container = { init: jest.fn(), get: jest.fn() };
    const pending = importRemoteEsmModule(
      'https://schema-ui-mf-remote.vercel.app/remoteEntry.js'
    );
    const successKey = Object.keys(window).find(
      (key) => key.startsWith('__desktopUiImportEsm_') && key.endsWith('_ok')
    );
    expect(successKey).toBeDefined();
    (window as unknown as Record<string, (mod: unknown) => void>)[
      successKey as string
    ](container);
    await expect(pending).resolves.toBe(container);
    expect(document.querySelector('script[type="module"]')).toBeNull();
  });

  it('rejects when the inline module reports an error', async () => {
    const pending = importRemoteEsmModule(
      'https://schema-ui-mf-remote.vercel.app/missing.js'
    );
    const errorKey = Object.keys(window).find(
      (key) => key.startsWith('__desktopUiImportEsm_') && key.endsWith('_err')
    );
    (window as unknown as Record<string, (err: unknown) => void>)[
      errorKey as string
    ](new Error('Failed to fetch dynamically imported module'));
    await expect(pending).rejects.toThrow(
      /Failed to fetch dynamically imported module/
    );
  });
});
