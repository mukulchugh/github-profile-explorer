/**
 * Common types for React Query hooks
 */

/**
 * Base options interface for all GitHub data fetching hooks
 */
export interface BaseQueryOptions {
  /**
   * Whether the query is enabled
   */
  enabled?: boolean;
}

/**
 * Base options interface for pagination-based queries
 */
export interface PaginatedQueryOptions extends BaseQueryOptions {
  /**
   * Number of items per page
   */
  perPage?: number;
}

/**
 * Base options interface for user-specific queries
 */
export interface UserQueryOptions extends BaseQueryOptions {
  /**
   * GitHub username to query data for
   */
  username: string;
}

/**
 * Common interface for loading and error states in query results
 */
export interface QueryResultBase {
  /**
   * Whether the data is currently loading
   */
  isLoading: boolean;

  /**
   * Error message if any error occurred
   */
  error: string | null;
}

/**
 * Common interface for paginated query results
 */
export interface PaginatedQueryResult extends QueryResultBase {
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Function to load more items
   */
  loadMore: () => void;

  /**
   * Whether more data is currently being loaded
   */
  isLoadingMore: boolean;
}
