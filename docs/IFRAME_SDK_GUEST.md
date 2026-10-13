# Iframe guest (`window.desktopUi`)

Canonical helper: `src/app-shell/iframeBridge/desktopUiGuest.ts`.

Copy it into the AngularJS app (or any iframe) and run `installDesktopUiGuest()`
on bootstrap. It reads `desktopWindowId` / `desktopHostOrigin` from the URL and
attaches:

```js
window.desktopUi.ready();
window.desktopUi.emit('userUpdated', { entity: 'users', record: projected });
window.desktopUi.setTitle('Invoice 12');
window.desktopUi.close();
window.desktopUi.on('theme', function (payload) {
  /* { theme } */
});
```

## AngularJS

```js
angular.module('jspmApp').run([
  '$window',
  '$rootScope',
  function ($window, $rootScope) {
    if (!$window.desktopUi) {
      return;
    }
    $window.desktopUi.ready();
    $rootScope.$on('desktopUi:emit', function (_e, name, payload) {
      $window.desktopUi.emit(name, payload);
    });
  },
]);
```

From a controller:

```js
$rootScope.$emit('desktopUi:emit', 'formSubmitted', { id: form.id });
// or
$window.desktopUi.emit('formSubmitted', { id: form.id });
```

## Without the helper

Same envelope via `parent.postMessage`. Target origin **must** be
`desktopHostOrigin` from the query (never `*`).

```js
var params = new URLSearchParams(window.location.search);
window.parent.postMessage(
  {
    v: 1,
    channel: 'desktop-ui',
    id: String(Date.now()),
    windowId: params.get('desktopWindowId'),
    type: 'event',
    name: 'ready',
  },
  params.get('desktopHostOrigin')
);
```

`window.parent.desktopUi` does **not** exist. The facade lives only inside the
iframe.
