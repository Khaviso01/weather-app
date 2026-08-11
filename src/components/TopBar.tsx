import { MapPin, Moon, Sun, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

interface Props {
  locationName: string;
  isOnline: boolean;
}

export default function TopBar({ locationName, isOnline }: Props) {
  const { theme, setTheme, unit, setUnit } = useApp();
  const isDark = theme === "dark";
  const isCelsius = unit === "C";

  return (
    <div className="top-bar">
      <Link to="/locations" className="top-bar-link" aria-label="Change location">
        <MapPin size={20} className="text-app-accent" />
        <span className="top-bar-location">{locationName}</span>
      </Link>

      <div className="top-bar-actions">
        <button
          type="button"
          className="top-bar-unit-toggle"
          onClick={() => setUnit(isCelsius ? "F" : "C")}
          aria-label={isCelsius ? "Switch to Fahrenheit" : "Switch to Celsius"}
        >
          <span className={isCelsius ? "active" : ""}>°C</span>
          <span className={!isCelsius ? "active" : ""}>°F</span>
        </button>

        <button
          type="button"
          className="top-bar-theme-toggle"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {!isOnline && (
          <div className="top-bar-offline">
            <WifiOff size={12} />
            Offline
          </div>
        )}
      </div>
    </div>
  );
}
