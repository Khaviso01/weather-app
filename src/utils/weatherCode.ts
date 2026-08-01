// Maps OpenWeatherMap condition codes to the app's internal Condition type.
// Reference: https://openweathermap.org/weather-conditions

export type Condition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

export function codeToCondition(code: number): Condition {
  if (code >= 200 && code < 300) return "thunder";
  if (code >= 300 && code < 400) return "drizzle";
  if (code >= 500 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "fog";
  if (code === 800) return "clear";
  if (code === 801 || code === 802) return "partly-cloudy";
  if (code === 803 || code === 804) return "cloudy";
  return "cloudy";
}

// Fallback label, used only if OpenWeatherMap's own description text is unavailable.
export function codeToLabel(code: number): string {
  const map: Record<Condition, string> = {
    clear: "Clear Sky",
    "partly-cloudy": "Partly Cloudy",
    cloudy: "Cloudy",
    fog: "Foggy",
    drizzle: "Drizzling",
    rain: "Rainy",
    snow: "Snowy",
    thunder: "Thunderstorm",
  };
  return map[codeToCondition(code)];
}

export function titleCase(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}
