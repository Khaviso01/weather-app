import { Wind, Droplets, CloudRain } from "lucide-react";

interface Props {
  windSpeed: number;
  humidity: number;
  rainChance: number;
}

export default function StatsRow({ windSpeed, humidity, rainChance }: Props) {
  const stats = [
    { icon: Wind, value: `${windSpeed} m/s`, label: "Wind" },
    { icon: Droplets, value: `${humidity}%`, label: "Humidity" },
    { icon: CloudRain, value: `${rainChance}%`, label: "Rain" },
  ];

  return (
    <div className="stats-row">
      {stats.map(({ icon: Icon, value, label }, i) => (
        <div key={label} className={`stats-cell ${i !== 0 ? "with-border" : ""}`}>
          <Icon size={18} className="stats-icon" />
          <span className="stats-value">{value}</span>
          <span className="stats-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
