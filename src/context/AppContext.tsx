import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { SavedLocation, WeatherBundle, Theme, TempUnit } from "../types/weather";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchWeather, reverseGeocode, hasApiKey, setApiKey } from "../api/weather";
import { useToast } from "./ToastContext";
import { CURRENT_ID } from "../constants";

interface CacheEntry {
  bundle: WeatherBundle;
  fetchedAt: number;
}

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  unit: TempUnit;
  setUnit: (u: TempUnit) => void;
  locations: SavedLocation[];
  activeLocationId: string | null;
  setActiveLocationId: (id: string) => void;
  addLocation: (loc: Omit<SavedLocation, "id">) => string;
  removeLocation: (id: string) => void;
  weatherFor: (id: string) => CacheEntry | undefined;
  refreshLocation: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  isOnline: boolean;
  isRefreshing: boolean;
  geoStatus: "idle" | "requesting" | "granted" | "denied";
  requestGeolocation: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  apiKeyMissing: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function getDefaultTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [theme, setTheme] = useLocalStorage<Theme>("weather:theme", getDefaultTheme);
  const [unit, setUnit] = useLocalStorage<TempUnit>("weather:unit", "C");
  const [locations, setLocations] = useLocalStorage<SavedLocation[]>("weather:locations", []);
  const [activeLocationId, setActiveLocationId] = useLocalStorage<string | null>(
    "weather:activeLocationId",
    null
  );
  const [cache, setCache] = useLocalStorage<Record<string, CacheEntry>>("weather:cache", {});
  const [apiKey, setApiKeyState] = useLocalStorage<string>("weather:apiKey", import.meta.env.VITE_OPENWEATHER_API_KEY ?? "");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const requestedGeoRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const addLocation = useCallback(
    (loc: Omit<SavedLocation, "id">) => {
      const id = loc.isCurrent ? CURRENT_ID : `${loc.latitude.toFixed(3)},${loc.longitude.toFixed(3)}`;
      setLocations((prev) => {
        if (prev.some((l) => l.id === id)) return prev;
        return [...prev, { ...loc, id }];
      });
      return id;
    },
    [setLocations]
  );

  const removeLocation = useCallback(
    (id: string) => {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      setCache((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setActiveLocationId((current) => (current === id ? null : current));
    },
    [setLocations, setCache, setActiveLocationId]
  );

  const refreshLocation = useCallback(
    async (id: string) => {
      const loc = locations.find((l) => l.id === id);
      if (!loc) return;
      if (!hasApiKey()) return;
      if (!navigator.onLine) {
        showToast("Offline — showing last saved forecast", "info");
        return;
      }
      setIsRefreshing(true);
      try {
        const bundle = await fetchWeather(loc.latitude, loc.longitude);
        setCache((prev) => ({ ...prev, [id]: { bundle, fetchedAt: Date.now() } }));
      } catch {
        showToast("Couldn't update weather. Showing cached data.", "error");
      } finally {
        setIsRefreshing(false);
      }
    },
    [locations, setCache, showToast]
  );

  const refreshAll = useCallback(async () => {
    if (!navigator.onLine || !hasApiKey()) return;
    setIsRefreshing(true);
    try {
      await Promise.all(
        locations.map(async (loc) => {
          try {
            const bundle = await fetchWeather(loc.latitude, loc.longitude);
            setCache((prev) => ({ ...prev, [loc.id]: { bundle, fetchedAt: Date.now() } }));
          } catch {
            /* keep stale cache for this location */
          }
        })
      );
    } finally {
      setIsRefreshing(false);
    }
     
  }, [locations, setCache]);

  useEffect(() => {
    const on = () => {
      setIsOnline(true);
      showToast("Back online — refreshing weather", "success");
       
      refreshAll();
    };
    const off = () => {
      setIsOnline(false);
      showToast("You're offline — showing cached data", "info");
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
     
  }, [refreshAll, showToast]);

  const weatherFor = useCallback((id: string) => cache[id], [cache]);

  const requestGeolocation = useCallback(() => {
    if (requestedGeoRef.current) return;
    requestedGeoRef.current = true;
    if (!("geolocation" in navigator)) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        setLocations((prev) => {
          const filtered = prev.filter((l) => l.id !== CURRENT_ID);
          return [
            { id: CURRENT_ID, name: place.name, country: place.country, latitude, longitude, isCurrent: true },
            ...filtered,
          ];
        });
        setActiveLocationId((current) => current ?? CURRENT_ID);
        setGeoStatus("granted");
        showToast(`Location found: ${place.name}`, "success");
      },
      () => {
        setGeoStatus("denied");
        showToast("Location permission denied — search for a city instead", "info");
      },
      { timeout: 10000 }
    );
  }, [setLocations, setActiveLocationId, showToast]);

  // Fetch weather whenever the active location changes or a new location is added
  useEffect(() => {
    if (activeLocationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the forecast for the newly active location is the intended behavior
      refreshLocation(activeLocationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocationId, locations.length]);

  useEffect(() => {
    setApiKey(apiKey);
  }, [apiKey]);

  const value: AppContextValue = {
    theme,
    setTheme,
    unit,
    setUnit,
    locations,
    activeLocationId,
    setActiveLocationId,
    addLocation,
    removeLocation,
    weatherFor,
    refreshLocation,
    refreshAll,
    isOnline,
    isRefreshing,
    geoStatus,
    requestGeolocation,
    apiKey,
    setApiKey: setApiKeyState,
    apiKeyMissing: !hasApiKey(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
