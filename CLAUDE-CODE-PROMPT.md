# Build Constraints — TeamZones

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React state (useState/useContext) — no external state library needed

## Design System

```
Colors:
  primary:        #2563EB
  bg:             #F8FAFC
  surface:        #FFFFFF
  border:         #E2E8F0
  text-primary:   #0F172A
  text-secondary: #64748B
  accent:         #0EA5E9
  success:        #10B981
  error:          #EF4444
  warning:        #F59E0B

Typography:
  heading-font:   DM Sans
  body-font:      Inter
  h1: 36px, weight 700
  h2: 28px, weight 600
  h3: 20px, weight 600
  body: 16px, line-height 1.5

Spacing:
  base-unit: 4px
  scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

Border Radius:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px

Animation:
  fast:   150ms ease-out
  normal: 250ms ease-out
  slow:   400ms ease-in-out

Mode: light
```

## API Integrations

### Nominatim (Geocoding)
- Base URL: `https://nominatim.openstreetmap.org`
- Auth: None
- Rate limit: 1 req/sec — debounce input 500ms, server-side queue with 1s spacing
- Endpoint: `GET /search?q={city}&format=json&limit=5&addressdetails=1`
- Cache: 30-day TTL by normalized city name

### Open-Meteo (Weather)
- Base URL: `https://api.open-meteo.com/v1`
- Auth: None
- Rate limit: Unlimited (fair use) — deduplicate by rounding lat/lng to 2 decimal places
- Endpoint: `GET /forecast?latitude={lat}&longitude={lng}&current_weather=true`
- Cache: 30-minute TTL per unique location

### Nager.Date (Public Holidays)
- Base URL: `https://date.nager.at/api/v3`
- Auth: None
- Rate limit: Unlimited
- Endpoint: `GET /PublicHolidays/{year}/{countryCode}`
- Cache: 24-hour TTL per country per year

### REST Countries
- Base URL: `https://restcountries.com/v3.1`
- Auth: None
- Rate limit: Unlimited
- Endpoint: `GET /alpha/{countryCode}`
- Cache: 7-day TTL (data is effectively static)

## Build Rules
- `npm run build` MUST pass before you consider any agent done
- No placeholder content (lorem ipsum, "coming soon", fake data)
- No external images unless from a free CDN — use SVG icons or Unicode emoji for flags/weather
- Error states must be visible in the UI, not just console.log
- Mobile-responsive by default (cards stack vertically, timeline scrolls horizontally)
- All external API calls must go through Next.js API routes (`/api/*`) — never call external APIs directly from the client
- Map WMO weather codes to appropriate SVG weather icons (clear, cloudy, rain, snow, etc.)
- Live clocks must update every second using client-side setInterval with IANA timezone strings
- Proxy all API calls through server-side routes with in-memory caching (Map with TTL)

## v1 Scope Boundary
- Landing page with hero, feature highlights, and "Get Started Free" CTA
- Team dashboard with member cards: display name, city, country flag, live clock, temperature + weather icon, next holiday badge
- Add / edit / remove team members
- City search with debounced autocomplete via Nominatim
- Real-time clock display per timezone (client-side, updates every second)
- Current weather display (temperature + WMO weather code mapped to icon)
- Next upcoming holiday badge per country on each card
- Working hours overlap finder with date picker and holiday-aware dimming
- 30-day holiday calendar view grouped by date with country filters
- Copy meeting time summary to clipboard
- localStorage persistence for all team data
- Pricing page with Free / Pro / Team tiers
- Mobile responsive (cards stack vertically, timeline scrolls horizontally)
- All API calls proxied through Next.js API routes with server-side caching
