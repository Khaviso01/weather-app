import WeatherIcon from "./WeatherIcon";
import { codeToCondition, titleCase } from "../utils/weatherCode";
import { celsiusToFahrenheit } from "../api/weather";
import type { TempUnit } from "../types/weather";

interface Props {
  temperature: number;
  weatherCode: number;
  description: string;
  isDay: boolean;
  unit: TempUnit;
  dateLabel: string;
}



export default function WeatherHero({
  temperature,
  weatherCode,
  description,
  isDay,
  unit,
}: Props) {
  const condition = codeToCondition(weatherCode);
  const displayTemp = unit === "C" ? temperature : celsiusToFahrenheit(temperature);

  return (
    <div className="weather-hero">
      <div className="weather-hero-content">
        <div className="weather-hero-text">
          <span className="weather-hero-description">{titleCase(description)}</span>
          <span className="weather-hero-temp">
            {displayTemp}°{unit}
          </span>
        </div>
        <WeatherIcon condition={condition} isDay={isDay} size={84} className="weather-hero-icon" />
      </div>
      
    </div>
  );
}
