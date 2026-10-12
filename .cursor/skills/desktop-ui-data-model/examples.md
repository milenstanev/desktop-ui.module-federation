# Dashboard JSON and share URL examples

## Two Analytics + two Forms (array form)

Layouts are generated. Forms use the taller preferred height.

```json
[
  {
    "id": "analytics-1",
    "name": "Analytics",
    "remoteFeatureName": "analytics",
    "lazyLoadReducerName": "analytics"
  },
  {
    "id": "analytics-2",
    "name": "Analytics",
    "remoteFeatureName": "analytics",
    "lazyLoadReducerName": "analytics"
  },
  {
    "id": "forms-1",
    "name": "Forms",
    "remoteFeatureName": "schemaUi",
    "preferredSize": { "h": 8 }
  },
  {
    "id": "forms-2",
    "name": "Forms",
    "remoteFeatureName": "schemaUi",
    "preferredSize": { "h": 8 }
  }
]
```

Share:

`https://desktop-ui-mf.vercel.app/?desktopConfig=` + `encodeURIComponent(JSON.stringify(array))`

## Single Timer (object form)

```json
{
  "windows": [
    {
      "id": "timer-1",
      "name": "Timer",
      "lazyLoadComponent": "Timer"
    }
  ]
}
```

## Built-in mosaic

Use `getBuiltInDesktopSnapshot()` / configurator **Use built-in dashboard**. Do not hand-copy `INITIAL_STATE_CONFIG` into skills or PRs unless changing defaults in `config.ts`.
