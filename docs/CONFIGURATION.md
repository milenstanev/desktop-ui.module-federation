# Configuration Guide

## Environment Variables

This project uses environment variables to configure features for different environments.

## Available Configuration Files

### `.env.example`
Template file with all available configuration options. Copy this to `.env` to customize:

```bash
cp .env.example .env
```

### `.env.development`
Default configuration for development mode (`npm start`):
- PWA disabled for faster development
- Web Vitals logging enabled

### `.env.production`
Default configuration for production builds (`npm run build`):
- PWA enabled for offline support
- Web Vitals logging disabled (send to analytics instead)

### `.env` (optional)
Local overrides (gitignored). Create this file to customize settings without modifying tracked files.

## Configuration Options

### PWA Configuration

**`REACT_APP_ENABLE_PWA`**
- **Type**: boolean (`true` | `false`)
- **Default**: `false` in development, `true` in production
- **Description**: Enable/disable Progressive Web App features including service worker and offline support

**When to enable in development:**
- Testing offline functionality
- Debugging service worker behavior
- Testing PWA installation flow

**When to disable in production:**
- You don't need offline support
- You want to avoid caching complexity
- Your app requires always-fresh data

### Performance Monitoring

**`REACT_APP_ENABLE_VITALS_LOGGING`**
- **Type**: boolean (`true` | `false`)
- **Default**: `true` in development, `false` in production
- **Description**: Enable/disable Web Vitals console logging

**In development:**
- Logs performance metrics to console
- Helps identify performance issues early

**In production:**
- Metrics still collected but not logged
- Should be sent to analytics service instead

### Bundle Analysis

**`ANALYZE`**
- **Type**: boolean (`true` | `false`)
- **Default**: `false`
- **Description**: Generate bundle size analysis report
- **Usage**: `ANALYZE=true npm run build`

## Usage Examples

### Development with PWA Enabled

```bash
# Temporary (one-time)
REACT_APP_ENABLE_PWA=true npm start

# Permanent (update .env.development)
echo "REACT_APP_ENABLE_PWA=true" >> .env.development
npm start
```

### Production without PWA

```bash
# Update .env.production
REACT_APP_ENABLE_PWA=false npm run build
```

### Disable Web Vitals Logging in Development

```bash
# Create .env file
echo "REACT_APP_ENABLE_VITALS_LOGGING=false" > .env
npm start
```

### Build with Bundle Analysis

```bash
ANALYZE=true npm run build
```

## Environment Variable Priority

Environment variables are loaded in this order (later overrides earlier):

1. `.env` - Default values
2. `.env.development` or `.env.production` - Environment-specific
3. `.env.local` - Local overrides (gitignored)
4. `.env.development.local` or `.env.production.local` - Environment-specific local overrides
5. Shell environment variables - Highest priority

## Best Practices

### 1. Never Commit Secrets
- Use `.env.local` for sensitive data
- Never commit API keys or secrets
- Use environment-specific files for configuration only

### 2. Document All Variables
- Add new variables to `.env.example`
- Document purpose and valid values
- Provide sensible defaults

### 3. Use Descriptive Names
- Prefix with `REACT_APP_` for Create React App
- Use SCREAMING_SNAKE_CASE
- Be specific: `REACT_APP_ENABLE_PWA` not `REACT_APP_PWA`

### 4. Validate Values
- Check for required variables at startup
- Provide helpful error messages
- Use TypeScript for type safety

## Troubleshooting

### Environment Variables Not Working

**Problem**: Changes to `.env` files not reflected in app

**Solutions:**
1. Restart development server (`npm start`)
2. Clear build cache: `rm -rf node_modules/.cache`
3. Verify variable name starts with `REACT_APP_`
4. Check for typos in variable names

### PWA Not Disabling in Development

**Problem**: Service worker still active after disabling

**Solutions:**
1. Unregister service worker manually:
   - Open DevTools > Application > Service Workers
   - Click "Unregister"
2. Clear site data:
   - Application > Storage > Clear site data
3. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

### Web Vitals Not Logging

**Problem**: No performance metrics in console

**Solutions:**
1. Check `REACT_APP_ENABLE_VITALS_LOGGING=true` in `.env.development`
2. Open browser console (F12)
3. Refresh page to trigger metrics collection
4. Some metrics only appear after user interaction

## Advanced Configuration

### Custom Environment Variables

To add new configuration options:

1. **Add to `.env.example`**:
   ```env
   # Feature Flags
   REACT_APP_ENABLE_FEATURE_X=false
   ```

2. **Use in code**:
   ```typescript
   const enableFeatureX = process.env.REACT_APP_ENABLE_FEATURE_X === 'true';
   
   if (enableFeatureX) {
     // Feature X code
   }
   ```

3. **Document in this file**

### Multiple Environments

For additional environments (staging, QA, etc.):

1. Create environment-specific file:
   ```bash
   touch .env.staging
   ```

2. Add configuration:
   ```env
   REACT_APP_ENABLE_PWA=true
   REACT_APP_API_URL=https://staging-api.example.com
   ```

3. Use with env-cmd or similar tool:
   ```bash
   npm install --save-dev env-cmd
   ```

4. Add script to `package.json`:
   ```json
   {
     "scripts": {
       "build:staging": "env-cmd -f .env.staging npm run build"
     }
   }
   ```

## Related Documentation

- [PWA Guide](./PWA_GUIDE.md) - PWA configuration and usage
- [Performance Guide](./PERFORMANCE.md) - Web Vitals and optimization
- [Create React App Docs](https://create-react-app.dev/docs/adding-custom-environment-variables/) - Environment variables reference

## Summary

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `REACT_APP_ENABLE_PWA` | `false` | `true` | Enable PWA features |
| `REACT_APP_ENABLE_VITALS_LOGGING` | `true` | `false` | Log Web Vitals to console |
| `ANALYZE` | `false` | `false` | Generate bundle analysis |

All configuration is optional with sensible defaults for each environment.
