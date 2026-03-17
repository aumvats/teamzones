import { NextRequest, NextResponse } from "next/server";
import { get, set } from "@/lib/cache";

const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  const year = request.nextUrl.searchParams.get("year");

  if (!country || !year) {
    return NextResponse.json({ error: "Missing country/year parameters" }, { status: 400 });
  }

  if (!/^[A-Z]{2}$/i.test(country)) {
    return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
  }

  const yearNum = parseInt(year, 10);
  if (!Number.isFinite(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const cacheKey = `holidays:${country.toUpperCase()}:${year}`;
  const cached = get<unknown[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country.toUpperCase()}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: "Holiday data unavailable" }, { status: 503 });
    }

    const data = await res.json();
    const holidays = data.map((h: Record<string, unknown>) => ({
      date: h.date,
      name: h.name,
      localName: h.localName,
      countryCode: (h.countryCode as string || "").toUpperCase(),
      types: h.types ?? [],
      global: h.global ?? true,
    }));

    set(cacheKey, holidays, TTL);
    return NextResponse.json(holidays);
  } catch (err) {
    // Nager.Date returns 204 for unsupported countries, causing res.json() to throw
    console.error("[holidays] Holiday fetch failed for", country, year, err);
    return NextResponse.json({ error: "Holiday data unavailable" }, { status: 503 });
  }
}
