# TeamZones — Implementation Plan

## Tech Stack
- Framework: Next.js 15 / App Router / TypeScript
- Styling: Tailwind CSS v4 + `@tailwindcss/typography`
- Database: None (localStorage only, v1)
- Auth: None (v1)
- APIs: Nominatim, Open-Meteo, Nager.Date, REST Countries (all free, no auth)
- Deployment: Vercel

---

## Project Setup

- Package manager: npm
- Init command: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias`
- Key dependencies:
  - `date-fns` — date formatting and manipulation
  - `date-fns-tz` — timezone-aware formatting
  - `lucide-react` — icons
  - `@next/font` — Google Fonts (DM Sans, Inter)
- No environment variables required (all APIs are public, no keys needed)
- `.env.example`: empty / commented placeholder only

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, metadata, ThemeProvider
│   ├── page.tsx                      # Landing page (/)
│   ├── pricing/
│   │   └── page.tsx                  # Pricing page (/pricing)
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard layout: nav sidebar/header
│   │   ├── page.tsx                  # Team Dashboard (/dashboard)
│   │   ├── overlap/
│   │   │   └── page.tsx              # Overlap Finder (/dashboard/overlap)
│   │   └── holidays/
│   │       └── page.tsx              # Holiday Calendar (/dashboard/holidays)
│   └── api/
│       ├── geocode/
│       │   └── route.ts              # GET /api/geocode?q= → Nominatim proxy
│       ├── weather/
│       │   └── route.ts              # GET /api/weather?lat=&lng= → Open-Meteo proxy
│       ├── holidays/
│       │   └── route.ts              # GET /api/holidays?country=&year= → Nager.Date proxy
│       └── country/
│           └── route.ts              # GET /api/country?code= → REST Countries proxy
├── components/
│   ├── ui/
│   │   ├── Button.tsx                # Primary/secondary/ghost variants
│   │   ├── Card.tsx                  # Surface card wrapper with border
│   │   ├── Input.tsx                 # Text input with label + error state
│   │   ├── Badge.tsx                 # Inline badge (holiday, status)
│   │   ├── Skeleton.tsx              # Skeleton loader block
│   │   └── Toast.tsx                 # Ephemeral toast notifications
│   └── features/
│       ├── MemberCard.tsx            # Team member card (clock, weather, holiday)
│       ├── AddMemberModal.tsx        # City search + name form modal
│       ├── EditMemberModal.tsx       # Edit member (name, city, working hours)
│       ├── WeatherIcon.tsx           # WMO code → SVG/emoji icon
│       ├── LiveClock.tsx             # Client-side clock with setInterval
│       ├── OverlapTimeline.tsx       # SVG/div horizontal timeline
│       ├── HolidayList.tsx           # 30-day holiday list grouped by date
│       ├── CountryFilter.tsx         # Dropdown filter for holiday page
│       └── UpgradeModal.tsx          # Free tier upgrade prompt
├── lib/
│   ├── api/
│   │   ├── geocode.ts                # fetch('/api/geocode?q=...')
│   │   ├── weather.ts                # fetch('/api/weather?lat=&lng=')
│   │   ├── holidays.ts               # fetch('/api/holidays?country=&year=')
│   │   └── country.ts                # fetch('/api/country?code=')
│   ├── cache.ts                      # Server-side in-memory Map<string, {data, expires}>
│   ├── storage.ts                    # localStorage read/write helpers for team members
│   ├── timezone.ts                   # IANA tz helpers (offsetLabel, isDuringWorkHours)
│   ├── weather-codes.ts              # WMO code → label + icon name mapping
│   └── overlap.ts                    # Compute working-hours overlap across members
└── types/
    └── index.ts                      # TeamMember, GeoResult, WeatherData, Holiday, Country
```

---

## Types (`src/types/index.ts`)

```ts
interface TeamMember {
  id: string;
  name: string;
  city: string;
  countryCode: string;       // "DE", "IN", etc.
  countryName: string;
  flagEmoji: string;         // "🇩🇪"
  timezone: string;          // IANA e.g. "Europe/Berlin"
  lat: number;
  lng: number;
  workStart: number;         // 9 (default), 0–23
  workEnd: number;           // 17 (default), 0–23
  addedAt: number;           // timestamp
}

interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  countryCode: string;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  cachedAt: number;
}

interface Holiday {
  date: string;              // "2025-10-03"
  name: string;              // "German Unity Day"
  localName: string;         // "Tag der Deutschen Einheit"
  countryCode: string;
  types: string[];           // ["Public"]
  global: boolean;
}

interface CountryData {
  code: string;
  name: string;
  flagEmoji: string;
  timezones: string[];
}
```

---

## Tailwind Config (`tailwind.config.ts`)

```ts
theme: {
  extend: {
    colors: {
      primary:   '#2563EB',
      bg:        '#F8FAFC',
      surface:   '#FFFFFF',
      border:    '#E2E8F0',
      'text-primary':   '#0F172A',
      'text-secondary': '#64748B',
      accent:    '#0EA5E9',
      success:   '#10B981',
      error:     '#EF4444',
      warning:   '#F59E0B',
    },
    fontFamily: {
      heading: ['DM Sans', 'sans-serif'],
      body:    ['Inter',   'sans-serif'],
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
    transitionDuration: {
      fast:   '150',
      normal: '250',
      slow:   '400',
    },
    transitionTimingFunction: {
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
    },
  },
}
```

---

## Pages & Routes

### 1. Landing Page `/` — `src/app/page.tsx`
- Hero: headline "See your remote team at a glance", subheadline, "Get Started Free" CTA → `/dashboard`
- Animated preview: static mockup card grid with 4 sample members (hardcoded, no API)
- Feature highlights: 3 cards (Live Clocks, Holiday Awareness, Overlap Finder)
- Social proof: "Works across 90+ countries"
- CTA repeat at bottom

### 2. Team Dashboard `/dashboard` — `src/app/dashboard/page.tsx`
- Client component; loads members from localStorage on mount
- Empty state: large "Add your first teammate" card with inline city search
- Loaded state: responsive card grid (2-col md, 3-col lg), sorted by UTC offset ascending
- Header: "Add Member" button, member count badge
- Free-tier gate: 4th add attempt opens `<UpgradeModal />`
- Each card uses `<MemberCard />` (see below)

### 3. Overlap Finder `/dashboard/overlap` — `src/app/dashboard/overlap/page.tsx`
- Client component; reads members from localStorage
- Date picker (native `<input type="date">`)
- `<OverlapTimeline />` — horizontal bar chart (24h UTC x-axis, one row per member)
- Summary strip: "Overlap: 14:00–16:00 UTC (2h)" with per-member local time conversion
- Copy-to-clipboard button for formatted summary text
- Members with holiday on selected date: row dimmed with holiday label
- Empty state: "Add team members to find meeting overlap"
- No overlap state: "No common working hours on [date]" with prev/next day buttons

### 4. Holiday Calendar `/dashboard/holidays` — `src/app/dashboard/holidays/page.tsx`
- Client component; reads members from localStorage
- `<CountryFilter />` dropdown (All / individual countries)
- `<HolidayList />` — 30-day outlook grouped by date
- Each entry: date, `flagEmoji countryName`, holiday name (English + local), affected member badges
- Expandable row: holiday type (Public / Bank / Optional), fixed vs movable
- Empty state: "No public holidays in the next 30 days. Smooth sailing!"
- Cached-data warning banner if data is stale

### 5. Pricing `/pricing` — `src/app/pricing/page.tsx`
- 3 pricing cards: Free ($0), Pro ($9/mo), Team ($24/mo)
- Feature matrix table
- "Get Started Free" → `/dashboard`
- FAQ accordion (3 questions)

---

## Components Inventory

### `<MemberCard member={TeamMember} weather={WeatherData|null} holidays={Holiday[]} onEdit onRemove>`
- Displays: name, city, `flagEmoji countryName`, `<LiveClock timezone />`, temperature + `<WeatherIcon code />`, next holiday badge
- Green dot if currently in working hours; gray dot otherwise
- Hover: shows Edit / Remove action buttons
- Loading skeleton while weather/holiday data fetches

### `<AddMemberModal onAdd onClose>`
- City search input: debounced 500ms → `GET /api/geocode?q=`
- Dropdown of up to 5 results
- Name input
- On submit: fires parallel weather + holiday + country fetches → builds `TeamMember` object → saves to localStorage
- Error states per API (see spec Section 8, Flow 1)
- "Manual entry" fallback link (shows country dropdown + timezone select)

### `<EditMemberModal member onSave onClose>`
- Edit name, city (same geocode flow), workStart/workEnd hours (0–23 number inputs)

### `<LiveClock timezone: string>`
- `'use client'` — uses `setInterval(1000)` to update time
- Formats: "3:42 PM" in member's local timezone using `date-fns-tz`

### `<WeatherIcon code: number size?: 'sm'|'md'>`
- Maps WMO codes to emoji or inline SVG icon (see `weather-codes.ts`)
- Unknown code → "—" with tooltip

### `<OverlapTimeline members={TeamMember[]} date: string holidays: Record<countryCode, Holiday[]>>`
- Pure div-based bar chart (no canvas)
- X-axis: 0–24 UTC hours (96 quarter-hour tick marks)
- Each row: member name, colored bar for workStart–workEnd in UTC space
- Green overlay: intersection of all non-holiday bars
- Holiday member rows: 50% opacity + holiday label
- Click on green overlay → triggers copy action
- Horizontal scroll on mobile

### `<HolidayList entries: HolidayEntry[] members: TeamMember[]>`
- `HolidayEntry = { date, holidays: Holiday[], affectedMembers: TeamMember[] }`

### `<UpgradeModal onClose>`
- "Upgrade to Pro" CTA → `/pricing`

### `<Skeleton width height className?>`
- Animated gray pulse block

---

## API Integration Plan

### Server cache (`src/lib/cache.ts`)
```ts
const cache = new Map<string, { data: unknown; expires: number }>();
function get<T>(key: string): T | null { ... }
function set(key: string, data: unknown, ttlMs: number): void { ... }
```

### `/api/geocode` — Nominatim proxy
- Method: `GET /api/geocode?q={city}`
- Upstream: `GET https://nominatim.openstreetmap.org/search?q={city}&format=json&limit=5&addressdetails=1`
- Required headers: `User-Agent: TeamZones/1.0 (contact@teamzones.app)`
- Rate limit: enforced via 500ms debounce client-side; server does NOT queue (single request per debounce)
- Cache: `geocode:{normalizedQ}` with TTL 30 days
- Response shape: `GeoResult[]` (pluck `lat`, `lon`, `display_name`, `address.country_code`)
- Error: return 503 with `{ error: "Location lookup unavailable" }`

### `/api/weather` — Open-Meteo proxy
- Method: `GET /api/weather?lat={lat}&lng={lng}`
- Upstream: `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true`
- Deduplication: round lat/lng to 2 decimal places for cache key
- Cache: `weather:{lat2}:{lng2}` with TTL 30 min
- Response shape: `{ temperature: number; weatherCode: number; cachedAt: number }`
- Error: return 503 with `{ error: "Weather unavailable" }`

### `/api/holidays` — Nager.Date proxy
- Method: `GET /api/holidays?country={code}&year={year}`
- Upstream: `GET https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}`
- Cache: `holidays:{code}:{year}` with TTL 24 hours
- Response shape: `Holiday[]`
- Error: return 503 with `{ error: "Holiday data unavailable" }`

### `/api/country` — REST Countries proxy
- Method: `GET /api/country?code={code}`
- Upstream: `GET https://restcountries.com/v3.1/alpha/{code}?fields=name,flags,cca2,timezones`
- Cache: `country:{code}` with TTL 7 days
- Response shape: `CountryData`
- Fallback (if upstream fails): return `{ code, name: code, flagEmoji: code, timezones: [] }`
  — this way the route never returns an error, guaranteeing country data never blocks card rendering

---

## Data Flow

### Adding a member
1. User types city → client debounces 500ms → `GET /api/geocode` → dropdown
2. User picks result → country code + lat/lng stored in form state
3. User types name → clicks Add
4. Client fires 3 parallel: `GET /api/weather`, `GET /api/holidays?year=current`, `GET /api/country`
5. All 3 resolve (or fail individually) → `TeamMember` object assembled → written to localStorage
6. Dashboard re-renders with new member card

### Dashboard load (warm)
1. `useEffect` on mount → read from `localStorage('teamzones-members')`
2. For each member: check if weather cache in localStorage is < 30 min old
3. Stale weather locations (unique lat/lng pairs): batch `GET /api/weather` requests
4. Holiday data: check localStorage cache per country per year (< 24h TTL)
5. Render cards with cached data immediately; update as fresh data arrives

### localStorage schema
```json
{
  "teamzones-members": "[{TeamMember}, ...]",
  "teamzones-weather": "{ '{lat2}:{lng2}': { temperature, weatherCode, cachedAt } }",
  "teamzones-holidays": "{ '{countryCode}:{year}': { data: Holiday[], cachedAt } }",
  "teamzones-countries": "{ '{countryCode}': { data: CountryData, cachedAt } }"
}
```

### Overlap computation (`src/lib/overlap.ts`)
- For each active member (no holiday on selected date), compute UTC hour range of workStart–workEnd
- Convert local workStart/workEnd to UTC using member's timezone offset on the selected date
- Intersection = max(allStarts), min(allEnds) → if max < min, no overlap
- Returns `{ startUtc: number; endUtc: number } | null`

---

## Build Order (step-by-step)

1. `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias`
2. `npm install date-fns date-fns-tz lucide-react`
3. Edit `tailwind.config.ts` — add design tokens (colors, fonts, radii, transitions)
4. Edit `src/app/layout.tsx` — import DM Sans + Inter via `next/font/google`, set metadata, `bg-bg font-body`
5. Create `src/types/index.ts` — all shared types
6. Create `src/lib/cache.ts` — server-side TTL cache
7. Create `src/lib/storage.ts` — localStorage helpers
8. Create `src/lib/timezone.ts` — `getUtcOffset(tz, date)`, `formatLocalTime(tz)`, `isInWorkingHours(member)`
9. Create `src/lib/weather-codes.ts` — WMO code map (label + icon name)
10. Create `src/lib/overlap.ts` — overlap computation
11. Create all 4 API routes: `geocode`, `weather`, `holidays`, `country`
12. Create UI components: `Button`, `Card`, `Input`, `Badge`, `Skeleton`, `Toast`
13. Create `<WeatherIcon />`, `<LiveClock />`
14. Create `<MemberCard />`
15. Create `<AddMemberModal />` (includes geocode search)
16. Create `<EditMemberModal />`
17. Create `<UpgradeModal />`
18. Build `/dashboard` page (grid, empty state, add button)
19. Build `src/app/dashboard/layout.tsx` — nav with links to /dashboard, /overlap, /holidays
20. Create `<OverlapTimeline />`
21. Build `/dashboard/overlap` page
22. Create `<HolidayList />`, `<CountryFilter />`
23. Build `/dashboard/holidays` page
24. Build `/` landing page (static, no API calls)
25. Build `/pricing` page (static)
26. Wire up all navigation links
27. `npm run build` — fix any TypeScript/ESLint errors
28. Smoke-check all 5 routes render

---

## Known Risks

- **Nominatim User-Agent requirement**: Must send a descriptive `User-Agent` header in the server proxy, or requests will be rejected/throttled. Client-side fetch would also expose the user's IP. The proxy handles both.
- **`date-fns-tz` IANA timezone resolution**: Nominatim returns lat/lng but not the IANA timezone string directly. Use the `Intl.DateTimeFormat().resolvedOptions().timeZone` trick or a lookup table. Alternatively, derive timezone from REST Countries `timezones` array (format: `"UTC+1:00"` — needs parsing). Best approach: use the `Intl` API on the client with a known IANA string; for initial add, use the first timezone from REST Countries and convert "UTC+5:30" → "Asia/Kolkata" via a static lookup. **Risk: REST Countries timezone strings are UTC-offset format, not IANA.** Mitigation: ship a static `countryToIANA` map for the ~30 most common countries; fall back to UTC offset label for the rest (display "UTC+5:30" instead of "Asia/Kolkata" if not in map).
- **Overlap page gated behind Pro in spec (Section 7)** but Section 10 says it ships in v1. Resolution: build and ship the overlap page for all users in v1 — the "upgrade" gate is only on adding a 4th member, not on features. The pricing page will describe Pro as offering the overlap finder; this is a marketing description, not an enforcement in v1.
- **No direct IANA tz from Nominatim**: Nominatim does not return timezone. REST Countries returns UTC offset strings. Use a static map of `countryCode → primary IANA tz` for the 50 most common countries (covers ~95% of use cases). Ship this as a constant in `src/lib/timezone.ts`.

---

## Plugin Usage Notes

- **Builder: Use `/feature-dev`** for `src/app/dashboard/page.tsx` (complex state: localStorage, multi-API parallel fetch, card grid), `src/app/dashboard/overlap/page.tsx` (timeline visualization, overlap math, holiday dimming), and `src/app/dashboard/holidays/page.tsx` (grouped list, filters, stale cache warning).
- **Builder: Use `/frontend-design`** for `src/components/ui/` with these design tokens: light mode, primary `#2563EB`, bg `#F8FAFC`, surface `#FFFFFF`, border `#E2E8F0`, fonts DM Sans (heading) + Inter (body), border-radius 4/8/12px scale. Aesthetic: calm professional, minimal, no gradients or shadows beyond `shadow-sm`.
- **QA: Run `silent-failure-hunter`** on `src/app/api/` (all 4 routes) and `src/lib/storage.ts` (localStorage can throw in private browsing).
- **QA: Run `code-reviewer`** on `src/lib/overlap.ts` and `src/components/features/OverlapTimeline.tsx` (complex logic, easy to get UTC conversion wrong).
- **Designer: Aesthetic direction** — light-first, minimal, calm professional. No dark backgrounds, no gradients on cards, no drop shadows beyond 1px. Color palette is cool/blue-slate. Cards should feel like a clean spreadsheet row, not a dark-mode dashboard widget.
