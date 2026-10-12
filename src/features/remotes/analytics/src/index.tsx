/**
 * Standalone entry for development.
 * When consumed by host, only Feature.ts is loaded via remoteEntry.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import AnalyticsFeature from './Feature';

const analyticsReducer = AnalyticsFeature.reducer;
const store = configureStore({
  reducer: analyticsReducer
    ? { [analyticsReducer.name]: analyticsReducer.reducer }
    : {},
});

const root = document.getElementById('root');
if (root) {
  const App = AnalyticsFeature.component;
  createRoot(root).render(
    <React.StrictMode>
      <Provider store={store}>
        <App windowId="dev" windowName="Analytics (standalone)" />
      </Provider>
    </React.StrictMode>
  );
}
