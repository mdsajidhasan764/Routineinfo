import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// Safely register PWA Service Worker without blocking initial render
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      try {
        registerSW({ immediate: true });
      } catch (e) {
        console.warn('SW registration skipped:', e);
      }
    })
    .catch((err) => {
      console.warn('PWA module load skipped:', err);
    });
}
