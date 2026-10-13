---
name: desktop-ui-schema-as-design
description: >-
  Schema-as-design: project records from schema-ui JSON, Angular JSPM user
  form, iframe userUpdated, overlay, and dashboard sync. Use when changing
  forms, /api/users, schema-ui overlay, or JSPM default home.
---

# Schema as Design

The remote schema is the design system for entities. Objects are **generated from it**, not declared beside it.

Canonical helpers: `src/app-shell/schema/materializeRecord.ts`, overlay `src/app-shell/schemaUiFetch.ts`, guest sync `src/app-shell/iframeBridge/syncDashboardFromGuest.ts`.

## Contract

| Piece | URL / name |
| --- | --- |
| Collection | `https://schema-ui-mf-remote.vercel.app/api/users` |
| Schema | `https://schema-ui-mf-remote.vercel.app/api/users/schema` |
| Not an entity | `/api/user` (404 `Unknown entity`) |
| Guest event | `userUpdated` `{ entity: 'users', record }` |
| Host fan-out | `desktop-ui:dashboard-sync` + iframe `dashboardSync` |
| Overlay | `localStorage desktopUI.schemaUi.overlay` |

## Flow

1. Guest (JSPM home, default hash `#!/home`) fetches schema + collection.
2. `materializeRecordFromSchema` (desktop-ui) or `users-form.lib.js` (`materializeRecord` / `buildFormHtml`) projects the record and Bootstrap 3 markup. Tests live in `users-form.test.js` (red first). Prove it on localhost before any production deploy.
3. Submit: PUT `/api/users/:id`, then `window.desktopUi.emit('userUpdated', { entity, record })`.
4. Host: origin-check, `upsertSchemaUiRecord`, CustomEvent, remount every schema-ui window, `postMessage` `dashboardSync` to all iframes.

## Invariants

- Do not hard-code user fields. Walk schema keys.
- Identity of a record is `_id`. Identity of a window is Desktop `id`.
- Guests never write host Redux. Overlay + events only.
- Rule: `.cursor/rules/schema-as-design.mdc`. Protocol: [docs/IFRAME_SDK.md](../../../docs/IFRAME_SDK.md).
