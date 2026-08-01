export type ForecastTab = "today" | "tomorrow" | "next3";

interface Props {
  active: ForecastTab;
  onChange: (tab: ForecastTab) => void;
}

const tabs: { key: ForecastTab; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "next3", label: "Next 3 Days" },
];

export default function ForecastTabs({ active, onChange }: Props) {
  return (
    <div className="forecast-tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`forecast-tab ${active === t.key ? "active" : ""}`}
        >
          {t.label}
          {active === t.key && <span className="forecast-tab-indicator" />}
        </button>
      ))}
    </div>
  );
}
