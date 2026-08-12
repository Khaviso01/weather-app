import type { WeatherBundle, SavedLocation } from "../types/weather";

let API_KEY = sanitizeApiKey(import.meta.env.VITE_WEATHERAPI_KEY);

const API_BASE = "https://api.weatherapi.com/v1";

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
    super("WeatherAPI key is missing. Add VITE_WEATHERAPI_KEY to your .env file.");
    this.name = "MissingApiKeyError";
  }
}

function requireKey() {
  if (!hasApiKey()) throw new MissingApiKeyError();
  return API_KEY as string;
}

interface RawSearchResult {
  name: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
}

export async function searchLocations(query: string): Promise<SavedLocation[]> {
  if (!query.trim()) return [];
  const key = requireKey();
  const url = `${API_BASE}/search.json?key=${key}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.text();
    console.error("WeatherAPI Error:", error);
    throw new Error("Failed to search locations");
  }
  const data = (await res.json()) as RawSearchResult[];
  return data.map((r) => ({
    id: `${r.lat.toFixed(3)},${r.lon.toFixed(3)}`,
    name: r.name,
    country: r.region ? `${r.region}, ${r.country}` : r.country,
    latitude: r.lat,
    longitude: r.lon,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  try {
    const key = requireKey();
    const url = `${API_BASE}/search.json?key=${key}&q=${lat},${lon}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("reverse failed");
    const data = (await res.json()) as RawSearchResult[];
    const r = data[0];
    if (!r) return { name: "My Location", country: "" };
    return { name: r.name, country: r.region ? `${r.region}, ${r.country}` : r.country };
  } catch {
    return { name: "My Location", country: "" };
  }
}

interface RawCondition {
  text: string;
  icon: string;
  code: number;
}

interface RawCurrentResponse {
  last_updated_epoch: number;
  temp_c: number;
  is_day: 0 | 1;
  condition: RawCondition;
  wind_kph: number;
  humidity: number;
  pressure_mb?: number;
}

interface RawForecastHour {
  time_epoch: number;
  temp_c: number;
  condition: RawCondition;
  chance_of_rain?: number;
  chance_of_snow?: number;
  precip_mm: number;
  is_day: 0 | 1;
  pressure_mb?: number;
}

interface RawForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: RawCondition;
    daily_chance_of_rain?: number;
    daily_chance_of_snow?: number;
  };
  hour: RawForecastHour[];
}

interface RawWeatherResponse {
  location: { tz_id: string };
  current: RawCurrentResponse;
  forecast: { forecastday: RawForecastDay[] };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const key = requireKey();
  const url = `${API_BASE}/forecast.json?key=${key}&q=${lat},${lon}&days=6&aqi=no&alerts=no`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorResponse = await res.text();
    throw new Error(`Failed to fetch weather: ${errorResponse}`);
  }
  const data = (await res.json()) as RawWeatherResponse;

  const currentData = data.current;
  const forecastDays = data.forecast.forecastday;
  const allHours = forecastDays.flatMap((day) => day.hour);
  const nowSeconds = currentData.last_updated_epoch;
  const nearestForecast = allHours.reduce((closest, entry) =>
    Math.abs(entry.time_epoch - nowSeconds) < Math.abs(closest.time_epoch - nowSeconds) ? entry : closest
  );

  const todayHours = forecastDays[0]?.hour ?? [];
  const pressureValues = todayHours.map((hour) => Math.round(hour.pressure_mb ?? 0)).filter(Boolean);
  const pressureMax = pressureValues.length ? Math.max(...pressureValues) : Math.round(currentData.pressure_mb ?? 0);
  const pressureMin = pressureValues.length ? Math.min(...pressureValues) : Math.round(currentData.pressure_mb ?? 0);

  const current = {
    temperature: Math.round(currentData.temp_c),
    weatherCode: currentData.condition.code,
    description: currentData.condition.text,
    windSpeed: Math.round(currentData.wind_kph / 3.6),
    humidity: Math.round(currentData.humidity),
    pressure: Math.round(currentData.pressure_mb ?? 0),
    pressureMax,
    pressureMin,
    precipitationProbability: Math.round(nearestForecast.chance_of_rain ?? nearestForecast.chance_of_snow ?? 0),
    isDay: currentData.is_day === 1,
    time: new Date(nowSeconds * 1000).toISOString(),
  };

  const nextHoursStart = allHours.findIndex((entry) => entry.time_epoch >= nowSeconds);
  const hourlyStart = nextHoursStart !== -1 ? nextHoursStart : 0;
  const hourly = allHours.slice(hourlyStart, hourlyStart + 16).map((entry) => ({
    time: new Date(entry.time_epoch * 1000).toISOString(),
    temperature: Math.round(entry.temp_c),
    weatherCode: entry.condition.code,
    precipitationProbability: Math.round(entry.chance_of_rain ?? entry.chance_of_snow ?? 0),
  }));

  const daily = forecastDays.slice(0, 6).map((day, index) => {
    if (index === 0) {
      return {
        date: day.date,
        weatherCode: current.weatherCode,
        description: current.description,
        tempMax: current.temperature,
        tempMin: current.temperature,
        precipitationProbability: current.precipitationProbability,
      };
    }
    return {
      date: day.date,
      weatherCode: day.day.condition.code,
      description: day.day.condition.text,
      tempMax: Math.round(day.day.maxtemp_c),
      tempMin: Math.round(day.day.mintemp_c),
      precipitationProbability: Math.round(day.day.daily_chance_of_rain ?? day.day.daily_chance_of_snow ?? 0),
    };
  });

  return {
    current,
    hourly,
    daily,
    timezone: data.location.tz_id,
  };
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export { MissingApiKeyError };
