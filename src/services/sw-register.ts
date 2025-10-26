/**
 * Service Worker Registration
 *
 * Registers the service worker for offline support and PWA functionality.
 */

/**
 * Register service worker if supported
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Skip if service workers not supported
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[SW] New service worker available, will update on next page load');

          // Optionally, you could prompt user to reload:
          // if (confirm('New version available! Reload to update?')) {
          //   newWorker.postMessage({ type: 'SKIP_WAITING' });
          //   window.location.reload();
          // }
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[SW] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker (for cleanup/testing)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const unregistered = await registration.unregister();
      console.log('[SW] Service worker unregistered:', unregistered);
      return unregistered;
    }
    return false;
  } catch (error) {
    console.error('[SW] Failed to unregister service worker:', error);
    return false;
  }
}
