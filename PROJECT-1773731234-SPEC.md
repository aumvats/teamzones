# PROJECT-1773731234 — TeamZones

> See your remote team at a glance.

---

## Section 1 — Product Overview

**TeamZones** is a real-time dashboard for remote and distributed teams that displays every teammate's current local time, live weather conditions, and upcoming public holidays in a single glanceable view. Built for founders, team leads, and project managers juggling collaborators across timezones, it eliminates the daily friction of "what time is it there?" and "is anyone off today?" — questions that currently require checking World Time Buddy for timezones, a holiday calendar site for each country, and a weather app for small-talk context. Unlike basic timezone converters (World Time Buddy, Every Time Zone), TeamZones combines holiday awareness from 90+ countries with ambient weather context and an intelligent meeting-overlap finder that accounts for holidays. The result: timezone chaos becomes at-a-glance team awareness in under 30 seconds, with zero signup required to start.

---

## Section 2 — Target Personas

### Persona 1: Remote Startup Founder
- **Role:** Solo or co-founder of a seed-stage startup with 5–15 contractors across 3–5 timezones
- **Core pain:** "I just scheduled a standup during a French public holiday. Again. And my contractor in Hyderabad was asleep when I sent the 'urgent' Slack message at his 2 AM."
- **Price sensitivity:** Already pays for Slack ($7.25/user/mo), Notion ($10/user/mo), and Calendly ($10/mo). Would pay $9/mo for a tool that prevents one scheduling screwup per month.
- **First "aha" moment:** Adding 3 teammates and seeing their live clocks, weather icons, and a "Holiday tomorrow: Bastille Day" badge appear on a single dashboard — all within 20 seconds of landing.

### Persona 2: Project Manager at a Remote Agency
- **Role:** PM managing 10–20 freelancers and contractors across 6+ countries for client projects
- **Core pain:** "I spend 15 minutes every Monday morning figuring out who's available this week, which countries have holidays, and what the feasible meeting windows are. I keep a spreadsheet that's always out of date."
- **Price sensitivity:** Agency pays for Harvest ($11/user/mo), Basecamp ($99/mo flat), Asana ($10.99/user/mo). A $24/mo team tool is within discretionary budget and pays for itself in reclaimed PM time.
- **First "aha" moment:** Clicking "Find Overlap" and seeing a visual timeline showing exactly when all team members are simultaneously in working hours, with holidays automatically grayed out.

### Persona 3: Freelance Consultant with International Clients
- **Role:** Independent consultant serving 5–8 clients across Europe, Asia, and North America
- **Core pain:** "I keep forgetting it's Golden Week in Japan and my client won't reply for a week. I need one place that shows all my contact timezones and their upcoming holidays so I can plan outreach around them."
- **Price sensitivity:** Runs lean, $50–200/mo total on tools (Calendly, FreshBooks, Zoom). Would pay $9/mo for a tool that prevents embarrassing scheduling mistakes and lost billable days.
- **First "aha" moment:** Seeing the holiday calendar surface "3 of your contacts have holidays next week" when planning Monday outreach.

---

## Section 3 — API Integrations

### 3.1 Nominatim (OpenStreetMap Geocoding)
- **Base URL:** `https://nominatim.openstreetmap.org`
- **Auth:** None
- **Rate limit:** 1 request/second (enforced by User-Agent policy)
- **What it provides:** Forward geocoding — converts a city name string into latitude, longitude, country code, and display name.
- **How TeamZones uses it:** When a user types "São Paulo" into the add-member form, the app debounces input by 500ms, then sends `GET /search?q=São+Paulo&format=json&limit=5&addressdetails=1`. The returned `lat=-23.55`, `lon=-46.63`, `address.country_code=BR` triggers downstream calls: country code feeds into Nager.Date and REST Countries lookups; lat/lng feeds into Open-Meteo weather. Results are cached in localStorage keyed by normalized city name, so repeat lookups never hit the API.
- **Failure mode:** If Nominatim times out or returns empty, the UI shows "Location lookup unavailable — try again in a moment" with a retry button. A secondary fallback allows manual entry of country + timezone offset so the user isn't blocked.

### 3.2 Open-Meteo (Weather Forecast)
- **Base URL:** `https://api.open-meteo.com/v1`
- **Auth:** None
- **Rate limit:** Unlimited (fair use — no hard cap)
- **What it provides:** Current weather conditions for a given latitude/longitude: temperature (°C/°F), wind speed, WMO weather code (clear, cloudy, rain, snow, etc.).
- **How TeamZones uses it:** For each team member's location, the app calls `GET /forecast?latitude={lat}&longitude={lng}&current_weather=true`. The returned `temperature` and `weathercode` are displayed as a temperature label and mapped weather icon (e.g., WMO code 61 → rain icon) on the member's card. Weather provides ambient "human" context — seeing it's 2°C and snowing in Helsinki reminds you your teammate is having a rough commute day. Locations are deduplicated: if 3 members are in Berlin, one API call serves all 3. Weather is refreshed every 30 minutes per unique location, skipped when the browser tab is inactive.
- **Failure mode:** If Open-Meteo is unreachable, the weather icon shows as a gray "—" with tooltip "Weather unavailable." The card remains fully functional — time and holidays are the core value; weather is enrichment. Cached weather (up to 30 min old) is shown with a "(cached)" label if a refresh fails.

### 3.3 Nager.Date (Public Holidays)
- **Base URL:** `https://date.nager.at/api/v3`
- **Auth:** None
- **Rate limit:** Not specified (effectively unlimited)
- **What it provides:** Public holidays by country code and year, including date, local-language name, English name, holiday type (public, bank, optional), and whether it's a fixed or movable date.
- **How TeamZones uses it:** On adding a team member, the app calls `GET /PublicHolidays/{year}/{countryCode}` to fetch the full year of holidays for that country. The dashboard displays the next upcoming holiday as a badge on each member's card (e.g., "Oct 3 — German Unity Day"). The dedicated Holidays tab shows a chronological 30-day outlook grouped by date, with country flags and affected team member names. The overlap finder dims members who have a holiday on the selected date. Holiday data is cached per country per year with a 24-hour refresh cycle.
- **Failure mode:** If Nager.Date is unreachable, the app falls back to cached data (last successful fetch) and shows "Holiday data from [date] — refresh pending." If no cache exists (first-ever fetch fails), the holiday badge shows "Holidays unavailable" and the Holidays tab displays an empty state with retry button.

### 3.4 REST Countries
- **Base URL:** `https://restcountries.com/v3.1`
- **Auth:** None
- **Rate limit:** Not specified (effectively unlimited)
- **What it provides:** Country metadata: official name, flag (SVG URL and Unicode emoji), timezone list, capital city, currency, spoken languages, region, and subregion.
- **How TeamZones uses it:** On adding a team member, the app calls `GET /alpha/{countryCode}` to fetch the country's flag emoji (displayed on the member card), official name (used in the Holidays tab), and timezone list (used to validate/cross-reference the timezone derived from Nominatim coordinates). Country data is static — cached indefinitely after first fetch.
- **Failure mode:** If REST Countries is unreachable, the flag displays as the two-letter country code text (e.g., "DE" instead of the German flag). Timezone falls back to the UTC offset computed from Nominatim's longitude. Country name falls back to the country code. No functionality is lost.

### API Economics (per Rule: free-api-economics-check)

| Tier | Members | API Calls/Month | Cost |
|------|---------|----------------|------|
| Free (3 members) | 3 | ~2,400 weather + ~90 holidays + ~3 geocode (one-time) = ~2,500 | $0 |
| Pro (25 members) | 25 | ~12,000 weather (deduplicated by location) + ~450 holidays + ~25 geocode (one-time) = ~12,500 | $0 |
| 100 Pro users (server-cached) | 2,500 total members | ~40,000 weather/mo (deduplicated + server-cached across users) + ~4,500 holidays + ~250 geocode = ~45,000 | $0 |

All APIs are free with no auth. Weather calls are the dominant cost, mitigated by location deduplication and 30-min server-side caching. At 1,000 paying users, estimated ~150,000 Open-Meteo calls/month — well within fair use given server-side deduplication. No paid API tier is ever required.

---

## Section 4 — Core User Flows

### Onboarding Flow (3 steps to value)
1. **User clicks "Get Started Free"** on landing page → redirected to `/dashboard` with empty state.
2. **User types a city name and teammate name** → system geocodes the city, fetches weather + holidays + country data in parallel, creates a member card.
3. **User sees the live dashboard** — teammate's clock ticking in real time, current weather, country flag, and next holiday badge. Value delivered in under 30 seconds.

### Flow 1: Daily Team Check
1. **User opens `/dashboard`** → system loads team members from localStorage, refreshes stale weather data.
2. **User scans the card grid** — each card shows: name, city, country flag, live clock (updating every second), temperature + weather icon, and next holiday badge.
3. **User notices a holiday badge** → "Diwali tomorrow" on their India-based teammate → decides to send the brief today instead of tomorrow.
4. **System does:** Renders cards sorted by current local time (earliest timezone first). Highlights members currently in working hours (green dot) vs. outside working hours (gray dot).

### Flow 2: Schedule a Cross-Timezone Meeting
1. **User clicks "Find Overlap"** → navigates to `/dashboard/overlap`.
2. **User sees a horizontal timeline** — each row is a team member, colored bar represents their working hours (default 9 AM–5 PM local), green overlay shows hours where all members overlap.
3. **User selects a specific date** → system checks holidays for that date, dims members who are off, recalculates overlap.
4. **User identifies a 2-hour window** → clicks it to copy a formatted summary to clipboard ("Available window: Tue Mar 24, 14:00–16:00 UTC / 10:00–12:00 New York / 15:00–17:00 Berlin / 19:30–21:30 Mumbai").

---

## Section 5 — Design System

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

Design rationale: Light mode with a calm professional blue primary matches the audience — team managers and founders working during daytime hours. The muted cool palette (slate grays, sky blue accent) conveys organization and trust without the "developer tool" aesthetic of dark themes. DM Sans headings feel modern and authoritative; Inter body text maximizes screen readability for dense dashboard data.

---

## Section 6 — Routes

| Path | Page Name | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | Landing Page | No | Hero section with animated globe, value proposition, feature highlights, CTA to dashboard |
| `/dashboard` | Team Dashboard | No (localStorage) | Main view: grid of team member cards showing live time, weather, flag, next holiday. Add/edit/remove members. |
| `/dashboard/overlap` | Overlap Finder | No (localStorage) | Horizontal timeline visualization of working hours overlap. Date picker with holiday-aware dimming. |
| `/dashboard/holidays` | Holiday Calendar | No (localStorage) | 30-day outlook of upcoming public holidays across all team members' countries, grouped by date. |
| `/pricing` | Pricing | No | Three-tier comparison (Free / Pro / Team) with feature matrix and FAQ. |

Note: No auth in v1. All user data persists in localStorage. Auth (Supabase) is a v2 feature for cloud sync and shared dashboards.

---

## Section 7 — Pricing

### Free — $0/month
- Up to 3 team members
- Live timezone clocks
- Current weather display
- Next-holiday badge per member
- localStorage persistence
- **Who it's for:** Solo founders or freelancers testing the tool with a small team.
- **Upgrade trigger:** User attempts to add a 4th team member → modal appears: "Upgrade to Pro for unlimited team members and the meeting overlap finder."

### Pro — $9/month
- Up to 25 team members
- Everything in Free, plus:
- Meeting overlap finder with date picker
- Full 30-day holiday calendar view
- Custom working hours per member (override 9–5 default)
- Copy meeting time to clipboard in multiple timezone formats
- **Who it's for:** Remote startup founders and freelance consultants managing a distributed team.

### Team — $24/month
- Unlimited team members
- Everything in Pro, plus:
- Multiple team groups (e.g., "Engineering," "Design," "Clients")
- Shareable read-only dashboard link (no login required for viewers)
- Export holiday calendar as ICS file
- Priority weather refresh (15-minute interval vs. 30-minute)
- **Who it's for:** Agency PMs and team leads who need to share team awareness across the organization.

---

## Section 8 — Key User Flows (Detailed)

### Flow 1: First Visit and Onboarding

1. **User visits `/`** → sees hero: "See your remote team at a glance" with an animated preview of the dashboard showing 4 sample team members.
2. **User clicks "Get Started Free"** → redirected to `/dashboard` → empty state displays a prominent card: "Add your first teammate" with a city search input and name field.
3. **User types "Berlin" into the city field** → system debounces 500ms → sends request to `/api/geocode?q=Berlin` → Nominatim returns top 5 results → dropdown shows "Berlin, Germany" as first suggestion.
   - *Error: Nominatim timeout (>3s)* → input shows "Location lookup is slow — try again?" with a retry icon. A "Manual entry" link appears allowing direct country + timezone selection.
   - *Error: No results* → "No location found for 'Berlni'. Check spelling or try a nearby city."
4. **User selects "Berlin, Germany"** → country code `DE` and coordinates auto-fill. **User types "Sarah" as display name** → clicks "Add."
5. **System fires 3 parallel requests:** `/api/weather?lat=52.52&lng=13.41` (Open-Meteo), `/api/holidays?country=DE` (Nager.Date), `/api/country?code=DE` (REST Countries). Loading skeleton appears for 200–400ms.
   - *Error: Open-Meteo fails* → card renders with gray "—" for weather, tooltip "Weather unavailable." All other data renders normally.
   - *Error: Nager.Date fails* → holiday badge shows "Holidays loading…" with auto-retry in 30s. Card is otherwise complete.
6. **Card appears:** "Sarah — Berlin, Germany 🇩🇪 | 3:42 PM | 12°C ☁️ | Next holiday: Oct 3 — German Unity Day." Clock ticks live. User has received value in under 30 seconds.

### Flow 2: Finding Meeting Overlap

1. **User has 4+ team members** across different timezones. Clicks "Find Overlap" in the dashboard nav → navigates to `/dashboard/overlap`.
2. **System renders a horizontal timeline:** each row = one team member. Colored bar = their working hours (default 9:00 AM–5:00 PM local). The x-axis is a 24-hour UTC timeline. A green overlay highlights the window(s) where all bars overlap.
3. **Summary bar at top shows:** "Overlap: 14:00–16:00 UTC (2 hours)" with conversion to each member's local time.
4. **User clicks a date picker** to check Wednesday → system fetches holidays for that date across all countries → if Sarah in Berlin has a holiday, her row is dimmed and labeled "Holiday: German Unity Day." Overlap recalculates excluding her.
   - *Error: No overlap on selected date* → "No common working hours on Oct 3. 2 members have holidays. Try a different day." with forward/back day arrows.
   - *Error: Only 1 member available* → "Only 1 team member is working on this date. Consider async communication."
5. **User adjusts working hours:** clicks on a member's bar to edit their hours (e.g., changes Mumbai teammate to 10:00 AM–6:00 PM). Overlap recalculates in real time.
6. **User clicks the overlap zone** → copies a formatted time block to clipboard: "Available: Wed Mar 25 | 14:00–16:00 UTC | 10:00–12:00 New York | 15:00–17:00 Berlin | 19:30–21:30 Mumbai."

### Flow 3: Reviewing the Holiday Calendar

1. **User clicks "Holidays" in the dashboard nav** → navigates to `/dashboard/holidays`.
2. **System displays a 30-day calendar outlook:** each row = one date with holidays, grouped chronologically. Each entry shows: date, country flag, holiday name (in English + local language), and badges for affected team members.
3. **Example row:** "Mar 21 — 🇮🇳 India: Holi (होली) — affects: Priya, Ravi"
4. **User clicks a country filter dropdown** → can narrow the view to a single country or view all.
   - *Error: Nager.Date unavailable* → "Showing cached holiday data from [Mar 16]. Refresh pending." Cached data is displayed normally.
   - *Error: No holidays in next 30 days* → "No public holidays in the next 30 days for your team. Smooth sailing!"
5. **User expands a holiday entry** → sees additional details: whether the holiday is a full public day off or an optional/bank holiday, and whether it's a fixed date or movable.
6. **User notices 3 holidays next week** → goes back to the overlap finder to plan meetings around them.

---

## Section 9 — Technical Constraints

### Performance Targets
- Landing page LCP: < 1.5s
- Dashboard initial load (cold, 10 members): < 2.0s
- Dashboard initial load (warm, cached data): < 500ms
- Add-member interaction (geocode + weather + holidays): < 1.5s
- Clock tick updates: every 1,000ms, pure client-side `setInterval` (zero API calls)
- Weather refresh cycle: every 30 minutes per unique location (Pro users: 15 min on Team tier)

### Data Handling
- **Client-side:** Live clock rendering (computed from IANA timezone string), UI state management, localStorage read/write, card grid layout and animations.
- **Server-side (Next.js API routes):** All external API calls proxied through `/api/*` routes. Server handles caching (in-memory Map with TTL), rate-limit throttling for Nominatim, and location deduplication for Open-Meteo.
- **No sensitive data:** No user credentials in v1. No PII beyond display names stored in localStorage. No server-side database.

### Rate Limit Strategy
| API | Limit | Strategy |
|-----|-------|----------|
| Nominatim | 1 req/sec | Debounce city input by 500ms. Server-side queue with 1s spacing. Cache results by normalized city name for 30 days. |
| Open-Meteo | Fair use | Deduplicate locations by rounding lat/lng to 2 decimal places. Server-side cache with 30-min TTL. Skip refresh if browser tab is inactive (Page Visibility API). |
| Nager.Date | Unlimited | Fetch full year of holidays per country on first request. Server-side cache with 24-hour TTL. |
| REST Countries | Unlimited | Fetch once per country code. Cache indefinitely (7-day TTL for safety). |

### Persistence
- **v1:** localStorage only. Team members stored as a JSON array. Maximum practical storage: ~50 members before localStorage size becomes a concern (~5KB per member).
- **v2:** Supabase PostgreSQL for cloud persistence, user auth, and shared dashboard state.

---

## Section 10 — v1 vs v2 Scope

### v1 — Ships Now
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

### v2 — Deferred Until Validation
- Supabase authentication (email + magic link) and cloud persistence
- Shareable read-only dashboard link (Team tier)
- Multiple team groups within one account
- Email notifications for upcoming holidays (daily digest)
- Custom working hours per member (saved to cloud)
- Export holiday calendar as .ics file for Google Calendar / Outlook
- Browser extension for quick timezone peek from any tab
- Dark mode toggle
- Working hours heatmap showing historical meeting availability
- Slack webhook integration for holiday reminders

### Boundary Statement
**v1 ships when:** The dashboard displays team members with accurate live time, weather, and holidays. The overlap finder correctly calculates working-hours intersection with holiday awareness. The app is mobile responsive. `npm run build` passes with zero errors.

**v2 begins when:** 50 users have created dashboards with 3+ team members and used the overlap finder at least once, validating that the core mechanic delivers value worth paying for.
