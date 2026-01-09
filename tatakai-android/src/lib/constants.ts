// API Configuration
export const API_BASE_URL = 'https://consumet-api-two-alpha.vercel.app';
export const ANISKIP_API_URL = 'https://api.aniskip.com';
export const JIKAN_API_URL = 'https://api.jikan.moe/v4';

// Supabase Configuration
// In production, these should be set via environment variables or Expo constants
// For development, create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// App Configuration
export const APP_NAME = 'Tatakai';
export const APP_VERSION = '1.0.0';
export const AUTHOR = 'Snozxyx';

// Download Configuration
export const MAX_CONCURRENT_DOWNLOADS = 3;
export const DOWNLOAD_CHUNK_SIZE = 1024 * 1024; // 1MB chunks

// Video Player Configuration
export const DEFAULT_PLAYBACK_SPEED = 1.0;
export const SEEK_INTERVAL = 10; // seconds
export const DOUBLE_TAP_SEEK = 10; // seconds

// Cache Configuration
export const IMAGE_CACHE_SIZE = 100; // Number of images to cache
export const VIDEO_CACHE_SIZE = 5; // Number of video segments to cache

// Pagination
export const ITEMS_PER_PAGE = 20;
