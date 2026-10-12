const path = require('path');
const webpack = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const packageJson = require('./package.json');

module.exports = function override(config, env) {
  // Module Federation remotes need runtime asset resolution so chunks load from
  // the remote origin even when consumed by a different host domain.
  config.output = {
    ...config.output,
    publicPath: 'auto',
  };

  // Add alias for absolute imports
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, 'src'),
    },
  };

  // Module Federation: host (consumes remotes) + remote (exposes modules)
  config.plugins.push(
    new webpack.container.ModuleFederationPlugin({
      name: 'desktopUI',
      filename: 'remoteEntry.js',
      remotes: {},
      exposes: {
        './App': './src/app/App',
        './Counter': './src/features/Counter/Counter',
        './Notes': './src/features/Notes/Notes',
        './Desktop': './src/features/Desktop/Desktop',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-dom'],
          strictVersion: false,
        },
        'react/jsx-runtime': {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
          strictVersion: false,
        },
        'react-redux': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-redux'],
          strictVersion: false,
        },
        '@reduxjs/toolkit': {
          singleton: true,
          requiredVersion: packageJson.dependencies['@reduxjs/toolkit'],
          strictVersion: false,
        },
      },
    })
  );

  // Add Workbox service worker plugin for production
  if (env === 'production') {
    config.plugins.push(
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /\/remoteEntry\.js$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/schema-ui-mf-remote\.vercel\.app\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
      })
    );
  }

  // Add bundle analyzer if ANALYZE env variable is set
  if (process.env.ANALYZE === 'true') {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: true,
      })
    );
  }

  return config;
};
