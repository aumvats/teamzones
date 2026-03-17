import type { WeatherData } from "@/types";

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error("Weather unavailable");
  return res.json();
}
