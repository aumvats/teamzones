# TeamZones

See your remote team at a glance — live clocks, weather, and public holidays in one dashboard.

## Features

- Real-time local clocks for every teammate
- Current weather conditions per location
- Public holiday awareness from 90+ countries
- Meeting overlap finder with holiday-aware scheduling
- 30-day holiday calendar outlook

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

No environment variables are required. All external APIs (Nominatim, Open-Meteo, Nager.Date, REST Countries) are free and keyless.

See `.env.example` for details.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- All data stored in localStorage (no database in v1)

## Spec

See [PROJECT-1773731234-SPEC.md](./PROJECT-1773731234-SPEC.md) for the full product specification.
