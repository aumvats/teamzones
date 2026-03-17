import type { Holiday } from "@/types";

export async function fetchHolidays(countryCode: string, year: number): Promise<Holiday[]> {
  const res = await fetch(`/api/holidays?country=${countryCode}&year=${year}`);
  if (!res.ok) throw new Error("Holiday data unavailable");
  return res.json();
}
