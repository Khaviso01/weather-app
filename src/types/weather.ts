export type TempUnit = "C" | "F";

// Type definition for application theme appearance
export type Theme = "dark" | "light";

// Interface representing a saved geographical location
export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  isCurrent?: boolean;
}

// Interface representing a single hourly forecast data point
export interface HourlyPoint {
  time: string; // ISO
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

// Interface representing a single daily forecast summary
export interface DailyPoint {
  date: string; // ISO date
  weatherCode: number;
  description: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
}

// Interface representing current weather conditions for a location
export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  description: string;
  windSpeed: number;
  humidity: number;
  precipitationProbability: number;
  pressure: number;
  pressureMax: number;
  pressureMin: number;
  isDay: boolean;
  time: string;
}

// Interface grouping current, hourly, daily weather data and timezone information
export interface WeatherBundle {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  timezone: string;
}

// Interface representing a weather alert notification
export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: "minor" | "moderate" | "severe";
}