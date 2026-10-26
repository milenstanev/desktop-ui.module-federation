import { OMDB_API, OMDB_API_KEY } from '../constants.js';

export async function fetchOmdb(params) {
  const url = new URL(OMDB_API);
  url.searchParams.set('apikey', OMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}
