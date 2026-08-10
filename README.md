# Weather App

A weather app built with React, TypeScript, and Vite. Live weather data comes from the
[WeatherAPI](https://www.weatherapi.com/) API.

## Getting started

1. **Get a free API key**
   - Sign up at [weatherapi.com](https://www.weatherapi.com/)
   - Copy your key from the account dashboard

2. **Configure the app**

   Copy the example env file and paste in your key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   VITE_WEATHERAPI_KEY=your_key_here
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
- **lucide-react** — icon set for UI chrome (nav, stats, alerts)
- **WeatherAPI** — current conditions, multi-day forecast, and
  search/reverse lookup for saved locations and current geolocation
- **localStorage** — the sole data store (no backend), used for saved
  locations, active location, theme, units, and cached forecasts

## Which WeatherAPI endpoints are used

The app uses WeatherAPI's forecast and search endpoints:

- `GET /forecast.json` — current conditions plus multi-day forecast data
- `GET /search.json` — location search and reverse lookup by lat/lon

## How it meets the brief

**Real-time weather info**
- Current temperature, condition, wind speed, humidity, and rain chance
- Hourly and multi-day forecasts for the next 7 days

**Location-based forecasting**
- "Use current location" requests browser geolocation, reverse-geocodes it
  to a place name, and fetches its forecast
- Search-as-you-type city lookup (debounces, via WeatherAPI's search API)
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
  api/            WeatherAPI fetch + lookup helpers
  components/      Reusable UI: WeatherIcon, WeatherHero, StatsRow,
                     HourlyForecast, DailyForecast,
                    SearchBar, LocationCard, TopBar, AlertBanner,
                    , AppShell,
                    ApiKeySetupNotice, ...
  context/        AppContext (locations/theme/units/cache) and
                    ToastContext (in-app notifications)
  hooks/          useLocalStorage
  pages/          Home
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

## Author
Khaviso Vukeya
- **LinkedIn** — [Visit My LinkedIn](www.linkedin.com/in/khaviso-vukeya-81b0a9320)
- **Portfolio** — [Visit My Portfolio](https://khaviso-vukeya-portfolio.vercel.app/)
