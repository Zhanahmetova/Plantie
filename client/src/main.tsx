import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA and push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        console.log('PWA: Service Worker registered successfully');
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Add debugging for PWA installation
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: beforeinstallprompt event fired');
  console.log('PWA: Installation prompt is available');
});

// Check if app is already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA: App is running in standalone mode (already installed)');
} else {
  console.log('PWA: App is running in browser mode (not installed)');
}

// Check PWA criteria
console.log('PWA Debug Info:');
console.log('- Service Worker supported:', 'serviceWorker' in navigator);
console.log('- HTTPS:', window.location.protocol === 'https:');
console.log('- Manifest linked:', !!document.querySelector('link[rel="manifest"]'));
console.log('- Current URL:', window.location.href);

createRoot(document.getElementById("root")!).render(<App />);
