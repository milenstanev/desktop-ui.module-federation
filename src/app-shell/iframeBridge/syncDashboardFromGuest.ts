import { upsertSchemaUiRecord } from '~/app-shell/schemaUiFetch';
import {
  createIframeEnvelope,
  DASHBOARD_DATA_SYNC_EVENT,
  HOST_EVENT,
  IFRAME_QUERY,
  originOfUrl,
  SCHEMA_ENTITY,
} from './protocol';

type EntityRecord = Record<string, unknown>;

function isRecord(value: unknown): value is EntityRecord {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function parseEntityUpdatePayload(
  payload: unknown
): { entity: string; record: EntityRecord } | null {
  if (!isRecord(payload)) {
    return null;
  }

  const nested = payload.record;
  const record = isRecord(nested) ? nested : payload;
  const entityValue = payload.entity;
  const entity =
    typeof entityValue === 'string' && entityValue.length > 0
      ? entityValue
      : SCHEMA_ENTITY.USERS;

  if (typeof record._id !== 'string' || record._id.length === 0) {
    return null;
  }

  return { entity, record };
}

function broadcastDashboardSync(entity: string, record: EntityRecord): void {
  document.querySelectorAll('iframe').forEach((node) => {
    if (!(node instanceof HTMLIFrameElement) || !node.src) {
      return;
    }
    const origin = originOfUrl(node.src);
    const target = node.contentWindow;
    if (!origin || !target) {
      return;
    }
    let windowId = '';
    try {
      windowId =
        new URL(node.src).searchParams.get(IFRAME_QUERY.WINDOW_ID) ?? '';
    } catch {
      windowId = '';
    }
    target.postMessage(
      createIframeEnvelope(windowId, HOST_EVENT.DASHBOARD_SYNC, {
        entity,
        record,
      }),
      origin
    );
  });
}

/**
 * Persist a guest (Angular) record into the schema-ui overlay and notify
 * every dashboard surface: schema-ui remotes remount, iframe guests receive
 * `dashboardSync`.
 */
export function applyGuestEntityUpdate(payload: unknown): EntityRecord | null {
  const parsed = parseEntityUpdatePayload(payload);
  if (!parsed) {
    return null;
  }

  const saved = upsertSchemaUiRecord(parsed.entity, parsed.record);
  if (!saved) {
    return null;
  }

  window.dispatchEvent(
    new CustomEvent(DASHBOARD_DATA_SYNC_EVENT, {
      detail: { entity: parsed.entity, record: saved },
    })
  );
  broadcastDashboardSync(parsed.entity, saved);
  return saved;
}
