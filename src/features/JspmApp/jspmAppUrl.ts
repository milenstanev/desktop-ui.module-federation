export const DEFAULT_JSPM_APP_URL = 'https://jspm-app.vercel.app';

export function getJspmAppUrl(
  env: {
    NODE_ENV?: string;
    REACT_APP_JSPM_APP_URL?: string;
  } = process.env
): string {
  const configured = env.REACT_APP_JSPM_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return DEFAULT_JSPM_APP_URL;
}
