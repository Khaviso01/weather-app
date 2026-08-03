import { useEffect, useState } from "react";
import { Bell, ShieldCheck, Trash2, Moon, Sun } from "lucide-react";
import { useApp } from "../context/AppContext";
import SegmentedControl from "../components/SegmentedControl";
import ToggleSwitch from "../components/ToggleSwitch";
import { useToast } from "../context/ToastContext";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="settings-section">
      <h2 className="settings-section-title">{title}</h2>
      <div className="settings-section-card">{children}</div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  control,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-main">
        <div className="settings-row-icon">{icon}</div>
        <div className="settings-row-copy">
          <span className="settings-row-title">{label}</span>
          {description && <span className="settings-row-description">{description}</span>}
        </div>
      </div>
      <div className="settings-row-control">{control}</div>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, unit, setUnit, locations, apiKey, setApiKey } = useApp();
  const { showToast } = useToast();
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with the browser's live Notification permission on mount
    setNotifPermission(Notification.permission);
  }, []);

  async function toggleNotifications(next: boolean) {
    if (typeof Notification === "undefined") {
      showToast("Notifications aren't supported in this browser", "error");
      return;
    }
    if (next) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === "granted") {
        showToast("Severe weather alerts enabled", "success");
        new Notification("Weather alerts enabled", {
          body: "We'll notify you about severe weather in your saved locations.",
        });
      } else {
        showToast("Notification permission was not granted", "info");
      }
    } else {
      showToast("Notifications can be disabled in your browser settings", "info");
    }
  }

  function clearCache() {
    localStorage.removeItem("weather:cache");
    showToast("Cached weather data cleared", "success");
  }

  return (
    <div className="settings-page">
      <div>
        <h1 className="settings-page-title">Settings</h1>
        <p className="settings-page-subtitle">Customize your weather experience.</p>
      </div>

      <SettingsSection title="Appearance">
        <SettingsRow
          icon={theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          label="Theme"
          description="Switch between light and dark mode"
          control={
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              options={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Units">
        <SettingsRow
          icon={<span className="text-xs font-bold">°</span>}
          label="Temperature"
          description="Celsius or Fahrenheit"
          control={
            <SegmentedControl
              value={unit}
              onChange={setUnit}
              options={[
                { value: "C", label: "°C" },
                { value: "F", label: "°F" },
              ]}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Alerts">
        <SettingsRow
          icon={<Bell size={16} />}
          label="Severe weather alerts"
          description="Get notified about extreme conditions"
          control={
            <ToggleSwitch
              checked={notifPermission === "granted"}
              onChange={toggleNotifications}
              label="Severe weather alerts"
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsRow
          icon={<Bell size={16} />}
          label="WeatherAPI Key"
          description="Enter a valid WeatherAPI key so live search and weather data work in this browser."
          control={
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your WeatherAPI key"
              className="settings-api-input"
            />
          }
        />
        <SettingsRow
          icon={<Trash2 size={16} />}
          label="Clear cached forecasts"
          description={`${locations.length} location${locations.length === 1 ? "" : "s"} cached for offline use`}
          control={
            <button onClick={clearCache} className="settings-clear-button">
              Clear
            </button>
          }
        />
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingsRow
          icon={<ShieldCheck size={16} />}
          label="Your data stays on this device"
          description="Locations and preferences are stored locally, never on a server."
          control={null}
        />
      </SettingsSection>
    </div>
  );
}
