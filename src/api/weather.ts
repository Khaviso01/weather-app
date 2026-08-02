import type { WeatherBundle, SavedLocation } from "../types/weather";

let API_KEY = sanitizeApiKey(import.meta.env.VITE_OPENWEATHER_API_KEY);

const GEO_BASE = "https://api.openweathermap.org/geo/1.0";
const DATA_BASE = "https://api.openweathermap.org/data/2.5";

function sanitizeApiKey(key: string | undefined) {
  return (key ?? "").trim().replace(/^"(.+)"$/, "$1");
}

export function setApiKey(key: string) {
  API_KEY = sanitizeApiKey(key);
}

export function hasApiKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

class MissingApiKeyError extends Error {
  constructor() {
    super("OpenWeatherMap API key is missing. Add VITE_OPENWEATHER_API_KEY to your .env file.");
    this.name = "MissingApiKeyError";
  }
}

function requireKey() {
  if (!hasApiKey()) throw new MissingApiKeyError();
  return API_KEY as string;
}

interface RawGeocodeResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function searchLocations(query: string): Promise<SavedLocation[]> {
  if (!query.trim()) return [];
  const key = requireKey();
  const url = `${GEO_BASE}/direct?q=${encodeURIComponent(query)}&limit=6&appid=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to search locations");
  const data = (await res.json()) as RawGeocodeResult[];
  return data.map((r) => ({
    id: `${r.lat.toFixed(3)},${r.lon.toFixed(3)}`,
    name: r.name,
    country: r.state ? `${r.state}, ${r.country}` : r.country,
    latitude: r.lat,
    longitude: r.lon,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  try {
    const key = requireKey();
    const url = `${GEO_BASE}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("reverse failed");
    const data = (await res.json()) as RawGeocodeResult[];
    const r = data[0];
    if (!r) return { name: "My Location", country: "" };
    return { name: r.name, country: r.state ? `${r.state}, ${r.country}` : r.country };
  } catch {
    return { name: "My Location", country: "" };
  }
}

interface OwmWeatherEntry {
  dt: number;
  main: { temp: number; temp_max: number; temp_min: number; humidity: number };
  weather: { id: number; description: string; icon: string }[];
  wind: { speed: number };
  pop?: number;
  dt_txt?: string;
}

interface OwmCurrentResponse extends OwmWeatherEntry {
  sys: { sunrise: number; sunset: number };
}

interface OwmForecastResponse {
  list: OwmWeatherEntry[];
  city: { timezone: number; name: string };
}

function isDayFromIcon(icon: string): boolean {
  return icon.endsWith("d");
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const key = requireKey();
  const params = `lat=${lat}&lon=${lon}&units=metric&appid=${key}`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${DATA_BASE}/weather?${params}`),
    fetch(`${DATA_BASE}/forecast?${params}`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    if (currentRes.status === 401 || forecastRes.status === 401) {
      throw new Error("Invalid OpenWeatherMap API key.");
    }
    throw new Error("Failed to fetch weather");
  }

  const currentData = (await currentRes.json()) as OwmCurrentResponse;
  const forecastData = (await forecastRes.json()) as OwmForecastResponse;

  const nowSeconds = currentData.dt;
  const isDayNow = nowSeconds >= currentData.sys.sunrise && nowSeconds < currentData.sys.sunset;

  // The current-weather endpoint doesn't include precipitation probability;
  // approximate it using the nearest 3-hour forecast slot.
  const nearestForecast = forecastData.list.reduce((closest, entry) =>
    Math.abs(entry.dt - nowSeconds) < Math.abs(closest.dt - nowSeconds) ? entry : closest
  );

  const current = {
    temperature: Math.round(currentData.main.temp),
    weatherCode: currentData.weather[0].id,
    description: currentData.weather[0].description,
    windSpeed: Math.round(currentData.wind.speed),
    humidity: Math.round(currentData.main.humidity),
    precipitationProbability: Math.round((nearestForecast.pop ?? 0) * 100),
    isDay: isDayNow,
    time: new Date(nowSeconds * 1000).toISOString(),
  };

  const hourly = forecastData.list.slice(0, 16).map((entry) => ({
    time: new Date(entry.dt * 1000).toISOString(),
    temperature: Math.round(entry.main.temp),
    weatherCode: entry.weather[0].id,
    precipitationProbability: Math.round((entry.pop ?? 0) * 100),
  }));

  // Group the 3-hour forecast entries by calendar date to build a daily summary.
  const byDate = new Map<string, OwmWeatherEntry[]>();
  for (const entry of forecastData.list) {
    const dateKey = (entry.dt_txt ?? new Date(entry.dt * 1000).toISOString()).slice(0, 10);
    const bucket = byDate.get(dateKey) ?? [];
    bucket.push(entry);
    byDate.set(dateKey, bucket);
  }

  const todayKey = new Date(nowSeconds * 1000).toISOString().slice(0, 10);
  const dateKeys = Array.from(byDate.keys());
  if (!dateKeys.includes(todayKey)) dateKeys.unshift(todayKey);

  const daily = dateKeys.slice(0, 6).map((dateKey) => {
    if (dateKey === todayKey) {
      return {
        date: dateKey,
        weatherCode: current.weatherCode,
        description: current.description,
        tempMax: current.temperature,
        tempMin: current.temperature,
        precipitationProbability: current.precipitationProbability,
      };
    }
    const entries = byDate.get(dateKey) ?? [];
    const temps = entries.map((e) => e.main.temp);
    // Use the entry closest to midday as the representative condition for the day.
    const midday = entries.reduce((closest, e) => {
      const closestHour = new Date(closest.dt * 1000).getUTCHours();
      const entryHour = new Date(e.dt * 1000).getUTCHours();
      return Math.abs(entryHour - 12) < Math.abs(closestHour - 12) ? e : closest;
    }, entries[0]);
    return {
      date: dateKey,
      weatherCode: midday.weather[0].id,
      description: midday.weather[0].description,
      tempMax: Math.round(Math.max(...temps)),
      tempMin: Math.round(Math.min(...temps)),
      precipitationProbability: Math.round(Math.max(...entries.map((e) => e.pop ?? 0)) * 100),
    };
  });

  return {
    current,
    hourly,
    daily,
    timezone: forecastData.city.timezone.toString(),
  };
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export { isDayFromIcon, MissingApiKeyError };
