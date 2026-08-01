import { LocateFixed } from "lucide-react";
import SearchBar from "./SearchBar";
import type { SavedLocation } from "../types/weather";

interface Props {
  onUseLocation: () => void;
  onSelectSearch: (loc: Omit<SavedLocation, "id">) => void;
  geoStatus: "idle" | "requesting" | "granted" | "denied";
}

export default function EmptyLocationState({ onUseLocation, onSelectSearch, geoStatus }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <LocateFixed size={26} className="text-app-accent" />
      </div>
      <div className="empty-state-copy-block">
        <h2 className="empty-state-title">Find your weather</h2>
        <p className="empty-state-copy">
          Use your current location or search for a city to get started.
        </p>
      </div>
      <button onClick={onUseLocation} disabled={geoStatus === "requesting"} className="empty-state-button">
        {geoStatus === "requesting" ? "Requesting location…" : "Use current location"}
      </button>
      <div className="empty-state-divider">
        <div className="empty-state-divider-line" />
        <span className="empty-state-divider-text">or</span>
        <div className="empty-state-divider-line" />
      </div>
      <SearchBar onSelect={onSelectSearch} />
    </div>
  );
}
