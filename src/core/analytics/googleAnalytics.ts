/**
 * Google Analytics 4 (GA4) integration
 *
 * Loads gtag.js and initializes with the measurement ID from
 * REACT_APP_GA_MEASUREMENT_ID. Only loads in production when the ID is set.
 */

const MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics. Loads the gtag script and configures the property.
 * No-op when REACT_APP_GA_MEASUREMENT_ID is not set or in development.
 */
export function initGoogleAnalytics(): void {
  if (!MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const gtag = (...args: unknown[]): void => {
    dataLayer.push(args);
  };
  (window as Window & { gtag: typeof gtag }).gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);
}

/**
 * Send a custom event to Google Analytics.
 * No-op when GA is not initialized.
 */
export function sendGAEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    return;
  }
  const gtag = (
    window as Window & { gtag?: (a: string, b: string, c?: object) => void }
  ).gtag;
  if (gtag) {
    gtag('event', eventName, params);
  }
}
