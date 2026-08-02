import { useEffect, useState } from "react";

type InitialValue<T> = T | (() => T);

export function useLocalStorage<T>(key: string, initialValue: InitialValue<T>) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
      return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    } catch {
      return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable - fail silently, app still works in-memory
    }
  }, [key, value]);

  return [value, setValue] as const;
}
