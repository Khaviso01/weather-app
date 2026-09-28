import { useEffect, useState } from "react";

// Type definition for the initial value or function used in localStorage state
type InitialValue<T> = T | (() => T);

// Custom hook to synchronize state with browser localStorage
export function useLocalStorage<T>(key: string, initialValue: InitialValue<T>) {
  // Initialize state from localStorage or fallback to the provided initial value
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
      return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    } catch {
      return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    }
  });

  // Effect to update localStorage whenever the key or value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
   
    }
  }, [key, value]);

  return [value, setValue] as const;
}