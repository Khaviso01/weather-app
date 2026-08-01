import { AlertTriangle } from "lucide-react";
import type { WeatherAlert } from "../types/weather";

export default function AlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="alert-banner">
      {alerts.map((a) => (
        <div
          key={a.id}
          role="alert"
          className={`alert-card ${a.severity === "severe"
              ? "severe"
              : "warning"
            }`}
        >
          <AlertTriangle
            size={18}
            className={`alert-icon ${a.severity === "severe" ? "text-rose-300" : "text-amber-300"}`}
          />
          <div className="alert-content">
            <span className={`alert=title ${a.severity === "severe" ? "severe" : "warning"}`}>
              {a.title}
            </span>
            <span className="alert-description">{a.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
