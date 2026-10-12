# Progressive Web App (PWA) Guide

## Overview

This application is configured as a Progressive Web App with offline capabilities, caching strategies, and installability.

## Features

### Service Worker

The service worker provides:
- **Offline functionality**: The app works without an internet connection
- **Cache-first strategy**: Fast loading times with cached assets
- **Background sync**: Updates happen seamlessly in the background
- **Install prompts**: Users can install the app on their devices

### Caching Strategies

1. **App Shell**: Navigation requests are served from cache with fallback to network
2. **Static Resources**: CSS and JavaScript files use stale-while-revalidate
3. **Images**: Cached with a cache-first strategy (max 60 images, 30-day expiration)

## Configuration

### Environment Variables

PWA features are configurable via environment variables:

**`.env.development`** (Development mode - PWA disabled by default)
```env
REACT_APP_ENABLE_PWA=false
REACT_APP_ENABLE_VITALS_LOGGING=true
```

**`.env.production`** (Production mode - PWA enabled by default)
```env
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_VITALS_LOGGING=false
```

### Service Worker Registration

The service worker is conditionally registered in `src/index.tsx`:

```typescript
const enablePWA = process.env.REACT_APP_ENABLE_PWA === 'true' || 
                  process.env.NODE_ENV === 'production';

if (enablePWA) {
  serviceWorkerRegistration.register({
    onSuccess: () => console.log('✅ Service worker registered successfully'),
    onUpdate: (registration) => {
      // Handle updates
    },
  });
} else {
  serviceWorkerRegistration.unregister();
}
```

### Manifest

The PWA manifest is located at `public/manifest.json` and defines:
- App name and description
- Icons for different sizes
- Display mode (standalone)
- Theme colors
- Start URL

## Development

### PWA is Disabled by Default in Development

The service worker is automatically disabled in development mode to:
- ✅ Avoid caching issues during development
- ✅ Faster hot module replacement
- ✅ Easier debugging without cache interference

### Enabling PWA in Development

If you need to test PWA features during development:

**Option 1: Environment Variable**
```bash
REACT_APP_ENABLE_PWA=true npm start
```

**Option 2: Update `.env.development`**
```env
REACT_APP_ENABLE_PWA=true
```

### Testing Service Worker Locally

1. Build the production version:
   ```bash
   npm run build
   ```

2. Serve the build:
   ```bash
   npx serve -s build
   ```

3. Open in browser and check Application tab in DevTools

### Disabling PWA in Production

To disable PWA in production, set in `.env.production`:

```env
REACT_APP_ENABLE_PWA=false
```

## Production

### Build for Production

```bash
npm run build
```

The service worker will be automatically generated and injected during the build process.

### Deployment Checklist

- [ ] Ensure HTTPS is enabled (required for service workers)
- [ ] Verify manifest.json is accessible
- [ ] Test offline functionality
- [ ] Check install prompt appears on mobile
- [ ] Verify cache strategies work as expected

## Updating the App

When you deploy a new version:

1. The service worker detects the update
2. New assets are downloaded in the background
3. Users see a notification to refresh (if configured)
4. The app updates on next page load

## Browser Support

Service workers are supported in:
- Chrome/Edge 40+
- Firefox 44+
- Safari 11.1+
- Opera 27+

## Troubleshooting

### Service Worker Not Registering

1. Check if running on HTTPS (or localhost)
2. Verify `service-worker.js` is in the build output
3. Check browser console for errors

### Cache Not Updating

1. Unregister the service worker in DevTools
2. Clear cache and hard reload
3. Re-register the service worker

### Offline Mode Not Working

1. Check Network tab in DevTools (set to Offline)
2. Verify cache strategies in `src/service-worker.js`
3. Check if resources are being cached

## Learn More

- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
