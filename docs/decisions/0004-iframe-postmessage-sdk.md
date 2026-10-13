# ADR 0004: Iframe communication via window postMessage

## Status

Accepted

## Context

JSPM and similar apps run in a cross-origin iframe. They cannot import host
React, inject Redux slices, or read `parent` DOM. Teams still need events
(ready, close, custom Angular actions) to reach desktop-ui.

Sharing a JS object on `window` across origins is blocked by the browser.

## Decision

Use a JSON `postMessage` envelope (`channel: desktop-ui`). Inside the iframe,
expose `window.desktopUi` as a facade so AngularJS can emit without knowing
postMessage. The host listens on `window` `message`, allowlists the iframe
origin and `windowId`, then re-dispatches `desktop-ui:iframe`.

## Consequences

- **Pros**: Works for AngularJS, Vue, and static HTML; origin-checked; no
  `eval`; guests stay independent deploys.
- **Cons**: Guests must include a few lines of SDK or postMessage; no shared
  memory; handshake query params required.
- **Rejected**: Module Federation for AngularJS (Webpack 5 host vs AngularJS 1).
  Direct `window.parent.*` object assignment (cross-origin).
