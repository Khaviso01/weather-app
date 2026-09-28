import WeatherIcon from "./WeatherIcon";
import { codeToCondition, titleCase } from "../utils/weatherCode";
import { celsiusToFahrenheit } from "../api/weather";
import type { TempUnit } from "../types/weather";

// Props definition for the WeatherHero component
interface Props {
  temperature: number;
  weatherCode: number;
  description: string;
  isDay: boolean;
  unit: TempUnit;
  dateLabel: string;
}

// Component that renders the main weather hero section showing current temperature and condition
export default function WeatherHero({
  temperature,
  weatherCode,
  description,
  isDay,
  unit,
  
}: Props) {
  // Converting weather code to standard condition type
  const condition = codeToCondition(weatherCode);
  //Calculating display temperature based on selected unit
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