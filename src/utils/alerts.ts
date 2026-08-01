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

  if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232].includes(current.weatherCode)) {
    alerts.push({
      id: "thunder",
      title: "Thunderstorm Alert",
      description: `Thunderstorms are active near ${locationName}. Seek shelter and avoid open areas.`,
      severity: "severe",
    });
  }

  if (current.precipitationProbability >= 80 && current.weatherCode >= 500 && current.weatherCode < 532) {
    alerts.push({
      id: "rain",
      title: "Heavy Rain Alert",
      description: `A high chance of heavy rain (${current.precipitationProbability}%) in ${locationName}. Flooding possible in low-lying areas.`,
      severity: "moderate",
    });
  }

  if (current.weatherCode >= 600 && current.weatherCode < 700 && current.temperature <= 0) {
    alerts.push({
      id: "snow",
      title: "Snow Advisory",
      description: `Snowfall expected in ${locationName} with temperatures at or below freezing.`,
      severity: "moderate",
    });
  }

  return alerts;
}
