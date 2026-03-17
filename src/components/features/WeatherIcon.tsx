import { getWeatherInfo } from "@/lib/weather-codes";

interface WeatherIconProps {
  code: number;
  size?: "sm" | "md";
}

export default function WeatherIcon({ code, size = "md" }: WeatherIconProps) {
  const info = getWeatherInfo(code);
  const sizeClass = size === "sm" ? "text-base" : "text-xl";

  return (
    <span className={sizeClass} title={info.label} role="img" aria-label={info.label}>
      {info.icon}
    </span>
  );
}
