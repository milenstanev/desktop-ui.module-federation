# Host App (Module Federation Demo)

Minimal host application that consumes the desktop-ui remote via Webpack Module Federation.

## Usage

1. Start the remote (desktop-ui) on port 3000:
   ```bash
   cd .. && npm run build && npx serve -s build -l 3000
   ```

2. Start the host on port 3001:
   ```bash
   npm run start
   ```

3. Open http://localhost:3001 — the host loads and renders the full desktop-ui App from the remote.

## Environment

- `REMOTE_URL` — override remote entry URL (default: `http://localhost:3000`)
- You can set it in `host/.env`, `host/.env.development`, or `host/.env.production`.

## Vercel Deploy (Host)

From repo root:

```bash
npm run host:deploy:vercel -- --remote-url https://desktop-ui.vercel.app
```

Preview deploy:

```bash
npm run host:deploy:vercel:preview -- --remote-url https://desktop-ui.vercel.app
```
