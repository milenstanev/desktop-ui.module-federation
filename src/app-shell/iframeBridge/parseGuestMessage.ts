import {
  IFRAME_BRIDGE_CHANNEL,
  IFRAME_BRIDGE_VERSION,
  MESSAGE_KIND,
  type IframeEnvelope,
  type IframeMessageKind,
} from './protocol';

const MESSAGE_KIND_VALUES = new Set<string>(Object.values(MESSAGE_KIND));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMessageKind(value: string): value is IframeMessageKind {
  return MESSAGE_KIND_VALUES.has(value);
}

export function parseGuestMessage(
  data: unknown,
  expectedWindowId: string
): IframeEnvelope | null {
  if (!isRecord(data)) {
    return null;
  }

  const { v, channel, id, windowId, type, name, payload } = data;

  if (v !== IFRAME_BRIDGE_VERSION) {
    return null;
  }

  if (channel !== IFRAME_BRIDGE_CHANNEL) {
    return null;
  }

  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }

  if (typeof windowId !== 'string' || windowId !== expectedWindowId) {
    return null;
  }

  if (typeof type !== 'string' || !isMessageKind(type)) {
    return null;
  }

  if (typeof name !== 'string' || name.length === 0) {
    return null;
  }

  const envelope: IframeEnvelope = {
    v: IFRAME_BRIDGE_VERSION,
    channel: IFRAME_BRIDGE_CHANNEL,
    id,
    windowId,
    type,
    name,
  };

  if (payload !== undefined) {
    envelope.payload = payload;
  }

  return envelope;
}

export function readSetTitle(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }
  const { title } = payload;
  if (typeof title !== 'string' || title.trim().length === 0) {
    return null;
  }
  return title;
}
