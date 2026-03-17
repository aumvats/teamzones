import { NextRequest, NextResponse } from "next/server";
import { get, set } from "@/lib/cache";

const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code || !/^[A-Z]{2}$/i.test(code)) {
    return NextResponse.json({ error: "Missing or invalid code parameter" }, { status: 400 });
  }

  const upper = code.toUpperCase();
  const cacheKey = `country:${upper}`;
  const cached = get<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://restcountries.com/v3.1/alpha/${upper}?fields=name,flags,cca2,timezones`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error("[country] REST Countries returned", res.status, "for code:", upper);
      const fallback = { code: upper, name: upper, flagEmoji: upper, timezones: [] };
      return NextResponse.json(fallback);
    }

    const data = await res.json();
    // Convert country code to flag emoji (regional indicator symbols)
    const flagEmoji = upper
      .split("")
      .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
      .join("");

    const result = {
      code: upper,
      name: data.name?.common ?? upper,
      flagEmoji,
      timezones: data.timezones ?? [],
    };

    set(cacheKey, result, TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[country] Failed to fetch country data for code:", upper, err);
    const fallback = { code: upper, name: upper, flagEmoji: upper, timezones: [] };
    return NextResponse.json(fallback);
  }
}
