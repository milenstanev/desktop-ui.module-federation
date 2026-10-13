# Iframe SDK protocol

Version **1**. Channel **`desktop-ui`**. JSON only.

## Handshake query on the iframe URL

The host appends:

| Param               | Meaning                                    |
| ------------------- | ------------------------------------------ |
| `desktopWindowId`   | Desktop window `id` (not the feature type) |
| `desktopHostOrigin` | `window.location.origin` of desktop-ui     |

Example:

```
https://jspm-app.vercel.app/?desktopWindowId=w1&desktopHostOrigin=https://desktop-ui-mf.vercel.app
```

## Envelope

```ts
{
  v: 1,
  channel: 'desktop-ui',
  id: 'unique-message-id',
  windowId: 'w1',
  type: 'event' | 'request' | 'response',
  name: string,
  payload?: unknown
}
```

The host ignores messages that fail origin, version, channel, or `windowId`.

## Guest → host (Angular / iframe)

Built-in names (optional extras are allowed; they still become `desktop-ui:iframe`):

| `name`             | `payload`                              | Host action                                              |
| ------------------ | -------------------------------------- | -------------------------------------------------------- |
| `ready`            | none                                   | Reply `theme`                                            |
| `ping`             | none                                   | Reply `pong`                                             |
| `close`            | none                                   | `removeWindow(windowId)`                                 |
| `setTitle`         | `{ title: string }`                    | Update iframe `title`                                    |
| `userUpdated`      | `{ entity, record }` with `record._id` | Overlay + remount Forms + `dashboardSync` to all iframes |
| _any other string_ | JSON-serializable                      | CustomEvent on host `window`                             |

## Host → guest

| `name`          | `payload`                                    |
| --------------- | -------------------------------------------- |
| `theme`         | `{ theme: 'light' \| 'dark' \| 'gradient' }` |
| `focus`         | none                                         |
| `pong`          | none                                         |
| `dashboardSync` | `{ entity, record }`                         |

Posted to `iframe.contentWindow` with target origin = iframe origin.

## Host CustomEvent

Name: `desktop-ui:iframe`  
`event.detail` is the parsed envelope.

```js
window.addEventListener('desktop-ui:iframe', (event) => {
  console.log(event.detail.name, event.detail.payload);
});
```
