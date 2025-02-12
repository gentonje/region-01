
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// Only use StrictMode at the root level
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
