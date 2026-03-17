import { NextRequest, NextResponse } from "next/server";
import { get, set } from "@/lib/cache";

const TTL = 30 * 60 * 1000; // 30 min

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng parameters" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return NextResponse.json({ error: "Invalid lat/lng parameters" }, { status: 400 });
  }

  const lat2 = latNum.toFixed(2);
  const lng2 = lngNum.toFixed(2);
  const cacheKey = `weather:${lat2}:${lng2}`;

  const cached = get<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat2}&longitude=${lng2}&current_weather=true`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: "Weather unavailable" }, { status: 503 });
    }

    const data = await res.json();
    const result = {
      temperature: data.current_weather?.temperature ?? 0,
      weatherCode: data.current_weather?.weathercode ?? 0,
      cachedAt: Date.now(),
    };

    set(cacheKey, result, TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[weather] Weather fetch failed for lat:", lat2, "lng:", lng2, err);
    return NextResponse.json({ error: "Weather unavailable" }, { status: 503 });
  }
}
