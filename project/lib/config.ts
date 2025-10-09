/**
 * Configuration constants for the application
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// App Configuration
export const APP_NAME = 'SafarSaga';
export const APP_VERSION = '1.0.0';

// Authentication
export const JWT_TOKEN_KEY = 'admin_token';
export const USER_TOKEN_KEY = 'user_token';

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// UI Constants
export const TOAST_DURATION = 5000;
export const DEBOUNCE_DELAY = 300;

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  JWT_TOKEN_KEY,
  USER_TOKEN_KEY,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TOAST_DURATION,
  DEBOUNCE_DELAY,
};
