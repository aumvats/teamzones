import type { CountryData } from "@/types";

export async function fetchCountry(code: string): Promise<CountryData> {
  const res = await fetch(`/api/country?code=${code}`);
  if (!res.ok) throw new Error("Country data unavailable");
  return res.json();
}
