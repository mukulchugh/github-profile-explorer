/**
 * Query caching and refetching constants
 */

// Cache Time
export const CACHE_TIME_SHORT = 1000 * 60 * 5; // 5 minutes
export const CACHE_TIME_MEDIUM = 1000 * 60 * 15; // 15 minutes
export const CACHE_TIME_LONG = 1000 * 60 * 30; // 30 minutes

// Default Stale Time
export const DEFAULT_STALE_TIME = CACHE_TIME_SHORT;

// Default Garbage Collection Time
export const DEFAULT_GC_TIME = CACHE_TIME_MEDIUM;

// Default Retry Count
export const DEFAULT_RETRY_COUNT = 1;
