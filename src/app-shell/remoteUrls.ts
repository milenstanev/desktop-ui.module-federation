export interface LocationLike {
  hostname: string;
  origin: string;
}

function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  );
}

/**
 * Resolve the analytics remote base URL (no trailing slash, no remoteEntry.js).
 * Production without an explicit env var uses `{origin}/remote` so we do not
 * pick up the host app's own `/remoteEntry.js`.
 */
const DEFAULT_SCHEMA_UI_REMOTE_URL = 'https://schema-ui-mf-remote.vercel.app';

export function getAnalyticsRemoteBaseUrl(
  env: {
    NODE_ENV?: string;
    REACT_APP_ANALYTICS_REMOTE_URL?: string;
  } = process.env,
  location: LocationLike = window.location
): string {
  const configured = env.REACT_APP_ANALYTICS_REMOTE_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (isLocalHost(location.hostname)) {
    return 'http://localhost:3002';
  }

  if (env.NODE_ENV === 'production') {
    return `${location.origin}/remote`;
  }

  return 'http://localhost:3002';
}

export function getSchemaUiRemoteBaseUrl(
  env: {
    NODE_ENV?: string;
    REACT_APP_SCHEMA_UI_REMOTE_URL?: string;
  } = process.env
): string {
  const configured = env.REACT_APP_SCHEMA_UI_REMOTE_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return DEFAULT_SCHEMA_UI_REMOTE_URL;
}

export function buildRemoteEntryUrls(
  baseUrl: string,
  origin?: string,
  options?: { includeAlternatePaths?: boolean }
): string[] {
  const resolved = new URL(baseUrl, origin ?? window.location.origin);
  const basePath = resolved.pathname.replace(/\/+$/, '');

  const toEntryUrl = (path: string): string => {
    const normalizedPath = path.replace(/\/+$/, '');
    return normalizedPath
      ? `${resolved.origin}${normalizedPath}/remoteEntry.js`
      : `${resolved.origin}/remoteEntry.js`;
  };

  const primary = toEntryUrl(basePath);
  if (options?.includeAlternatePaths === false) {
    return [primary];
  }

  const candidates: string[] = [primary];

  if (basePath.endsWith('/remote')) {
    const rootPath = basePath.slice(0, -'/remote'.length);
    candidates.push(toEntryUrl(rootPath));
  } else {
    candidates.push(toEntryUrl(`${basePath}/remote`));
  }

  candidates.push(toEntryUrl(''));

  return Array.from(new Set(candidates));
}
