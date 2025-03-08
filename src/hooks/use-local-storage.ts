import {
  getStorageItem,
  isStorageAvailable,
  removeStorageItem,
  setStorageItem,
} from "@/lib/storage";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

/**
 * Error handler function for storage operations
 */
const handleStorageError = (operation: string, key: string, error: unknown): void => {
  console.error(`Error ${operation} localStorage key "${key}":`, error);
};

/**
 * A hook for using localStorage with React state
 *
 * @param key - The key to store the value under in localStorage
 * @param initialValue - The initial value to use if no value is found in localStorage
 * @returns A tuple of [value, setValue, removeValue, resetValue, isLoading]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void, () => void, boolean] {
  const storageAvailable = isStorageAvailable();

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) {
      return initialValue;
    }

    const item = getStorageItem<T>(key, initialValue);
    return item !== undefined ? item : initialValue;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (storageAvailable) {
          setStorageItem(key, valueToStore);
        }
      } catch (error) {
        handleStorageError("setting", key, error);
      }
    },
    [key, storedValue, storageAvailable]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (storageAvailable) {
        removeStorageItem(key);
      }
    } catch (error) {
      handleStorageError("removing", key, error);
    }
  }, [key, initialValue, storageAvailable]);

  const resetValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (storageAvailable) {
        setStorageItem(key, initialValue);
      }
    } catch (error) {
      handleStorageError("resetting", key, error);
    }
  }, [key, initialValue, storageAvailable]);

  useEffect(() => {
    if (!storageAvailable) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes(key) && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue.data);
        } catch (error) {
          handleStorageError("processing storage event for", key, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, storageAvailable]);

  return [storedValue, setValue, removeValue, resetValue, isLoading];
}
