import type { Condition } from "../utils/weatherCode";

interface Props {
  condition: Condition;
  isDay?: boolean;
  size?: number;
  className?: string;
}

export default function WeatherIcon({ condition, isDay = true, size = 64, className = "" }: Props) {
  const s = size;
  const cloudFill = "#F4F5F7";
  const cloudShadow = "#D8DAE0";
  const sun = "#FFB13C";
  const moon = "#FFCE6B";
  const rain = "#5AA9F0";
  const snow = "#EAF4FF";
  const bolt = "#FFC94D";

  const Cloud = ({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="34" cy="46" rx="27" ry="16" fill={cloudShadow} opacity="0.5" />
      <path
        d="M18 44c-7 0-12-5.5-12-12 0-6 4.5-11 10.5-11.8C18 13 25 8 33 8c9 0 16.5 6.4 18 15 6 1 10.5 6 10.5 12 0 6.6-5.4 12-12 12H18z"
        fill={cloudFill}
      />
    </g>
  );

  const Sparkles = () => (
    <g fill={sun}>
      <path d="M52 10l1.3 3.7L57 15l-3.7 1.3L52 20l-1.3-3.7L47 15l3.7-1.3z" opacity="0.9" />
      <circle cx="10" cy="18" r="1.6" opacity="0.8" />
      <circle cx="58" cy="30" r="1.3" opacity="0.7" />
    </g>
  );

  const renderContent = () => {
    switch (condition) {
      case "clear":
        return isDay ? (
          <>
            <circle cx="32" cy="30" r="16" fill={sun} />
            <g stroke={sun} strokeWidth="3" strokeLinecap="round">
              <line x1="32" y1="4" x2="32" y2="9" />
              <line x1="32" y1="51" x2="32" y2="56" />
              <line x1="4" y1="30" x2="9" y2="30" />
              <line x1="55" y1="30" x2="60" y2="30" />
              <line x1="12" y1="10" x2="15.5" y2="13.5" />
              <line x1="48.5" y1="46.5" x2="52" y2="50" />
              <line x1="12" y1="50" x2="15.5" y2="46.5" />
              <line x1="48.5" y1="13.5" x2="52" y2="10" />
            </g>
          </>
        ) : (
          <>
            <path
              d="M42 12a20 20 0 100 36 24 24 0 010-36z"
              fill={moon}
            />
            <Sparkles />
          </>
        );
      case "partly-cloudy":
        return (
          <>
            {isDay ? (
              <circle cx="42" cy="20" r="12" fill={sun} />
            ) : (
              <path d="M48 8a13 13 0 100 24 15.5 15.5 0 010-24z" fill={moon} />
            )}
            <Sparkles />
            <Cloud x={0} y={16} scale={0.95} />
          </>
        );
      case "cloudy":
        return (
          <>
            <Cloud x={-6} y={20} scale={0.7} />
            <Cloud x={6} y={8} scale={1} />
          </>
        );
      case "fog":
        return (
          <>
            <Cloud x={2} y={4} scale={0.95} />
            <g stroke={cloudShadow} strokeWidth="3.5" strokeLinecap="round">
              <line x1="6" y1="52" x2="58" y2="52" />
              <line x1="12" y1="59" x2="52" y2="59" />
            </g>
          </>
        );
      case "drizzle":
        return (
          <>
            <Cloud x={2} y={2} scale={0.95} />
            <g stroke={rain} strokeWidth="3" strokeLinecap="round">
              <line x1="22" y1="52" x2="19" y2="59" />
              <line x1="34" y1="52" x2="31" y2="59" />
              <line x1="46" y1="52" x2="43" y2="59" />
            </g>
          </>
        );
      case "rain":
        return (
          <>
            <Cloud x={2} y={0} scale={0.95} />
            <g stroke={rain} strokeWidth="3.5" strokeLinecap="round">
              <line x1="20" y1="50" x2="15" y2="60" />
              <line x1="34" y1="50" x2="29" y2="60" />
              <line x1="48" y1="50" x2="43" y2="60" />
            </g>
          </>
        );
      case "snow":
        return (
          <>
            <Cloud x={2} y={0} scale={0.95} />
            <g fill={snow}>
              <circle cx="20" cy="54" r="2.6" />
              <circle cx="34" cy="59" r="2.6" />
              <circle cx="48" cy="54" r="2.6" />
            </g>
          </>
        );
      case "thunder":
        return (
          <>
            <Cloud x={2} y={0} scale={0.95} />
            <path d="M32 46l-8 16h7l-4 12 15-19h-8l6-9z" fill={bolt} />
          </>
        );
      default:
        return <Cloud x={2} y={8} />;
    }
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {renderContent()}
    </svg>
  );
}
