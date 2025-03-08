import {
  getStorageItem,
  isStorageAvailable,
  removeStorageItem,
  setStorageItem,
} from "@/lib/storage";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

/**
 * A hook for using localStorage with React state
 *
 * @param key - The key to store the value under in localStorage
 * @param initialValue - The initial value to use if no value is found in localStorage
 * @returns A tuple of [value, setValue, removeValue, resetValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void, () => void, boolean] {
  // Check if localStorage is available early
  const storageAvailable = isStorageAvailable();

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) {
      return initialValue;
    }

    // Get from localStorage by key
    const item = getStorageItem<T>(key, initialValue);
    return item !== undefined ? item : initialValue;
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Effect to synchronize state with localStorage
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Handler for setting localStorage value
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        // Allow value to be a function like React's setState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (storageAvailable) {
          setStorageItem(key, valueToStore);
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, storageAvailable]
  );

  // Handler for removing the item from localStorage
  const removeValue = useCallback(() => {
    try {
      // Reset state to initial value
      setStoredValue(initialValue);

      // Remove from localStorage
      if (storageAvailable) {
        removeStorageItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, storageAvailable]);

  // Handler for resetting to initial value
  const resetValue = useCallback(() => {
    setStoredValue(initialValue);
    if (storageAvailable) {
      setStorageItem(key, initialValue);
    }
  }, [key, initialValue, storageAvailable]);

  // Listen for storage events from other tabs
  useEffect(() => {
    if (!storageAvailable) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes(key) && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue.data);
        } catch (error) {
          console.error(`Error processing storage event for key "${key}":`, error);
        }
      }
    };

    // Add event listener
    window.addEventListener("storage", handleStorageChange);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, storageAvailable]);

  return [storedValue, setValue, removeValue, resetValue, isLoading];
}
