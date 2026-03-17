# Builder Agent Notes

## Build Status
- npm run build: PASS
- Pages built: `/` (Landing), `/dashboard` (Team Dashboard), `/dashboard/overlap` (Overlap Finder), `/dashboard/holidays` (Holiday Calendar), `/pricing` (Pricing)
- API routes built: `/api/geocode`, `/api/weather`, `/api/holidays`, `/api/country`
- Core feature working: YES — full add/edit/remove members, live clocks, weather display, holiday badges, overlap finder, holiday calendar

## Architecture Summary
- Next.js 16 / App Router / TypeScript / Tailwind CSS v4
- Design tokens configured via `@theme inline` in `globals.css`
- Fonts: DM Sans (headings) + Inter (body) via `next/font/google`
- All external API calls proxied through `/api/*` routes with server-side in-memory TTL cache
- Client-side data in localStorage with TTL-aware caching for weather (30min), holidays (24h), countries (indefinite)
- Live clocks: client-side `setInterval(1000)` per timezone
- WMO weather codes mapped to emoji icons in `weather-codes.ts`
- IANA timezone resolution via static `countryCode → timezone` map for 50+ countries, with UTC offset fallback
- Overlap computation handles midnight-wrapping working hours via 15-min slot scanning

## Deferred / Skipped
- Auth (Supabase) — v2 per spec
- Cloud persistence — v2 per spec
- Multiple team groups — v2 per spec
- Shareable dashboard links — v2 per spec
- ICS export — v2 per spec
- Dark mode — v2 per spec
- Slack integration — v2 per spec
- Email notifications — v2 per spec

## Known Issues
- Nominatim does not return IANA timezone directly. The app uses a static `countryCode → IANA timezone` map for ~50 countries. Countries not in the map fall back to UTC offset from REST Countries, which may show as "Etc/GMT-X" instead of the city-specific timezone name.
- Free tier gate is client-side only (localStorage). No server enforcement in v1.
- UpgradeModal uses `absolute` positioning which may not layer correctly if nested deeply — works fine in current layout.

## API Status
- Nominatim (Geocoding): Working — proxied with User-Agent header, 30-day cache
- Open-Meteo (Weather): Working — deduplicated by lat/lng rounded to 2 decimals, 30-min cache
- Nager.Date (Holidays): Working — full year fetched per country, 24h cache
- REST Countries: Working — 7-day cache, never returns error (fallback to country code)
