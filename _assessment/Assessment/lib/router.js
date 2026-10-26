/**
 * Router
 */
import { VIEWS_BASE } from '../constants.js';

/**
 * Routes collection
 * @type {{view: string, path: string}[]}
 */
export const router = [];

/**
 * 404 Page
 * @type {{mainElement: string, pageNotFound: string}}
 */
export const settings = {
  mainElement: 'main',
  pageNotFound: `${VIEWS_BASE}/404.js`,
};

let currentView = null;
let navigationId = 0;

const routeSegment = (path) => {
  const segment = path.split('/')[1];
  return segment ? segment : '';
};

const renderView = (viewModule) => {
  if (currentView && typeof currentView.destroy === 'function') {
    currentView.destroy();
  }

  currentView = new viewModule.default(
    {},
    document.getElementById(settings.mainElement),
  );
};

/**
 * Handle route hash change
 */
const handleHash = () => {
  const id = ++navigationId;
  const path = location.hash.replace(/^#/, '').toLowerCase();
  const segment = routeSegment(path);
  const route = router.find((item) => routeSegment(item.path) === segment);
  const viewPath = route ? route.view : settings.pageNotFound;

  import(viewPath).then(
    (viewModule) => {
      if (id !== navigationId) return;
      renderView(viewModule);
    },
    (error) => {
      console.error(`Error: ${error} \nBad module path`);
    },
  );
};

/**
 * Listen for hash changes. Call this after routes are registered.
 */
export const start = () => {
  window.addEventListener('hashchange', handleHash);
  handleHash();
};
