import type { GeoResult } from "@/types";

export async function searchCity(query: string): Promise<GeoResult[]> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Location lookup unavailable");
  return res.json();
}
