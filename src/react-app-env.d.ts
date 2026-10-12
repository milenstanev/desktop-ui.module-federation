/// <reference types="react-scripts" />

declare global {
  interface Window {
    __webpack_init_sharing__?: (scope: string) => Promise<void>;
    __webpack_share_scopes__?: { default: unknown };
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export {};
