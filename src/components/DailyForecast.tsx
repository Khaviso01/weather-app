import WeatherIcon from "./WeatherIcon";
import { codeToCondition, titleCase } from "../utils/weatherCode";
import { celsiusToFahrenheit } from "../api/weather";
import type { DailyPoint, TempUnit } from "../types/weather";

interface Props {
  days: DailyPoint[];
  unit: TempUnit;
}

function formatDay(iso: string, index: number) {
  if (index === 0) return "Today";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export default function DailyForecast({ days, unit }: Props) {
  const conv = (c: number) => (unit === "C" ? c : celsiusToFahrenheit(c));

  return (
    <div className="daily-forecast">
      {days.map((d, i) => (
        <div key={d.date} className="forecast-row">
          <div className="forecast-row-main">
            <WeatherIcon condition={codeToCondition(d.weatherCode)} size={32} />
            <div className="forecast-row-content">
              <span className="forecast-day-title">{formatDay(d.date, i)}</span>
              <span className="forecast-day-desc">{titleCase(d.description)}</span>
            </div>
          </div>
          <div className="forecast-temp-group">
            <span className="forecast-temp">{conv(d.tempMax)}°</span>
            <span className="forecast-temp-min">{conv(d.tempMin)}°</span>
          </div>
        </div>
      ))}
    </div>
  );
}
