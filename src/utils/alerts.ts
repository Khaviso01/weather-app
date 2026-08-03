import type { CurrentWeather, WeatherAlert } from "../types/weather";

export function deriveAlerts(current: CurrentWeather, locationName: string): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (current.windSpeed >= 15) {
    alerts.push({
      id: "wind",
      title: "High Wind Warning",
      description: `Strong winds around ${current.windSpeed} m/s expected in ${locationName}. Secure loose outdoor objects.`,
      severity: current.windSpeed >= 22 ? "severe" : "moderate",
    });
  }

  const thunderCodes = [1087, 1273, 1276, 1279, 1282];
  const rainCodes = new Set([
    1063, 1069, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201,
    1240, 1243, 1246, 1249, 1252, 1273, 1276,
  ]);
  const snowCodes = new Set([
    1066, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225,
    1237, 1255, 1258, 1261, 1264, 1279, 1282,
  ]);

  if (thunderCodes.includes(current.weatherCode)) {
    alerts.push({
      id: "thunder",
      title: "Thunderstorm Alert",
      description: `Thunderstorms are active near ${locationName}. Seek shelter and avoid open areas.`,
      severity: "severe",
    });
  }

  if (current.precipitationProbability >= 80 && rainCodes.has(current.weatherCode)) {
    alerts.push({
      id: "rain",
      title: "Heavy Rain Alert",
      description: `A high chance of heavy rain (${current.precipitationProbability}%) in ${locationName}. Flooding possible in low-lying areas.`,
      severity: "moderate",
    });
  }

  if (current.temperature <= 0 && snowCodes.has(current.weatherCode)) {
    alerts.push({
      id: "snow",
      title: "Snow Advisory",
      description: `Snowfall expected in ${locationName} with temperatures at or below freezing.`,
      severity: "moderate",
    });
  }

  return alerts;
}
