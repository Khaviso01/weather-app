export type TempUnit = "C" | "F";
export type Theme = "dark" | "light";

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  isCurrent?: boolean;
}

export interface HourlyPoint {
  time: string; // ISO
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface DailyPoint {
  date: string; // ISO date
  weatherCode: number;
  description: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  description: string;
  windSpeed: number;
  humidity: number;
  precipitationProbability: number;
  isDay: boolean;
  time: string;
}

export interface WeatherBundle {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  timezone: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: "minor" | "moderate" | "severe";
}
