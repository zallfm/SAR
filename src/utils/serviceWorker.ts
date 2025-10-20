/**
 * Service Worker Registration and Management
 * 
 * @description Utilities for registering and managing service worker
 * @version 1.0.0
 * @author SAR Development Team
 */

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker
 * 
 * @param config - Configuration options
 * @returns Promise<ServiceWorkerRegistration | null>
 */
export const registerServiceWorker = async (config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported in this browser');
    return null;
  }

  try {
    console.log('🔧 Registering Service Worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('🔄 New Service Worker available');
          config.onUpdate?.(registration);
        }
      });
    });

    // Handle successful registration
    config.onSuccess?.(registration);

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    config.onError?.(error as Error);
    return null;
  }
};

/**
 * Unregister service worker
 * 
 * @returns Promise<boolean>
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    await Promise.all(
      registrations.map(registration => registration.unregister())
    );

    console.log('🗑️ Service Worker unregistered successfully');
    return true;
  } catch (error) {
    console.error('❌ Service Worker unregistration failed:', error);
    return false;
  }
};

/**
 * Check if service worker is supported
 * 
 * @returns boolean
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Get service worker registration
 * 
 * @returns Promise<ServiceWorkerRegistration | null>
 */
export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('❌ Failed to get Service Worker registration:', error);
    return null;
  }
};

/**
 * Send message to service worker
 * 
 * @param message - Message to send
 * @returns Promise<any>
 */
export const sendMessageToServiceWorker = async (message: any): Promise<any> => {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    throw new Error('Service Worker not available');
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
};

/**
 * Clear all caches
 * 
 * @returns Promise<boolean>
 */
export const clearAllCaches = async (): Promise<boolean> => {
  try {
    await sendMessageToServiceWorker({ action: 'clearAllCaches' });
    console.log('🗑️ All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
    return false;
  }
};

/**
 * Get cache statistics
 * 
 * @returns Promise<any>
 */
export const getCacheStats = async (): Promise<any> => {
  try {
    const stats = await sendMessageToServiceWorker({ action: 'getCacheStats' });
    console.log('📊 Cache statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Failed to get cache statistics:', error);
    return null;
  }
};

/**
 * Preload critical resources
 * 
 * @returns Promise<boolean>
 */
export const preloadCriticalResources = async (): Promise<boolean> => {
  try {
    await sendMessageToServiceWorker({ action: 'preloadCriticalResources' });
    console.log('⚡ Critical resources preloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to preload critical resources:', error);
    return false;
  }
};

/**
 * Check if app is online
 * 
 * @returns boolean
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listen for online/offline events
 * 
 * @param onOnline - Callback for online event
 * @param onOffline - Callback for offline event
 * @returns Function to remove listeners
 */
export const listenToConnectionStatus = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log('🌐 App is online');
    onOnline();
  };

  const handleOffline = () => {
    console.log('📴 App is offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Service Worker Manager Class
 */
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  /**
   * Initialize service worker
   */
  async initialize(): Promise<boolean> {
    try {
      this.registration = await registerServiceWorker({
        onUpdate: (registration) => {
          this.updateAvailable = true;
          this.showUpdateNotification();
        },
        onSuccess: (registration) => {
          console.log('✅ Service Worker initialized successfully');
        },
        onError: (error) => {
          console.error('❌ Service Worker initialization failed:', error);
        }
      });

      return this.registration !== null;
    } catch (error) {
      console.error('❌ Service Worker Manager initialization failed:', error);
      return false;
    }
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(): void {
    if (confirm('A new version of the app is available. Would you like to update?')) {
      this.updateServiceWorker();
    }
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    try {
      this.registration.waiting.postMessage({ action: 'skipWaiting' });
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to update service worker:', error);
    }
  }

  /**
   * Get registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<boolean> {
    return await clearAllCaches();
  }

  /**
   * Get cache statistics
   */
  async getCacheStatistics(): Promise<any> {
    return await getCacheStats();
  }

  /**
   * Preload critical resources
   */
  async preloadResources(): Promise<boolean> {
    return await preloadCriticalResources();
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerSupported,
  getServiceWorkerRegistration,
  sendMessageToServiceWorker,
  clearAllCaches,
  getCacheStats,
  preloadCriticalResources,
  isOnline,
  listenToConnectionStatus,
  ServiceWorkerManager,
  serviceWorkerManager
};
