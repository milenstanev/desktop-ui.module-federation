---
name: desktop-ui-code-review
description: >-
  Review desktop-ui diffs against project standards and Module Federation
  pitfalls. Use when the user asks for a code review, PR review, or
  pre-merge checklist.
---

# desktop-ui code review

Read `desktop-ui-best-practices` checklists plus this MF-specific bar.

## Severity

- **Blocker**: wrong remote container, dead persisted windows, inverted Vercel skip, data loss (unregistered Desktop persist)
- **High**: unused injected reducer, uncached concurrent `loadRemoteFeature`, SW caching `remoteEntry.js`, duplicate React (`jsx-runtime` not shared)
- **Medium**: contract drift, missing tests/docs, noisy commits
- **Low**: unused props, naming

## Always check

1. Desktop persist: new window/layout actions registered in middleware + tests.
2. `lazyLoadComponent` key === `componentLoader` key.
3. Strings/test ids from constants / `TEST_SELECTORS`.
4. No `any`, no inline JSX handlers for dispatch, no secrets in git.
5. Tests added at the right layer (Jest vs Playwright).
6. Lint/tsc/unit mentioned or run.

## Module Federation diffs

- Candidate URLs validated by **container global**, not script onload.
- Production default is `{origin}/remote` when env unset.
- `RemoteFeatureLoader` loads on mount (refresh).
- Promise cache; failed scripts removable.
- Shared `react/jsx-runtime`; `publicPath: 'auto'`.
- Analytics CORS; e2e uses built remote dist in CI.

## Output format

Lead with merge bar (ship / fix first). Then findings as:

- **Blocker** — `file:line` — what breaks, how to fix
- **High** / **Medium** / **Low** — same shape

End with what already matches project practice. Do not nitpick formatting Prettier will fix.
