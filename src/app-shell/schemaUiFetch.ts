import { getSchemaUiRemoteBaseUrl } from '~/app-shell/remoteUrls';

let installCount = 0;
let originalFetch: typeof fetch | null = null;

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

/**
 * schema-ui EntityPage uses GET for schema/list and PUT for update.
 * Cached GETs make update look like a no-op and can poison /schema.
 */
export function shouldBypassHttpCache(
  url: string,
  remoteBaseUrl: string
): boolean {
  return url.startsWith(remoteBaseUrl);
}

export function installSchemaUiNetworkFetch(): void {
  if (installCount === 0) {
    const remoteBaseUrl = getSchemaUiRemoteBaseUrl();
    originalFetch = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (shouldBypassHttpCache(url, remoteBaseUrl)) {
        return originalFetch!(input, { ...init, cache: 'no-store' });
      }
      return originalFetch!(input, init);
    }) as typeof fetch;
  }
  installCount += 1;
}

export function uninstallSchemaUiNetworkFetch(): void {
  if (installCount === 0) {
    return;
  }
  installCount -= 1;
  if (installCount === 0 && originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
}

export function resetSchemaUiNetworkFetchForTests(): void {
  if (originalFetch) {
    window.fetch = originalFetch;
  }
  originalFetch = null;
  installCount = 0;
}
