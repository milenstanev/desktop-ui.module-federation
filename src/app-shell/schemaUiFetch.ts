import { getSchemaUiRemoteBaseUrl } from '~/app-shell/remoteUrls';
import { LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY } from '~/features/Desktop/config';
import { safeParseJson } from '~/shared/utils/storage';

type EntityRecord = Record<string, unknown>;
type EntityRecords = Record<string, EntityRecord>;
type OverlayState = Record<string, EntityRecords>;

let installCount = 0;
let originalFetch: typeof fetch | null = null;

export interface SchemaUiApiTarget {
  entity: string;
  recordId: string | null;
  isSchema: boolean;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) {
    return init.method.toUpperCase();
  }
  if (input instanceof Request) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

function isOverlayState(value: unknown): value is OverlayState {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((entity) => {
    if (entity == null || typeof entity !== 'object' || Array.isArray(entity)) {
      return false;
    }
    return Object.values(entity).every(
      (row) => row != null && typeof row === 'object' && !Array.isArray(row)
    );
  });
}

function readOverlay(): OverlayState {
  return safeParseJson<OverlayState>(
    LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY,
    {},
    isOverlayState
  );
}

function writeOverlay(overlay: OverlayState): void {
  localStorage.setItem(
    LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY,
    JSON.stringify(overlay)
  );
}

export function upsertSchemaUiRecord(
  entity: string,
  record: EntityRecord
): EntityRecord | null {
  const recordId = record._id;
  if (typeof recordId !== 'string' || recordId.length === 0) {
    return null;
  }
  return upsertOverlay(entity, recordId, record);
}

function upsertOverlay(
  entity: string,
  recordId: string,
  record: EntityRecord
): EntityRecord {
  const overlay = readOverlay();
  const entityRecords = overlay[entity] ?? {};
  const nextRecord = { ...entityRecords[recordId], ...record, _id: recordId };
  writeOverlay({
    ...overlay,
    [entity]: { ...entityRecords, [recordId]: nextRecord },
  });
  return nextRecord;
}

function removeOverlayRecord(entity: string, recordId: string): void {
  const overlay = readOverlay();
  const entityRecords = overlay[entity];
  if (!entityRecords || !(recordId in entityRecords)) {
    return;
  }
  const nextEntity = { ...entityRecords };
  delete nextEntity[recordId];
  writeOverlay({ ...overlay, [entity]: nextEntity });
}

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseJsonBody(init?: RequestInit): EntityRecord | null {
  if (typeof init?.body !== 'string') {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(init.body);
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as EntityRecord;
  } catch {
    return null;
  }
}

/**
 * UsersPage/EntityPage default apiBase is `/api`, so the browser calls
 * the desktop-ui origin. Point those at the schema-ui remote.
 */
export function resolveSchemaUiFetchUrl(
  url: string,
  remoteBaseUrl: string,
  pageOrigin: string = window.location.origin
): string {
  try {
    const parsed = new URL(url, pageOrigin);
    if (parsed.origin === pageOrigin && parsed.pathname.startsWith('/api/')) {
      return `${remoteBaseUrl}${parsed.pathname}${parsed.search}`;
    }
    return parsed.href;
  } catch {
    return url;
  }
}

/**
 * schema-ui EntityPage uses GET for schema/list and PUT for update.
 * Cached GETs make update look like a no-op and can poison /schema.
 */
export function shouldBypassHttpCache(
  url: string,
  remoteBaseUrl: string,
  pageOrigin: string = window.location.origin
): boolean {
  return resolveSchemaUiFetchUrl(url, remoteBaseUrl, pageOrigin).startsWith(
    remoteBaseUrl
  );
}

export function parseSchemaUiApiUrl(
  url: string,
  remoteBaseUrl: string
): SchemaUiApiTarget | null {
  if (!url.startsWith(remoteBaseUrl)) {
    return null;
  }
  const path = new URL(url).pathname.replace(/\/+$/, '');
  const match = path.match(/^\/api\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) {
    return null;
  }
  const rest = match[2] ?? null;
  if (rest === 'schema') {
    return { entity: match[1], recordId: null, isSchema: true };
  }
  return { entity: match[1], recordId: rest, isSchema: false };
}

export function attachRecordIdToJsonBody(
  init: RequestInit | undefined,
  recordId: string
): RequestInit {
  const parsed = parseJsonBody(init);
  if (!parsed) {
    return { ...init };
  }
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return {
    ...init,
    headers,
    body: JSON.stringify({ ...parsed, _id: recordId }),
  };
}

export function applyOverlayToList(entity: string, rows: unknown[]): unknown[] {
  const overlay = readOverlay()[entity] ?? {};
  const byId = new Map<string, EntityRecord>();
  rows.forEach((row) => {
    if (row == null || typeof row !== 'object' || Array.isArray(row)) {
      return;
    }
    const record = row as EntityRecord;
    const id = record._id;
    if (typeof id === 'string' && id.length > 0) {
      byId.set(id, record);
    }
  });
  Object.entries(overlay).forEach(([id, record]) => {
    byId.set(id, { ...byId.get(id), ...record, _id: id });
  });
  return Array.from(byId.values());
}

async function mergeCollectionResponse(
  response: Response,
  entity: string
): Promise<Response> {
  if (!response.ok) {
    return response;
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!Array.isArray(payload)) {
    return jsonResponse(payload, response.status);
  }
  return jsonResponse(applyOverlayToList(entity, payload), response.status);
}

async function mergeRecordResponse(
  response: Response,
  entity: string,
  recordId: string
): Promise<Response> {
  if (response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    if (
      payload != null &&
      typeof payload === 'object' &&
      !Array.isArray(payload)
    ) {
      return jsonResponse(
        upsertOverlay(entity, recordId, payload as EntityRecord),
        response.status
      );
    }
    return jsonResponse(payload, response.status);
  }
  if (response.status === 404) {
    const overlayRecord = readOverlay()[entity]?.[recordId];
    if (overlayRecord) {
      return jsonResponse(overlayRecord, 200);
    }
  }
  return response;
}

async function persistPutResponse(
  response: Response,
  entity: string,
  recordId: string,
  init?: RequestInit
): Promise<Response> {
  if (response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    if (
      payload != null &&
      typeof payload === 'object' &&
      !Array.isArray(payload)
    ) {
      return jsonResponse(
        upsertOverlay(entity, recordId, payload as EntityRecord),
        response.status
      );
    }
    return jsonResponse(payload, response.status);
  }

  if (response.status !== 404) {
    return response;
  }

  const body = parseJsonBody(init) ?? {};
  return jsonResponse(upsertOverlay(entity, recordId, body), 200);
}

async function persistPostResponse(
  response: Response,
  entity: string
): Promise<Response> {
  if (!response.ok) {
    return response;
  }
  const payload: unknown = await response.json().catch(() => null);
  if (
    payload != null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof (payload as EntityRecord)._id === 'string'
  ) {
    const record = payload as EntityRecord;
    return jsonResponse(
      upsertOverlay(entity, String(record._id), record),
      response.status
    );
  }
  return jsonResponse(payload, response.status);
}

async function handleSchemaUiFetch(
  url: string,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  remoteBaseUrl: string,
  fetchImpl: typeof fetch
): Promise<Response> {
  const target = parseSchemaUiApiUrl(url, remoteBaseUrl);
  const method = requestMethod(input, init);
  let nextInit: RequestInit = { ...init, cache: 'no-store' };

  if (method === 'PUT' && target?.recordId) {
    nextInit = attachRecordIdToJsonBody(nextInit, target.recordId);
    nextInit.cache = 'no-store';
  }

  const response = await fetchImpl(input, nextInit);

  if (!target || target.isSchema) {
    return response;
  }

  if (method === 'GET' && !target.recordId) {
    return mergeCollectionResponse(response, target.entity);
  }
  if (method === 'GET' && target.recordId) {
    return mergeRecordResponse(response, target.entity, target.recordId);
  }
  if (method === 'PUT' && target.recordId) {
    return persistPutResponse(
      response,
      target.entity,
      target.recordId,
      nextInit
    );
  }
  if (method === 'POST' && !target.recordId) {
    return persistPostResponse(response, target.entity);
  }
  if (method === 'DELETE' && target.recordId) {
    removeOverlayRecord(target.entity, target.recordId);
  }
  return response;
}

export function installSchemaUiNetworkFetch(): void {
  if (installCount === 0) {
    const remoteBaseUrl = getSchemaUiRemoteBaseUrl();
    originalFetch = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = resolveSchemaUiFetchUrl(requestUrl(input), remoteBaseUrl);
      if (!url.startsWith(remoteBaseUrl)) {
        return originalFetch!(input, init);
      }
      const nextInput: RequestInfo | URL =
        typeof input === 'string' || input instanceof URL
          ? url
          : new Request(url, input);
      return handleSchemaUiFetch(
        url,
        nextInput,
        init,
        remoteBaseUrl,
        originalFetch!
      );
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
  localStorage.removeItem(LOCAL_STORAGE_SCHEMA_UI_OVERLAY_KEY);
}
