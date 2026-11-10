# ADR 0005: Runtime Module Federation for Remote Features

## Status

Accepted

## Context

The original desktop-ui starter split features with `import()` inside a single build ([ADR 0001](./0001-dynamic-reducer-injection.md)). Code splitting keeps the initial bundle small, but every feature still ships with the dashboard. A team that owns one feature can't release without rebuilding and redeploying the whole app.

We wanted:

- Features built and deployed independently (analytics remote, schema-ui forms)
- No page reload or iframe when such a feature appears in a window
- The same window, reducer injection, and error handling as local features
- desktop-ui itself embeddable in another shell

## Decision

Use **Webpack 5 Module Federation**, resolved at runtime:

1. **desktop-ui is a federation container** (`desktopUI`), configured in `config-overrides.js`. It exposes `./App`, `./Desktop`, `./Counter`, and `./Notes`, and shares React, React DOM, React Redux, and Redux Toolkit as singletons. `src/index.tsx` uses an async `import('./bootstrap')` boundary.
2. **Remotes are not declared statically** (`remotes: {}`). `src/app-shell/loadRemoteFeature.ts` keeps a runtime config map (`name`, candidate `entryUrls`, `kind`, `expose`) whose URLs come from env vars with safe defaults (`remoteUrls.ts`).
3. **Two container kinds are supported**:
   - `webpack-script`: a classic `remoteEntry.js` that sets a global (`analytics`)
   - `esm`: an ES-module `remoteEntry.js` from Vite (`schemaUi`), validated and then imported natively
4. **One contract**: whatever a remote exposes is normalised to a `FeatureModule` and stored in the feature registry. Reducers go through the same `reducerManager`.
5. **The host seeds the share scope** with its own React modules before `container.init()`, so remotes never bring a second React.

## Consequences

### Positive

- Analytics and schema-ui ship on their own cadence. The dashboard picks up new versions on the next load.
- Remote windows behave like local ones: they persist, can be focused and closed, and fail inside their own window.
- URLs can be configured per environment, and a fallback candidate list tolerates `/remote` path routing.
- The standalone `host/` app proves that desktop-ui can be consumed as a remote.

### Negative

- Shared dependency versions must be coordinated across repos. A mismatch surfaces only at runtime.
- More deployables, and runtime failure modes (CORS, wrong content type, missing chunks) that need defensive checks and clear errors.
- The CRA build needs `react-app-rewired`. Native ESM import has to bypass webpack's `import()` rewriting.
- E2E tests need the analytics remote running (`scripts/start-e2e-servers.sh`). The schema-ui suite depends on an external deployment.

## Alternatives Considered

- **Build-time packages (npm libraries)**: simple, but every update forces a dashboard redeploy, which defeats independent release.
- **Iframes for everything**: strongest isolation, but no shared React or Redux, an awkward layout, and every interaction goes through messaging. Kept only for non-React guests ([ADR 0004](./0004-iframe-postmessage-sdk.md)).
- **Static `remotes` in webpack config**: less code, but URLs are fixed at build time and there's no graceful fallback when a remote is down.
- **single-spa / import maps**: framework-agnostic, but heavier to adopt, and it doesn't reuse the existing Redux store and window model as directly.
