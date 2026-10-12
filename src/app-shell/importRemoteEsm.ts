const IMPORT_CALLBACK_PREFIX = '__desktopUiImportEsm_';

export function findEsmAssetImports(source: string): string[] {
  const assets: string[] = [];
  const pattern = /from\s*["'](\.\/assets\/[^"']+)["']/g;
  let match: RegExpExecArray | null = pattern.exec(source);
  while (match) {
    assets.push(match[1]);
    match = pattern.exec(source);
  }
  return assets;
}

export function isUsableEsmContentType(contentType: string | null): boolean {
  if (!contentType) {
    return true;
  }
  const normalized = contentType.toLowerCase();
  if (
    normalized.includes('text/html') ||
    normalized.includes('image/') ||
    normalized.includes('application/json')
  ) {
    return false;
  }
  return (
    normalized.includes('javascript') ||
    normalized.includes('ecmascript') ||
    normalized.includes('octet-stream')
  );
}

export type EsmEntryFetch = (
  input: string,
  init?: { method?: string; cache?: RequestCache }
) => Promise<{
  ok: boolean;
  status: number;
  headers: { get: (name: string) => string | null };
  text: () => Promise<string>;
}>;

export async function assertEsmRemoteEntry(
  entryUrl: string,
  fetchImpl: EsmEntryFetch = fetch
): Promise<void> {
  const response = await fetchImpl(entryUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`remoteEntry HTTP ${response.status} at ${entryUrl}`);
  }
  if (!isUsableEsmContentType(response.headers.get('content-type'))) {
    throw new Error(
      `remoteEntry at ${entryUrl} returned ${response.headers.get('content-type')}, not JavaScript`
    );
  }

  const source = await response.text();
  if (!/\bexport\s*\{[^}]*\b(get|init)\b/.test(source)) {
    throw new Error(
      `remoteEntry at ${entryUrl} is not an ESM container with init/get`
    );
  }

  const [firstAsset] = findEsmAssetImports(source);
  if (!firstAsset) {
    return;
  }

  const assetUrl = new URL(firstAsset, entryUrl).href;
  const assetResponse = await fetchImpl(assetUrl, {
    method: 'HEAD',
    cache: 'no-store',
  });
  if (!assetResponse.ok) {
    throw new Error(
      `ESM remoteEntry at ${entryUrl} imports ${assetUrl} which returned HTTP ${assetResponse.status}. Publish the remote /assets chunks (redeploy schema-ui-mf-remote).`
    );
  }
}

/**
 * Native-import an ESM URL without going through webpack's `import()`.
 * CRA strips webpackIgnore, and webpack then rewrites the URL (often to .json).
 */
export function importRemoteEsmModule(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = `${IMPORT_CALLBACK_PREFIX}${Math.random().toString(36).slice(2)}`;
    const successKey = `${id}_ok`;
    const errorKey = `${id}_err`;
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      Promise.resolve(import(${JSON.stringify(url)}))
        .then((m) => window[${JSON.stringify(successKey)}](m))
        .catch((err) => window[${JSON.stringify(errorKey)}](err));
    `;

    const win = window as unknown as Record<string, unknown>;
    let settled = false;

    const cleanup = (): void => {
      script.remove();
      delete win[successKey];
      delete win[errorKey];
    };

    const settle = (fn: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      fn();
    };

    win[successKey] = (mod: unknown) => {
      settle(() => resolve(mod));
    };
    win[errorKey] = (err: unknown) => {
      settle(() => reject(err instanceof Error ? err : new Error(String(err))));
    };

    script.onerror = () => {
      settle(() => {
        reject(new Error(`Failed to load ESM module: ${url}`));
      });
    };

    document.head.appendChild(script);
  });
}
