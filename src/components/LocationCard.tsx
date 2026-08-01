import { X, LocateFixed } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { codeToCondition } from "../utils/weatherCode";
import { celsiusToFahrenheit } from "../api/weather";
import type { SavedLocation, WeatherBundle, TempUnit } from "../types/weather";

interface Props {
  location: SavedLocation;
  bundle?: WeatherBundle;
  unit: TempUnit;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function LocationCard({ location, bundle, unit, active, onSelect, onRemove }: Props) {
  const temp = bundle
    ? unit === "C"
      ? bundle.current.temperature
      : celsiusToFahrenheit(bundle.current.temperature)
    : null;

  return (
    <button onClick={onSelect} className={`location-card ${active ? "active" : ""}`}>
      <div className="location-card-body">
        {bundle ? (
          <WeatherIcon condition={codeToCondition(bundle.current.weatherCode)} isDay={bundle.current.isDay} size={36} />
        ) : (
          <div className="location-icon-skeleton" />
        )}
        <div className="location-meta">
          <div className="location-title-row">
            {location.isCurrent && <LocateFixed size={12} className="text-app-accent" />}
            <span className="location-title">{location.name}</span>
          </div>
          <span className="location-country">{location.country}</span>
        </div>
      </div>
      <div className="location-card-actions">
        {temp !== null && <span className="location-temp">{temp}°</span>}
        {!location.isCurrent && (
          <span
            role="button"
            aria-label={`Remove ${location.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="location-remove"
          >
            <X size={14} />
          </span>
        )}
      </div>
    </button>
  );
}
