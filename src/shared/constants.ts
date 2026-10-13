export const APP_STRINGS = {
  HEADING_TITLE: 'Desktop UI',
  BUTTON_ADD_SIMPLE_EXAMPLE: 'Add Simple Example',
  BUTTON_ADD_COUNTER: 'Add Counter',
  BUTTON_ADD_FORM_EDITOR: 'Add Form Editor',
  BUTTON_ADD_NOTES: 'Add Notes',
  BUTTON_ADD_TIMER: 'Add Timer',
  BUTTON_ADD_ANALYTICS: 'Add Analytics',
  BUTTON_ADD_FORMS: 'Add Forms',
  BUTTON_ADD_JSPM_APP: 'Add JSPM App',
  ORGANIZE_GRID_BUTTON: 'Organize windows in grid',
  RESET_LAYOUT_BUTTON: 'Reset window layouts',
  CLOSE_ALL_BUTTON: 'Close all windows',
  CONFIGURATOR_BUTTON: 'Dashboard layout JSON',
  CONFIGURATOR_BUTTON_SHORT: 'JSON',
  CONFIGURATOR_TITLE: 'Dashboard configuration',
  CONFIGURATOR_HELP:
    'Paste a JSON snapshot to replace the current windows and layouts. Saved JSON becomes the initial dashboard after Close All and reload.',
  CONFIGURATOR_APPLY: 'Apply JSON',
  CONFIGURATOR_COPY: 'Copy current JSON',
  CONFIGURATOR_COPY_URL: 'Copy URL',
  CONFIGURATOR_DEFAULT: 'Use built-in dashboard',
  CONFIGURATOR_CLOSE: 'Close configurator',
  CONFIGURATOR_TEXTAREA_LABEL: 'Dashboard JSON',
  CONFIGURATOR_INVALID: 'That JSON is not a valid dashboard configuration.',
  CONFIGURATOR_APPLIED: 'Dashboard configuration applied.',
  CONFIGURATOR_COPIED: 'Current dashboard JSON is in the editor.',
  CONFIGURATOR_URL_COPIED: 'Share URL is in the clipboard.',
  CONFIGURATOR_RESTORED: 'Built-in dashboard restored.',
} as const;

export const APP_TEST = {
  HEADING_TITLE: new RegExp(APP_STRINGS.HEADING_TITLE, 'i'),
  BUTTON_ADD_SIMPLE_EXAMPLE: new RegExp(
    APP_STRINGS.BUTTON_ADD_SIMPLE_EXAMPLE,
    'i'
  ),
  BUTTON_ADD_COUNTER: new RegExp(APP_STRINGS.BUTTON_ADD_COUNTER, 'i'),
  BUTTON_ADD_FORM_EDITOR: new RegExp(APP_STRINGS.BUTTON_ADD_FORM_EDITOR, 'i'),
  BUTTON_ADD_NOTES: new RegExp(APP_STRINGS.BUTTON_ADD_NOTES, 'i'),
  BUTTON_ADD_TIMER: new RegExp(APP_STRINGS.BUTTON_ADD_TIMER, 'i'),
  BUTTON_ADD_ANALYTICS: new RegExp(APP_STRINGS.BUTTON_ADD_ANALYTICS, 'i'),
  BUTTON_ADD_FORMS: new RegExp(APP_STRINGS.BUTTON_ADD_FORMS, 'i'),
  BUTTON_ADD_JSPM_APP: new RegExp(APP_STRINGS.BUTTON_ADD_JSPM_APP, 'i'),
} as const;

export const COMPONENT_NAMES = {
  SIMPLE_EXAMPLE: 'Simple Example',
  COUNTER: 'Counter',
  FORM_EDITOR: 'Form Editor',
  NOTES: 'Notes',
  TIMER: 'Timer',
  ANALYTICS: 'Analytics',
  FORMS: 'Forms',
  JSPM_APP: 'JSPM App',
} as const;

export const REDUCER_NAMES = {
  COUNTER: 'CounterReducer',
  NOTES: 'NotesReducer',
  ANALYTICS: 'analytics',
} as const;

export const MICRO_FRONTEND_STRINGS = {
  TOGGLE_LABEL: 'Architecture',
  TOGGLE_ARIA_LABEL: 'Micro-frontend architecture demo',
  DESCRIPTION_LOCAL: 'Local features',
  DESCRIPTION_LOCAL_DETAIL: 'loaded from monolith (Counter, Notes, Timer…).',
  DESCRIPTION_REMOTE: 'Remote features',
  DESCRIPTION_REMOTE_DETAIL: 'loaded via Module Federation at runtime.',
  LOAD_ANALYTICS: 'Load Analytics Feature',
  LOADING: 'Loading…',
  LOAD_ERROR_FALLBACK: 'Failed to load Analytics remote',
  LOADED_SUCCESS: 'Analytics remote loaded.',
  LOAD_FAILED_PREFIX: 'Feature',
  LOAD_FAILED_MIDDLE: 'failed to load.',
  LOAD_FAILED_UNKNOWN: 'Failed to load remote',
  REMOTE_SUFFIX: '(remote)',
  VIEWS_LABEL: 'Views:',
  CLICKS_LABEL: 'Clicks:',
  INCREMENT: '+1',
  INCREMENT_VIEWS_ARIA: 'Increment views',
  INCREMENT_CLICKS_ARIA: 'Increment clicks',
  LOADED_CAPTION: 'Loaded from analytics remote via Module Federation',
} as const;

export const WINDOW_STRINGS = {
  CLOSE_BUTTON: 'Remove',
  CLOSE_ARIA_LABEL: 'Close window',
  FOCUS_ARIA_LABEL: 'Focus window',
  WINDOW_ARIA_LABEL: 'Window',
} as const;

export const ERROR_BOUNDARY_STRINGS = {
  TITLE: 'Something went wrong',
  BUTTON_TRY_AGAIN: 'Try again',
  CONSOLE_ERROR_PREFIX: 'Uncaught error:',
} as const;

export const THEME_STRINGS = {
  LIGHT_MODE: 'Light',
  DARK_MODE: 'Dark',
  GRADIENT_MODE: 'Gradient',
  MODE_SUFFIX: 'mode',
  SWITCH_TO_PREFIX: 'Switch to',
  THEME_SUFFIX: 'theme',
  SELECT_THEME_LABEL: 'Theme',
} as const;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'gradient', label: 'Gradient' },
] as const;

export const NOTES_STRINGS = {
  PLACEHOLDER: 'New note...',
  ADD_BUTTON: 'Add',
  REMOVE_BUTTON: 'Remove',
  ADD_ARIA_LABEL: 'Add note',
  NEW_NOTE_ARIA_LABEL: 'New note',
  NOTES_LIST_ARIA_LABEL: 'Notes list',
  REMOVE_NOTE_ARIA_LABEL_PREFIX: 'Remove note:',
  TEST_ID: 'notes-feature',
} as const;

export const TIMER_STRINGS = {
  START_BUTTON: 'Start',
  PAUSE_BUTTON: 'Pause',
  RESET_BUTTON: 'Reset',
  START_ARIA_LABEL: 'Start timer',
  PAUSE_ARIA_LABEL: 'Pause timer',
  RESET_ARIA_LABEL: 'Reset timer',
  TEST_ID: 'timer-feature',
  TIMER_ROLE: 'timer',
  TIMER_ARIA_LIVE: 'polite',
} as const;

export const COUNTER_STRINGS = {
  INCREMENT_BUTTON: '+',
  DECREMENT_BUTTON: '-',
} as const;

export const FORM_EDITOR_STRINGS = {
  LOADING: 'Loading...',
  SUBMIT_BUTTON: 'Submit',
  ALERT_SUCCESS: 'Form is updated',
  ALERT_ERROR: 'Something went wrong',
  ERROR_UNKNOWN_TYPE: 'Unknown type',
  ERROR_API_PROBLEM: 'API problem',
} as const;

export const DESKTOP_STRINGS = {
  LOADING_FALLBACK: 'Loading...',
  ERROR_UNKNOWN_COMPONENT: 'Unknown component:',
  DESKTOP_ARIA_LABEL: 'Desktop application workspace',
} as const;

export const REMOTE_FEATURE_NAMES = {
  ANALYTICS: 'analytics',
  SCHEMA_UI: 'schemaUi',
} as const;

export const JSPM_APP_STRINGS = {
  IFRAME_TITLE: 'JSPM AngularJS application',
} as const;

export const LAYOUT_CONFIG = {
  BREAKPOINTS: { xl: 1920, lg: 1200, md: 996, sm: 768 },
  COLS: { xl: 12, lg: 12, md: 8, sm: 2 },
  DRAG_HANDLE_CLASS: 'drag-handle',
  Z_INDEX_FOCUSED: 10,
  Z_INDEX_NORMAL: 1,
  FORMS_WINDOW_HEIGHT: 8,
  JSPM_APP_WINDOW_HEIGHT: 8,
} as const;

export const KEYBOARD_SHORTCUTS = {
  CLOSE_WINDOW: 'Escape',
  CLOSE_WINDOW_ALT: 'w',
  ENTER: 'Enter',
  SPACE: ' ',
} as const;

export const FORM_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  CHECKBOX: 'checkbox',
  SELECT: 'select',
} as const;

// Reserved for future API integration
// export const HTTP_METHODS = {
//   GET: 'GET',
//   POST: 'POST',
//   PUT: 'PUT',
//   DELETE: 'DELETE',
// } as const;

// export const CONTENT_TYPES = {
//   JSON: 'application/json',
// } as const;

export const MIDDLEWARE_STRINGS = {
  PERSIST_ERROR: 'Failed to persist desktop state to localStorage',
} as const;

// Reserved for future use
// export const DOM_EVENTS = {
//   KEYDOWN: 'keydown',
// } as const;

export const VALIDATION_MESSAGES = {
  FIRST_NAME_REQUIRED: 'First name is required',
  FIRST_NAME_MIN_LENGTH: 'First name must be at least 2 characters',
  FIRST_NAME_MAX_LENGTH: 'First name must be less than 50 characters',
  LAST_NAME_REQUIRED: 'Last name is required',
  LAST_NAME_MIN_LENGTH: 'Last name must be at least 2 characters',
  LAST_NAME_MAX_LENGTH: 'Last name must be less than 50 characters',
  AGE_REQUIRED: 'Age is required',
  AGE_MIN: 'Must be at least 18 years old',
  AGE_MAX: 'Must be less than 120 years old',
  ROLE_REQUIRED: 'Role is required',
  FIELD_REQUIRED: 'This field is required',
  GENERIC_ERROR: 'Error',
} as const;

export const FORM_FIELD_LABELS = {
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  AGE: 'Age',
  IS_ACTIVE: 'Is Active',
  ROLE: 'Role',
} as const;

// Reserved for future form field mapping
// export const FORM_FIELD_NAMES = {
//   FIRST_NAME: 'firstName',
//   LAST_NAME: 'lastName',
//   AGE: 'age',
//   IS_ACTIVE: 'isActive',
//   ROLE: 'role',
// } as const;

export const SELECT_FIELD_STRINGS = {
  PLACEHOLDER_PREFIX: 'Select',
} as const;

export const ROLE_OPTIONS = {
  ADMIN: { value: 'admin', label: 'Administrator' },
  USER: { value: 'user', label: 'User' },
  GUEST: { value: 'guest', label: 'Guest' },
} as const;

export const MOCK_USER_DATA = {
  ID: 'user-123',
  FIRST_NAME: 'John',
  LAST_NAME: 'Doe',
  AGE: 30,
  IS_ACTIVE: true,
  ROLE: 'admin',
} as const;

export const API_ERROR_MESSAGES = {
  USER_ID_REQUIRED: 'User ID is required',
  SIMULATED_ERROR: 'Simulated API error',
} as const;

export const LOADER_STRINGS = {
  LOADING_TEXT: 'Loading...',
  LOADING_ARIA_LABEL: 'Loading',
} as const;
