import { FORM_TYPES } from '~/shared/constants';

export type SchemaField = {
  formType?: string;
  default?: unknown;
};

export type EntitySchema = Record<string, SchemaField>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isSchemaField(value: unknown): value is SchemaField {
  return isRecord(value);
}

/**
 * Project a domain record from the schema. The schema is the design:
 * keys, defaults, and control types come from it. Source data may fill
 * those slots; it must not invent fields the schema does not name.
 */
export function materializeRecordFromSchema(
  schema: unknown,
  source?: unknown
): Record<string, unknown> {
  if (!isRecord(schema)) {
    return {};
  }

  const existing = isRecord(source) ? source : {};
  const record: Record<string, unknown> = {};

  if (typeof existing._id === 'string' && existing._id.length > 0) {
    record._id = existing._id;
  }

  Object.keys(schema).forEach((key) => {
    const field = schema[key];
    if (!isSchemaField(field)) {
      return;
    }
    if (existing[key] !== undefined) {
      record[key] = existing[key];
      return;
    }
    if (field.default !== undefined) {
      record[key] = field.default;
      return;
    }
    if (field.formType === FORM_TYPES.CHECKBOX) {
      record[key] = false;
      return;
    }
    record[key] = '';
  });

  return record;
}

export function parseEntitySchema(value: unknown): EntitySchema | null {
  if (!isRecord(value)) {
    return null;
  }
  const schema: EntitySchema = {};
  Object.keys(value).forEach((key) => {
    const field = value[key];
    if (isSchemaField(field)) {
      schema[key] = field;
    }
  });
  return Object.keys(schema).length > 0 ? schema : null;
}
