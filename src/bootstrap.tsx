import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import {
  initGoogleAnalytics,
  sendGAEvent,
} from './core/analytics/googleAnalytics';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

initGoogleAnalytics();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA capabilities
const enablePWA =
  process.env.REACT_APP_ENABLE_PWA === 'true' ||
  process.env.NODE_ENV === 'production';

if (enablePWA) {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    },
  });
} else {
  serviceWorkerRegistration.unregister();
}

const enableVitalsLogging =
  process.env.REACT_APP_ENABLE_VITALS_LOGGING === 'true';

reportWebVitals((metric) => {
  if (enableVitalsLogging) {
    console.log(`📊 ${metric.name}:`, {
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
    });
  }

  if (process.env.NODE_ENV === 'production') {
    sendGAEvent(metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
});
