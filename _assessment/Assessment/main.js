import { router, start } from './lib/router.js';
import { VIEWS_BASE } from './constants.js';

router.push(
  { path: '/', view: `${VIEWS_BASE}/movieSearch/index.js` },
  { path: '/movie-details', view: `${VIEWS_BASE}/movieDetails/index.js` },
  { path: '/test', view: `${VIEWS_BASE}/test.js` },
);

if (location.hash === '' || location.hash === '#') {
  location.hash = '#/';
}

start();
