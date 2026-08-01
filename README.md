# Weatherly — React + TypeScript Weather App

A weather app built with React, TypeScript, and Vite, matching the attached
Dribbble reference design. Live weather data comes from the
[OpenWeatherMap](https://openweathermap.org/api) API.

## Getting started

1. **Get a free API key**
   - Sign up at [openweathermap.org/api](https://openweathermap.org/api)
   - Copy your key from the "API keys" tab of your account

2. **Configure the app**

   Copy the example env file and paste in your key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

3. **Install and run**

   ```bash
   npm install
   npm run dev
   ```

Other scripts:

```bash
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint       # run ESLint
```

## Tech stack

- **React 19 + TypeScript** — component-based UI with full type safety
- **Vite** — dev server and build tooling
- **react-router-dom v6** — routing between Weather / Locations / Settings
- **Tailwind CSS v4** — utility-first styling, theme-driven via CSS variables
- **lucide-react** — icon set for UI chrome (nav, stats, alerts)
- **OpenWeatherMap API** — current conditions, 5-day/3-hour forecast, and
  geocoding/reverse-geocoding for search and current-location lookup
- **localStorage** — the sole data store (no backend), used for saved
  locations, active location, theme, units, and cached forecasts

## Which OpenWeatherMap endpoints are used

All are included in OpenWeatherMap's free tier (no paid subscription needed):

- `GET /data/2.5/weather` — current conditions for a lat/lon
- `GET /data/2.5/forecast` — 5-day forecast in 3-hour steps; the app uses
  this for both the hourly cards (today/tomorrow) and, by grouping entries
  per calendar day, the daily summaries shown in "Next 3 Days"
- `GET /geo/1.0/direct` — turns a searched city name into coordinates
- `GET /geo/1.0/reverse` — turns GPS coordinates into a place name for
  "current location"

## How it meets the brief

**Real-time weather info**
- Current temperature, condition, wind speed, humidity, and rain chance
- Hourly (3-hour step) and 3-day forecasts
- Today / Tomorrow / Next 3 Days toggle to switch views

**Location-based forecasting**
- "Use current location" requests browser geolocation, reverse-geocodes it
  to a place name, and fetches its forecast
- Search-as-you-type city lookup (debounced, via OpenWeatherMap's geocoding
  API)
- Every location (current or searched) is saved and revisitable from the
  Locations page

**Weather alerts**
- Alerts are derived client-side from live conditions (high wind,
  thunderstorms, heavy rain, snow/freezing) and shown as an in-app banner
- Settings lets you opt in to real browser push notifications
  (`Notification` API) for these alerts

**Multiple locations**
- Locations page lists every saved location with a live mini-forecast,
  lets you switch the active one, and remove any (except "current location")

**Customization**
- Settings page toggles theme (dark/light)

**Privacy**
- No backend, no analytics, no third-party data collection — everything
  lives in the browser's `localStorage`. This is called out directly in
  Settings. Your API key stays in your local `.env` file and is never
  committed (see `.gitignore`).

## Project structure

```
src/
  api/            OpenWeatherMap fetch + geocoding helpers
  components/      Reusable UI: WeatherIcon, WeatherHero, StatsRow,
                    ForecastTabs, HourlyForecast, DailyForecast,
                    SearchBar, LocationCard, TopBar, AlertBanner,
                    ToggleSwitch, SegmentedControl, AppShell,
                    ApiKeySetupNotice, ...
  context/        AppContext (locations/theme/units/cache) and
                    ToastContext (in-app notifications)
  hooks/          useLocalStorage
  pages/          Home, Locations, Settings
  types/          Shared TypeScript types
  utils/          Weather-code -> condition mapping, alert derivation
```

Components are built to be reusable and prop-driven (e.g. `WeatherIcon`,
`SegmentedControl`, `LocationCard`, `SettingsRow`), and app-wide state
(locations, theme, units, weather cache) lives in `AppContext` so pages
and components share it via the `useApp()` hook rather than prop-drilling.

## Responsiveness

The app renders as a centered "phone" card that scales fluidly from 320px
up through desktop widths (tested at 320 / 480 / 768 / 1024 / 1200px), so
the same layout works standalone on mobile or embedded in a wider viewport.
