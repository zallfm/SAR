/**
 * Service Worker for SAR Application
 * 
 * @description Service worker for caching, offline support, and performance optimization
 * @version 1.0.0
 * @author SAR Development Team
 */

const CACHE_NAME = 'sar-app-v1.0.0';
const STATIC_CACHE_NAME = 'sar-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'sar-dynamic-v1.0.0';
const API_CACHE_NAME = 'sar-api-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth/login',
  '/api/uar/progress',
  '/api/applications',
  '/api/logging',
  '/api/schedule'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for API calls
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for dynamic content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network only for critical requests
  NETWORK_ONLY: 'network-only'
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Service Worker: Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache API endpoints with network-first strategy
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('🌐 Service Worker: Preparing API cache...');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('✅ Service Worker: Installation complete');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activation complete');
    })
  );
});

/**
 * Fetch event - handle different caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy based on request type
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isHTMLRequest(request)) {
    event.respondWith(handleHTMLRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

/**
 * Check if request is for API
 */
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('api') ||
         request.headers.get('accept')?.includes('application/json');
}

/**
 * Check if request is for HTML
 */
function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Service Worker: Serving static asset from cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('📦 Service Worker: Cached new static asset:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Error handling static asset:', error);
    return new Response('Static asset not available offline', { status: 503 });
  }
}

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Try network first
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        cache.put(request, networkResponse.clone());
        console.log('🌐 Service Worker: API request successful, cached:', request.url);
        return networkResponse;
      }
    } catch (networkError) {
      console.log('🌐 Service Worker: Network failed, trying cache:', request.url);
    }
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('🌐 Service Worker: Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request is not available offline' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Service Worker: Error handling API request:', error);
    return new Response('API not available offline', { status: 503 });
  }
}

/**
 * Handle HTML requests with stale-while-revalidate strategy
 */
async function handleHTMLRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background
    const networkPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('📄 Service Worker: Updated HTML cache:', request.url);
      }
      return networkResponse;
    }).catch((error) => {
      console.log('📄 Service Worker: Network failed for HTML:', error);
      return null;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
      console.log('📄 Service Worker: Serving HTML from cache:', request.url);
      return cachedResponse;
    }
    
    // Wait for network if no cache
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Return offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SAR - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1>You're Offline</h1>
            <p>This page is not available offline. Please check your internet connection.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
      `,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  } catch (error) {
    console.error('❌ Service Worker: Error handling HTML request:', error);
    return new Response('Page not available offline', { status: 503 });
  }
}

/**
 * Handle dynamic requests with stale-while-revalidate strategy
 */
async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background
    const networkPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('🔄 Service Worker: Updated dynamic cache:', request.url);
      }
      return networkResponse;
    }).catch((error) => {
      console.log('🔄 Service Worker: Network failed for dynamic request:', error);
      return null;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
      console.log('🔄 Service Worker: Serving dynamic content from cache:', request.url);
      return cachedResponse;
    }
    
    // Wait for network if no cache
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    return new Response('Content not available offline', { status: 503 });
  } catch (error) {
    console.error('❌ Service Worker: Error handling dynamic request:', error);
    return new Response('Content not available offline', { status: 503 });
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Perform background sync
 */
async function doBackgroundSync() {
  try {
    console.log('🔄 Service Worker: Performing background sync...');
    
    // Get pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, request.options);
        if (response.ok) {
          await removePendingRequest(request.id);
          console.log('✅ Service Worker: Synced pending request:', request.url);
        }
      } catch (error) {
        console.log('❌ Service Worker: Failed to sync request:', request.url, error);
      }
    }
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed:', error);
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from SAR',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SAR Notification', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Helper functions for IndexedDB operations
 */
async function getPendingRequests() {
  // Implementation would use IndexedDB to get pending requests
  return [];
}

async function removePendingRequest(id) {
  // Implementation would use IndexedDB to remove pending request
  return Promise.resolve();
}

/**
 * Cache management utilities
 */
const CacheManager = {
  /**
   * Clear all caches
   */
  async clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('🗑️ Service Worker: All caches cleared');
  },
  
  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = keys.length;
    }
    
    return stats;
  },
  
  /**
   * Preload critical resources
   */
  async preloadCriticalResources() {
    const criticalResources = [
      '/api/uar/progress',
      '/api/applications'
    ];
    
    const cache = await caches.open(API_CACHE_NAME);
    
    for (const resource of criticalResources) {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response);
          console.log('⚡ Service Worker: Preloaded critical resource:', resource);
        }
      } catch (error) {
        console.log('❌ Service Worker: Failed to preload resource:', resource);
      }
    }
  }
};

// Export for debugging
self.CacheManager = CacheManager;

console.log('🚀 Service Worker: Loaded successfully');
