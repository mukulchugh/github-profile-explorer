/**
 * Query caching and refetching constants
 */

// Short-term cache for data that changes frequently
export const CACHE_TIME_SHORT = 1000 * 60 * 5; // 5 minutes

// Medium-term cache for data that changes occasionally
export const CACHE_TIME_MEDIUM = 1000 * 60 * 15; // 15 minutes

// Long-term cache for data that changes rarely
export const CACHE_TIME_LONG = 1000 * 60 * 30; // 30 minutes

// Default stale time for most data
export const DEFAULT_STALE_TIME = CACHE_TIME_SHORT;

// Default garbage collection time - how long to keep unused data in cache
export const DEFAULT_GC_TIME = CACHE_TIME_MEDIUM;

// Default number of retry attempts for failed queries
export const DEFAULT_RETRY_COUNT = 1;
