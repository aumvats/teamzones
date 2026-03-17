import { NextRequest, NextResponse } from "next/server";
import { get, set } from "@/lib/cache";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    country_code?: string;
  };
}

const TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length > 200) {
    return NextResponse.json({ error: "Missing or invalid query parameter" }, { status: 400 });
  }

  const cacheKey = `geocode:${q.toLowerCase().trim()}`;
  const cached = get<unknown[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TeamZones/1.0 (contact@teamzones.app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Location lookup unavailable" }, { status: 503 });
    }

    const data: NominatimResult[] = await res.json();
    const results = data.map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      countryCode: (item.address?.country_code ?? "").toUpperCase(),
    }));

    set(cacheKey, results, TTL);
    return NextResponse.json(results);
  } catch (err) {
    console.error("[geocode] Location lookup failed for query:", q, err);
    return NextResponse.json({ error: "Location lookup unavailable" }, { status: 503 });
  }
}
