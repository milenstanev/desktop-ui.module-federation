# Deployment

This repo deploys **three** Module Federation containers plus depends on external remotes (schema-ui, JSPM). CORS must allow the dashboard origin to load each `remoteEntry.js`.

---

## Containers

| Deployable | Package / path | Default ports (local) | Artifact |
| ---------- | -------------- | --------------------- | -------- |
| Dashboard (`desktopUI`) | repo root | `:3000` | `build/` including `remoteEntry.js` |
| Analytics remote | `src/features/remotes/analytics` | `:3002` | `dist/remoteEntry.js` |
| Host (consumes desktopUI) | `host/` | `:3001` | host build |

External (not built here):

- Forms: `https://schema-ui-mf-remote.vercel.app`
- JSPM iframe: `https://jspm-app.vercel.app`

---

## Dashboard (Vercel, recommended)

1. Connect the GitHub repo at [vercel.com](https://vercel.com).
2. Framework: Create React App. Build uses `vercel.json`:
   - `buildCommand`: `npm run build:vercel` (CRA build + `scripts/verify-remote-entry-build.sh`)
   - `outputDirectory`: `build`
   - `ignoreCommand`: skips non-`master` branches (`exit 0` skip / `exit 1` build)
3. Set production branch to `master`.
4. Optional env:
   - `REACT_APP_ANALYTICS_REMOTE_URL` — if analytics is **not** served from `{origin}/remote`
   - `REACT_APP_SCHEMA_UI_REMOTE_URL` — override Forms remote
   - `REACT_APP_GA_MEASUREMENT_ID` — GA4
   - `REACT_APP_ENABLE_PWA` — usually leave production default `true`

`build:vercel` **fails** if `build/remoteEntry.js` is missing or not listed in `asset-manifest.json`, so the host can always consume this deploy.

### Vercel microfrontends routing

[`microfrontends.json`](../microfrontends.json) routes `/remote` and `/remote/*` to the `analytics-remote` project. With that wiring, the production default `{window.location.origin}/remote` loads analytics without a separate env var.

CLI:

```bash
npx vercel
```

---

## Analytics remote (Vercel)

From repo root:

```bash
npm run analytics:deploy:vercel
npm run analytics:deploy:vercel:preview
```

Scripts live in `scripts/deploy-analytics-vercel.sh`. The analytics Vercel project must:

- Build from `src/features/remotes/analytics`
- Publish `dist/`
- Send `Access-Control-Allow-Origin` that allows the dashboard (the in-tree config uses `*`)
- Expose `remoteEntry.js` (deploy verifies the file exists)

Point the dashboard at it with `REACT_APP_ANALYTICS_REMOTE_URL=https://<analytics-project>.vercel.app` **or** attach it via microfrontends `/remote` routing as above.

---

## Host app (Vercel)

Consumes a deployed dashboard `remoteEntry.js`:

```bash
npm run host:deploy:vercel -- --remote-url https://<dashboard>.vercel.app
npm run host:deploy:vercel:preview -- --remote-url https://<dashboard>.vercel.app
```

See [`host/README.md`](../host/README.md). `REMOTE_URL` / `host/.env.production` must match the dashboard origin (no trailing `/remoteEntry.js` in the usual helper scripts—check the deploy script).

---

## Netlify (dashboard only)

1. Import the repo.
2. Build: `npm run build:vercel` (or `npm run build` if you do not need the remoteEntry verify step).
3. Publish directory: `build`.
4. Set the same `REACT_APP_*` env vars as on Vercel.
5. You still need a separate analytics deploy (or CDN path) with CORS; Netlify does not use `microfrontends.json`.

---

## GitHub Pages

Possible for the static dashboard `build/`, but Module Federation + separate remotes is awkward (no `/remote` routing, CORS, and `homepage` path prefixes). Prefer Vercel/Netlify for this project.

---

## Local production-like check

```bash
npm run build
./scripts/start-e2e-servers.sh   # :3000 dashboard + :3002 analytics with CORS
# optional:
npm run mf:demo && npm run host:start   # host on :3001
```

---

## Checklist before production

- [ ] `build/remoteEntry.js` present (dashboard)
- [ ] Analytics `dist/remoteEntry.js` reachable and CORS-enabled
- [ ] Dashboard env points at analytics (explicit URL or `/remote` routing)
- [ ] schema-ui `/assets/*` chunks deploy with its `remoteEntry.js`
- [ ] PWA Workbox still lists remotes as `NetworkOnly` after config changes
- [ ] Smoke: open Analytics + Forms windows; open host → `desktopUI/App` if you ship the host
