// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || '/api',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws',
  CACHE_DURATION: parseInt(process.env.REACT_APP_CACHE_DURATION || '300000'), // 5 minutes
  AUTO_REFRESH_INTERVAL: parseInt(process.env.REACT_APP_AUTO_REFRESH_INTERVAL || '30000'), // 30 seconds
  ENABLE_WEBSOCKET: process.env.REACT_APP_ENABLE_WEBSOCKET === 'true',
  ENABLE_PERFORMANCE_MONITORING: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
  ENABLE_ERROR_TRACKING: process.env.REACT_APP_ENABLE_ERROR_TRACKING === 'true',
};

// API Endpoints
export const API_ENDPOINTS = {
  UAR_PROGRESS: '/uar-progress',
  UAR_PROGRESS_WS: '/uar-progress/ws',
  HEALTH_CHECK: '/health',
};

// Request timeout configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Cache configuration
export const CACHE_CONFIG = {
  MAX_SIZE: 100,
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
};
