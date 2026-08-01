import { MapPin, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  locationName: string;
  isOnline: boolean;
}

export default function TopBar({ locationName, isOnline }: Props) {
  return (
    <div className="top-bar">
      <Link to="/locations" className="top-bar-link" aria-label="Change location">
        <MapPin size={16} className="text-app-accent" />
        <span className="top-bar-location">{locationName}</span>
      </Link>
      {!isOnline && (
        <div className="top-bar-offline">
          <WifiOff size={12} />
          Offline
        </div>
      )}
    </div>
  );
}
