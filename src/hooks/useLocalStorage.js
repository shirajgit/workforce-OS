// hooks/useLocalStorage.js
import { useState, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const toStore = value instanceof Function ? value(stored) : value;
      setStored(toStore);
      if (toStore === null || toStore === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(toStore));
      }
    } catch (e) {
      console.warn("[useLocalStorage] Failed to save:", key, e);
    }
  }, [key, stored]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setStored(initialValue);
  }, [key, initialValue]);

  return [stored, setValue, remove];
}