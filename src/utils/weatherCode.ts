// Maps WeatherAPI condition codes to the app's internal Condition type.
// Reference: https://www.weatherapi.com/docs/weather_conditions.json

export type Condition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

const thunderCodes = new Set([1087, 1273, 1276, 1279, 1282]);
const drizzleCodes = new Set([1072, 1150, 1153, 1168, 1171]);
const rainCodes = new Set([
  1063, 1069, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201,
  1240, 1243, 1246, 1249, 1252,
]);
const snowCodes = new Set([
  1066, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225,
  1237, 1255, 1258, 1261, 1264,
]);

export function codeToCondition(code: number): Condition {
  if (code === 1000) return "clear";
  if (code === 1003) return "partly-cloudy";
  if (code === 1006 || code === 1009) return "cloudy";
  if (thunderCodes.has(code)) return "thunder";
  if (drizzleCodes.has(code)) return "drizzle";
  if (rainCodes.has(code)) return "rain";
  if (snowCodes.has(code)) return "snow";
  if (code >= 1012 && code <= 1048) return "fog";
  return "cloudy";
}

// Fallback label, used only if WeatherAPI's own description text is unavailable.
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