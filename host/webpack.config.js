const path = require('path');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = (_env, argv = {}) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });

  const REMOTE_URL = (process.env.REMOTE_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );

  return {
    entry: './src/index.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { presets: ['@babel/preset-react'] },
          },
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'host',
        remotes: {
          desktopUI: `desktopUI@${REMOTE_URL}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom/client': { singleton: true, requiredVersion: '^18.0.0' },
          'react/jsx-runtime': { singleton: true, requiredVersion: '^18.0.0' },
          'react-redux': { singleton: true, requiredVersion: '^9.0.0' },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.0' },
        },
      }),
      new HtmlWebpackPlugin({ template: './src/index.html' }),
    ],
    devServer: {
      port: 3001,
      historyApiFallback: true,
      allowedHosts: 'all',
    },
  };
};
