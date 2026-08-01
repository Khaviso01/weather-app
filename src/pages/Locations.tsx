import { useNavigate } from "react-router-dom";
import { LocateFixed } from "lucide-react";
import { useApp } from "../context/AppContext";
import SearchBar from "../components/SearchBar";
import LocationCard from "../components/LocationCard";
import { useToast } from "../context/ToastContext";
import type { SavedLocation } from "../types/weather";

export default function Locations() {
  const {
    locations,
    activeLocationId,
    setActiveLocationId,
    addLocation,
    removeLocation,
    weatherFor,
    unit,
    geoStatus,
    requestGeolocation,
  } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleAdd(loc: Omit<SavedLocation, "id">) {
    const id = addLocation(loc);
    showToast(`${loc.name} added to your locations`, "success");
    setActiveLocationId(id);
  }

  function handleSelect(id: string) {
    setActiveLocationId(id);
    navigate("/");
  }

  function handleRemove(id: string, name: string) {
    removeLocation(id);
    showToast(`${name} removed`, "info");
  }

  return (
    <div className="locations-page">
      <div className="locations-header">
        <h1 className="locations-title">Locations</h1>
        <p className="locations-subtitle">Search, save, and switch between forecasts.</p>
      </div>

      <SearchBar onSelect={handleAdd} />

      <button onClick={requestGeolocation} disabled={geoStatus === "requesting"} className="locations-add-button">
        <LocateFixed size={16} className="text-app-accent" />
        {geoStatus === "requesting" ? "Locating…" : "Use current location"}
      </button>

      <div className="locations-list">
        {locations.length === 0 && <p className="locations-empty">No saved locations yet. Search above to add one.</p>}
        {locations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={loc}
            bundle={weatherFor(loc.id)?.bundle}
            unit={unit}
            active={loc.id === activeLocationId}
            onSelect={() => handleSelect(loc.id)}
            onRemove={() => handleRemove(loc.id, loc.name)}
          />
        ))}
      </div>
    </div>
  );
}
