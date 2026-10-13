# Iframe SDK

Iframe apps (AngularJS JSPM, Vue, anything else) cannot share React, Redux, or
DOM with desktop-ui. The only browser channel that works cross-origin is
**`window` + `postMessage`**.

Guests call a small facade on **their** `window`:

```js
window.desktopUi.emit('formSubmitted', { id: 12 });
window.desktopUi.close();
```

That sends JSON to `window.parent`. The host listens on **its** `window`
`message` event, checks origin, then re-dispatches a CustomEvent
`desktop-ui:iframe` so other React code can subscribe without talking to the
iframe.

```
AngularJS iframe                         desktop-ui host
----------------                         ---------------
window.desktopUi.emit(name, payload)
        │
        └── parent.postMessage(envelope, hostOrigin)
                                              │
                                   window.addEventListener('message')
                                              │
                                   origin + windowId checks
                                              │
                         window.dispatchEvent('desktop-ui:iframe')
                         built-ins: ready → theme, ping → pong, close → removeWindow
                         userUpdated → overlay + dashboardSync (all Forms + iframes)
```

Do **not** assign objects onto `window.parent` or `iframe.contentWindow` and
expect the other side to read them. Different origins cannot share JS objects.

## Files

| File                                                                                   | Role                                    |
| -------------------------------------------------------------------------------------- | --------------------------------------- |
| [IFRAME_SDK_PROTOCOL.md](./IFRAME_SDK_PROTOCOL.md)                                     | Envelope, query params, built-in events |
| [IFRAME_SDK_GUEST.md](./IFRAME_SDK_GUEST.md)                                           | AngularJS / vanilla `window.desktopUi`  |
| `src/app-shell/iframeBridge/`                                                          | Host parse + hook + guest helper        |
| [decisions/0004-iframe-postmessage-sdk.md](./decisions/0004-iframe-postmessage-sdk.md) | Why postMessage                         |

## Host usage

`JspmApp` already wires the hook. Any other iframe feature:

1. Set iframe `src` with `buildIframeGuestUrl(base, windowId, window.location.origin)`.
2. Call `useIframeGuestEvents({ windowId, iframeSrc, iframeRef, theme, onClose })`.
3. Optionally listen on `window` for `desktop-ui:iframe`.

## Security

- Allow only the iframe URL origin (not `*`).
- Require `windowId` to match the Desktop window that owns the iframe.
- JSON envelopes only. No `eval`, `Function()`, or string scripts from the guest.

## Schema as design (JSPM default home)

The JSPM window’s default view (`#!/home`) is not a hand-built user form. It
**projects** a record from `https://schema-ui-mf-remote.vercel.app/api/users/schema`
and hydrates it from `/api/users` (plural; `/api/user` is not an entity).

On submit the guest PUTs the record, then:

```js
window.desktopUi.emit('userUpdated', { entity: 'users', record: projected });
```

The host writes `desktopUI.schemaUi.overlay`, remounts every Forms (schema-ui)
window, and posts `dashboardSync` to every iframe so the dashboard is one
projection, many surfaces. See `.cursor/rules/schema-as-design.mdc` and
skill `desktop-ui-schema-as-design`.
