const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'analytics',
      filename: 'remoteEntry.js',
      exposes: {
        './Feature': './src/Feature',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '18.3.1',
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '18.3.1',
          strictVersion: false,
        },
        'react/jsx-runtime': {
          singleton: true,
          requiredVersion: '18.3.1',
          strictVersion: false,
        },
        'react-redux': { singleton: true, requiredVersion: '9.1.2', strictVersion: false },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '2.2.6', strictVersion: false },
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    allowedHosts: 'all',
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
