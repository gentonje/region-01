
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Add meta tag for mobile fullscreen experience
if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
  const metaAppleCapable = document.createElement('meta');
  metaAppleCapable.setAttribute('name', 'apple-mobile-web-app-capable');
  metaAppleCapable.setAttribute('content', 'yes');
  document.head.appendChild(metaAppleCapable);
}

if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
  const metaWebCapable = document.createElement('meta');
  metaWebCapable.setAttribute('name', 'mobile-web-app-capable');
  metaWebCapable.setAttribute('content', 'yes');
  document.head.appendChild(metaWebCapable);
}

const root = createRoot(rootElement);

root.render(
  <App />
);

// Force service worker update when app loads
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then(registration => {
      // Check for updates on each page load
      registration.update();
      
      // If there's a new service worker waiting, activate it immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    
    // When a new service worker takes over, reload the page to ensure latest content
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
