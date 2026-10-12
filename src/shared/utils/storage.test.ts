import { safeParseJson } from './storage';

const TEST_KEYS = {
  MISSING: 'missing',
  KEY: 'key',
} as const;

const TEST_VALUES = {
  DEFAULT: 'default',
  FALLBACK: 'fallback',
  NOT_JSON: 'not json',
  STRING: 'string',
  ZERO: 0,
} as const;

const TEST_OBJECT = { a: 1 };
const EMPTY_OBJECT = {};
const TYPE_NUMBER = 'number';

describe('safeParseJson', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns fallback when key does not exist', () => {
    expect(safeParseJson(TEST_KEYS.MISSING, TEST_VALUES.DEFAULT)).toBe(
      TEST_VALUES.DEFAULT
    );
  });

  it('parses valid JSON', () => {
    localStorage.setItem(TEST_KEYS.KEY, JSON.stringify(TEST_OBJECT));
    expect(safeParseJson(TEST_KEYS.KEY, EMPTY_OBJECT)).toEqual(TEST_OBJECT);
  });

  it('returns fallback on parse error', () => {
    localStorage.setItem(TEST_KEYS.KEY, TEST_VALUES.NOT_JSON);
    expect(safeParseJson(TEST_KEYS.KEY, TEST_VALUES.FALLBACK)).toBe(
      TEST_VALUES.FALLBACK
    );
  });

  it('returns fallback when validator rejects', () => {
    localStorage.setItem(TEST_KEYS.KEY, JSON.stringify(TEST_VALUES.STRING));
    const validator = (v: unknown): v is number => typeof v === TYPE_NUMBER;
    expect(safeParseJson(TEST_KEYS.KEY, TEST_VALUES.ZERO, validator)).toBe(
      TEST_VALUES.ZERO
    );
  });
});
