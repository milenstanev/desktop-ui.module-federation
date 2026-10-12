# Deployment

Free deployment options for the desktop-ui starter.

## Vercel (recommended)

1. Push your repo to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New** → **Project** and import your repo.
4. Vercel auto-detects Create React App. Click **Deploy**.
5. Your app will be live at `https://your-project.vercel.app`.

**Project configuration** (`vercel.json`):
- `installCommand: "npm install --legacy-peer-deps"` – used if you have peer dependency conflicts.
- `ignoreCommand` – **exit 0 skips the build**. This project skips non-`master` branches (`exit 0`) and builds `master` (`exit 1`).

**Deploy on merge to master:**
- With the repo connected, Vercel deploys **automatically** on every push to the production branch.
- Set **Production Branch** to `master` (or `main`) in Project Settings → Git.
- Merges to master trigger a production deploy. PRs get preview URLs.

**CLI alternative:**
```bash
npx vercel
```

---

## Netlify

1. Push your repo to GitHub.
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
3. Click **Add new site** → **Import an existing project** → choose GitHub and your repo.
4. Build command: `npm run build`  
   Publish directory: `build`
5. Click **Deploy site**.

**Deploy on merge to master:**
- Netlify deploys **automatically** on every push when the repo is connected.
- Set **Production branch** to `master` (or `main`) in Site settings → Build & deploy → Continuous deployment.
- Merges to master trigger a production deploy. PRs get Deploy Previews.

**CLI alternative:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```
(First run: `netlify init` to link the project.)

---

## GitHub Pages

1. Add to `package.json`: `"homepage": "https://yourusername.github.io/desktop-ui"`
2. Install: `npm install --save-dev gh-pages`
3. Add to `package.json` scripts: `"deploy": "gh-pages -d build"`
4. Run: `npm run build && npm run deploy`
5. In GitHub repo: **Settings** → **Pages** → Source: **gh-pages** branch

---

All options provide free HTTPS and custom domain support.
