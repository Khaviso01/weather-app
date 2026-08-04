import { useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CURRENT_ID } from "../constants";
import TopBar from "../components/TopBar";
import WeatherHero from "../components/WeatherHero";
import StatsRow from "../components/StatsRow";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import AlertBanner from "../components/AlertBanner";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyLocationState from "../components/EmptyLocationState";
import SearchBar from "../components/SearchBar";
import LocationCard from "../components/LocationCard";
import { useToast } from "../context/ToastContext";
import { deriveAlerts } from "../utils/alerts";
import type { SavedLocation } from "../types/weather";

export default function Home() {
  const {
    locations,
    activeLocationId,
    setActiveLocationId,
    addLocation,
    removeLocation,
    weatherFor,
    isOnline,
    geoStatus,
    requestGeolocation,
    unit,
  } = useApp();
  const { showToast } = useToast();

  const activeId = activeLocationId ?? locations[0]?.id ?? null;
  const activeLocation = locations.find((l) => l.id === activeId);
  const entry = activeId ? weatherFor(activeId) : undefined;

  const dateLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
  }, []);

  useEffect(() => {
    if (locations.length === 0 && geoStatus === "idle") {
      requestGeolocation();
    }
  }, [geoStatus, locations.length, requestGeolocation]);

  function handleSelectSearch(loc: Omit<SavedLocation, "id">) {
    const id = addLocation(loc);
    setActiveLocationId(id);
    showToast(`${loc.name} added to your places`, "success");
  }

  function handleSelect(id: string) {
    setActiveLocationId(id);
  }

  function handleRemove(id: string, name: string) {
    removeLocation(id);
    showToast(`${name} removed`, "info");
  }

  if (locations.length === 0) {
    return (
      <div className="home-loading">
        <TopBar locationName="Locating…" isOnline={isOnline} />
        {geoStatus === "requesting" ? <SkeletonLoader /> : <EmptyLocationState onUseLocation={requestGeolocation} onSelectSearch={handleSelectSearch} geoStatus={geoStatus} />}
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="home-loading">
        <TopBar locationName={activeLocation?.name ?? "Locating…"} isOnline={isOnline} />
        <SkeletonLoader />
      </div>
    );
  }

  const { bundle } = entry;
  const alerts = deriveAlerts(bundle.current, activeLocation?.name ?? "your area");

  return (
    <div className="home-page">
      <SearchBar onSelect={handleSelectSearch} />

      <AlertBanner alerts={alerts} />
      <TopBar
        locationName={
          activeLocation?.isCurrent || activeId === CURRENT_ID
            ? `${activeLocation?.name}`
            : activeLocation?.name ?? "Weather"
        }
        isOnline={isOnline}
      />

      <WeatherHero
        temperature={bundle.current.temperature}
        weatherCode={bundle.current.weatherCode}
        description={bundle.current.description}
        isDay={bundle.current.isDay}
        unit={unit}
        dateLabel={dateLabel}
      />

      <StatsRow
        windSpeed={bundle.current.windSpeed}
        humidity={bundle.current.humidity}
        rainChance={bundle.current.precipitationProbability}
      />

      <div className="forecast-section">
        <h3 className="forecast-section-title">Hourly weather</h3>
        <HourlyForecast hours={bundle.hourly.slice(0, 20)} unit={unit} />
      </div>

      <div className="forecast-section">
        <h3 className="forecast-section-title">Daily weather</h3>
        <DailyForecast days={bundle.daily.slice(0, 7)} unit={unit} />
      </div>

      <div className="single-page-section">
        <div className="single-page-section-header">
          <h3 className="single-page-section-title">Saved Locations</h3>
        </div>

        <button onClick={requestGeolocation} disabled={geoStatus === "requesting"} className="locations-add-button">
          {geoStatus === "requesting" ? "Locating…" : "Use current location"}
        </button>

        <div className="locations-list">
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
    </div>
  );
}
