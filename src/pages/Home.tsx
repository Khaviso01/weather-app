import { useEffect, useMemo, useState } from "react";
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
import { fetchWeather } from "../api/weather";
import type { SavedLocation, WeatherBundle } from "../types/weather";

type PreviewLocation = Omit<SavedLocation, "id">;

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

  const [previewLocation, setPreviewLocation] = useState<PreviewLocation | null>(null);
  const [previewEntry, setPreviewEntry] = useState<WeatherBundle | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showPreviewBanner, setShowPreviewBanner] = useState(true);

  const activeId = activeLocationId ?? locations[0]?.id ?? null;
  const activeLocation = locations.find((l) => l.id === activeId);
  const activeEntry = activeId ? weatherFor(activeId) : undefined;

  const previewId = previewLocation ? `${previewLocation.latitude.toFixed(3)},${previewLocation.longitude.toFixed(3)}` : null;
  const isPreviewSaved = previewId ? locations.some((loc) => loc.id === previewId) : false;
  const displayedLocation = previewLocation ? { ...previewLocation, id: previewId ?? "" } : activeLocation ?? null;
  const displayedEntry = previewLocation ? previewEntry : activeEntry?.bundle;

  const dateLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
  }, []);

  useEffect(() => {
    if (locations.length === 0 && geoStatus === "idle") {
      requestGeolocation();
    }
  }, [geoStatus, locations.length, requestGeolocation]);

  useEffect(() => {
    if (!previewLocation) {
      setPreviewEntry(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      setShowPreviewBanner(false);
      return;
    }

    let canceled = false;
    setPreviewError(null);
    setIsPreviewLoading(true);

    fetchWeather(previewLocation.latitude, previewLocation.longitude)
      .then((bundle) => {
        if (canceled) return;
        setPreviewEntry(bundle);
      })
      .catch((err) => {
        console.error("Weather fetch failed:", err);
        if (canceled) return;
        setPreviewError("Unable to load forecast. Check your API key and network.");
        showToast("Unable to load forecast. Check your API key and network.", "error");
      })
      .finally(() => {
        if (!canceled) setIsPreviewLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [previewLocation, showToast]);

  function handleSelectSearch(loc: PreviewLocation) {
    setPreviewLocation(loc);
    setPreviewEntry(null);
    setPreviewError(null);
    setIsPreviewLoading(true);
    setShowPreviewBanner(true);
  }

  function handleSelect(id: string) {
    setActiveLocationId(id);
    setPreviewLocation(null);
    setPreviewEntry(null);
    setPreviewError(null);
    setIsPreviewLoading(false);
  }

  function handleSavePreview() {
    if (!previewLocation) return;
    const id = addLocation(previewLocation);
    setActiveLocationId(id);
    setPreviewLocation(null);
    setPreviewEntry(null);
    setPreviewError(null);
    setIsPreviewLoading(false);
    showToast(`${previewLocation.name} saved`, "success");
  }

  function handleRemove(id: string, name: string) {
    removeLocation(id);
    showToast(`${name} removed`, "info");
  }

  function handleClearPreview() {
    setShowPreviewBanner(false);
  }

  if (locations.length === 0 && !previewLocation) {
    return (
      <div className="home-loading">
        <TopBar locationName="Locating…" isOnline={isOnline} />
        {geoStatus === "requesting" ? (
          <SkeletonLoader />
        ) : (
          <EmptyLocationState onUseLocation={requestGeolocation} onSelectSearch={handleSelectSearch} geoStatus={geoStatus} />
        )}
      </div>
    );
  }

  
  if (!displayedEntry) {
    return (
      <div className="home-loading">
        <TopBar locationName={activeLocation?.name ?? "Locating…"} isOnline={isOnline} />
        <SkeletonLoader />
      </div>
    );
  }

  const bundle = displayedEntry;
  const alerts = deriveAlerts(bundle.current, displayedLocation?.name ?? "your area");

  return (
    <div className="home-page">
      <SearchBar onSelect={handleSelectSearch} />
      {previewLocation && showPreviewBanner && (
        <div className="preview-banner">
          <div>
            <h3 className="preview-banner-title">{previewLocation.name}</h3>
            <p className="preview-banner-subtitle">{previewLocation.country}</p>
          </div>

          <div className="preview-banner-actions">
            {!isPreviewSaved ? (
              <button
                type="button"
                disabled={isPreviewLoading}
                onClick={handleSavePreview}
                className="preview-save-button"
              >
                Save location
              </button>
            ) : (
              <button type="button" onClick={() => handleSelect(previewId ?? "")} className="preview-view-button">
                View saved location
              </button>
            )}
            <button type="button" onClick={handleClearPreview} className="preview-clear-button">
              Cancel
            </button>
          </div>
          {previewError && <p className="preview-error">{previewError}</p>}
        </div>
      )}
      <button onClick={requestGeolocation} disabled={geoStatus === "requesting"} className="locations-add-button">
          {geoStatus === "requesting" ? "Locating…" : "Use current location"}
        </button>
      {displayedEntry ? <AlertBanner alerts={alerts} /> : null}
      <TopBar locationName={previewLocation ? `${previewLocation.name}` : activeLocation?.isCurrent || activeId === CURRENT_ID ? `${activeLocation?.name}` : activeLocation?.name ?? "Weather"} isOnline={isOnline} />

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
          <h3 className="single-page-section-title">Locations</h3>
        </div>

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