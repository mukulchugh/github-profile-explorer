import { clearAllStorage, getStorageItem, isStorageAvailable, setStorageItem } from "./storage";

// Define storage migration version
const MIGRATION_VERSION_KEY = "storage-migration-version";
const CURRENT_MIGRATION_VERSION = 1;

// Migration functions for each version
const migrations: Array<() => Promise<boolean>> = [
  // Migration from version 0 to 1
  async () => {
    try {
      // This is the initial migration that converts legacy localStorage format
      // to the new structured format

      // Example: Convert legacy search history
      const legacySearchHistory = localStorage.getItem("github-search-history");
      if (legacySearchHistory) {
        try {
          const parsedHistory = JSON.parse(legacySearchHistory);
          if (Array.isArray(parsedHistory)) {
            setStorageItem("search-history", parsedHistory);
          }
          localStorage.removeItem("github-search-history");
        } catch (error) {
          console.error("Error migrating legacy search history:", error);
        }
      }

      // Example: Convert legacy watchlist
      const legacyWatchlist = localStorage.getItem("github-user-watchlist");
      if (legacyWatchlist) {
        try {
          const parsedWatchlist = JSON.parse(legacyWatchlist);
          if (parsedWatchlist?.users && Array.isArray(parsedWatchlist.users)) {
            setStorageItem("user-watchlist", parsedWatchlist.users);
          }
          localStorage.removeItem("github-user-watchlist");
        } catch (error) {
          console.error("Error migrating legacy watchlist:", error);
        }
      }

      // Add more legacy data migrations here

      return true;
    } catch (error) {
      console.error("Error in migration to version 1:", error);
      return false;
    }
  },

  // Add more migrations here for future versions
  // Example:
  // async () => {
  //   // Migration from version 1 to 2
  //   ...
  //   return true;
  // }
];

/**
 * Run storage migrations if needed
 * @returns Promise that resolves to true if migrations were successful or not needed
 */
export const runStorageMigrations = async (): Promise<boolean> => {
  // Skip if localStorage is not available
  if (!isStorageAvailable()) {
    console.warn("localStorage is not available, skipping migrations");
    return false;
  }

  try {
    // Get current migration version
    const currentVersion = getStorageItem<number>(MIGRATION_VERSION_KEY, 0);

    // If already at the latest version, no need to migrate
    if (currentVersion === CURRENT_MIGRATION_VERSION) {
      return true;
    }

    console.log(
      `Running storage migrations from version ${currentVersion} to ${CURRENT_MIGRATION_VERSION}`
    );

    // Run migrations sequentially
    for (let version = currentVersion || 0; version < CURRENT_MIGRATION_VERSION; version++) {
      const migrationFn = migrations[version];
      if (!migrationFn) {
        console.error(`Missing migration function for version ${version + 1}`);
        return false;
      }

      const success = await migrationFn();
      if (!success) {
        console.error(`Migration to version ${version + 1} failed`);
        return false;
      }

      // Update the migration version after each successful migration
      setStorageItem(MIGRATION_VERSION_KEY, version + 1);
    }

    console.log(
      `Storage migrations completed successfully to version ${CURRENT_MIGRATION_VERSION}`
    );
    return true;
  } catch (error) {
    console.error("Error in storage migrations:", error);
    return false;
  }
};

/**
 * Clear all app storage (for troubleshooting)
 */
export const resetAllStorage = (): boolean => {
  try {
    clearAllStorage();
    console.log("All storage has been cleared");
    return true;
  } catch (error) {
    console.error("Error clearing storage:", error);
    return false;
  }
};
