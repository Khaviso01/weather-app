import WeatherIcon from "./WeatherIcon";
import { codeToCondition } from "../utils/weatherCode";
import { celsiusToFahrenheit } from "../api/weather";
import type { HourlyPoint, TempUnit } from "../types/weather";

interface Props {
  hours: HourlyPoint[];
  unit: TempUnit;
}

function formatHour(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
    .replace(" ", "")
    .toLowerCase();
}

export default function HourlyForecast({ hours, unit }: Props) {
  return (
    <div className="hourly-forecast">
      {hours.map((h) => {
        const temp = unit === "C" ? h.temperature : celsiusToFahrenheit(h.temperature);
        const hour = new Date(h.time).getHours();
        const isDay = hour >= 6 && hour < 19;
        return (
          <div key={h.time} className="hour-card">
            <span className="hour-card-time">{formatHour(h.time)}</span>
            <WeatherIcon condition={codeToCondition(h.weatherCode)} isDay={isDay} size={32} />
            <span className="hour-card-temp">{temp}°</span>
          </div>
        );
      })}
    </div>
  );
}
