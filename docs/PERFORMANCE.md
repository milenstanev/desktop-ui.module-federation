# Performance Monitoring Guide

## Web Vitals

This project includes automatic performance monitoring using [Web Vitals](https://web.dev/vitals/).

## Core Web Vitals Metrics

### 1. Largest Contentful Paint (LCP)
**Target: < 2.5 seconds**

Measures loading performance. Marks the point when the largest content element becomes visible.

**Optimization Tips:**
- Optimize images (use WebP, lazy loading)
- Minimize CSS/JS blocking time
- Use CDN for static assets
- Enable compression (gzip/brotli)

### 2. First Input Delay (FID)
**Target: < 100 milliseconds**

Measures interactivity. Time from user interaction to browser response.

**Optimization Tips:**
- Break up long JavaScript tasks
- Use web workers for heavy computations
- Defer non-critical JavaScript
- Minimize main thread work

### 3. Cumulative Layout Shift (CLS)
**Target: < 0.1**

Measures visual stability. Unexpected layout shifts during page load.

**Optimization Tips:**
- Set explicit dimensions for images/videos
- Avoid inserting content above existing content
- Use CSS transforms instead of layout-triggering properties
- Reserve space for dynamic content

### 4. First Contentful Paint (FCP)
**Target: < 1.8 seconds**

Time when first content appears on screen.

### 5. Time to First Byte (TTFB)
**Target: < 600 milliseconds**

Time from navigation start to receiving first byte from server.

## Implementation

### Automatic Reporting

Web Vitals are automatically collected in `src/index.tsx`:

```typescript
reportWebVitals((metric) => {
  // Development: Log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // Production: Send to analytics
  // sendToAnalytics(metric);
});
```

### Metric Object Structure

```typescript
{
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB',
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor',
  delta: number,
  id: string,
  entries: PerformanceEntry[]
}
```

## Bundle Size Analysis

### Running Bundle Analyzer

```bash
npm run build:analyze
```

This will:
1. Build the production bundle
2. Generate a visual report
3. Open the report in your browser

### Analyzing the Report

Look for:
- **Large dependencies**: Consider alternatives or lazy loading
- **Duplicate code**: Check for multiple versions of same package
- **Unused code**: Remove dead code and unused dependencies
- **Large chunks**: Split code into smaller chunks

### Optimization Strategies

1. **Code Splitting**
   ```typescript
   const Component = React.lazy(() => import('./Component'));
   ```

2. **Tree Shaking**
   - Use ES6 imports
   - Import only what you need
   ```typescript
   // Good
   import { specific } from 'library';
   
   // Avoid
   import * as everything from 'library';
   ```

3. **Dynamic Imports**
   ```typescript
   const module = await import('./heavy-module');
   ```

4. **Dependency Optimization**
   - Use lighter alternatives
   - Check bundle size before adding dependencies
   - Use [Bundlephobia](https://bundlephobia.com/)

## Performance Budget

Current bundle sizes (gzipped):

| Asset Type | Current | Budget | Status |
|------------|---------|--------|--------|
| Main JS    | ~85 KB  | 100 KB | ✅ Good |
| CSS        | ~3 KB   | 10 KB  | ✅ Good |
| Total      | ~88 KB  | 150 KB | ✅ Good |

## Monitoring in Production

### Integration with Analytics

To send metrics to your analytics service:

```typescript
function sendToAnalytics(metric: Metric) {
  // Google Analytics 4
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
  });
  
  // Or custom endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

reportWebVitals(sendToAnalytics);
```

### Recommended Services

- **Google Analytics 4**: Built-in Web Vitals support
- **Vercel Analytics**: Automatic Web Vitals tracking
- **Sentry Performance**: Detailed performance monitoring
- **New Relic**: Full-stack performance monitoring

## Performance Testing

### Lighthouse

Run Lighthouse audits:

```bash
# Chrome DevTools > Lighthouse tab
# Or CLI:
npx lighthouse http://localhost:3000 --view
```

### WebPageTest

Test from multiple locations:
- Visit [webpagetest.org](https://www.webpagetest.org/)
- Enter your URL
- Analyze results

### Chrome DevTools

1. **Performance Panel**: Record and analyze runtime performance
2. **Coverage Tab**: Find unused CSS/JS
3. **Network Panel**: Analyze resource loading
4. **Memory Panel**: Check for memory leaks

## Best Practices

### Images
- Use modern formats (WebP, AVIF)
- Implement lazy loading
- Provide responsive images
- Optimize image sizes

### JavaScript
- Minimize bundle size
- Use code splitting
- Defer non-critical scripts
- Remove unused code

### CSS
- Minimize CSS
- Remove unused styles
- Use CSS containment
- Avoid @import

### Fonts
- Use font-display: swap
- Preload critical fonts
- Subset fonts
- Use system fonts when possible

## Continuous Monitoring

Set up automated performance monitoring:

1. **CI/CD Integration**
   - Run Lighthouse in CI
   - Fail builds if budgets exceeded
   - Track metrics over time

2. **Real User Monitoring (RUM)**
   - Collect data from actual users
   - Identify performance issues
   - Track improvements

3. **Synthetic Monitoring**
   - Regular automated tests
   - Consistent baseline
   - Early warning system

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
