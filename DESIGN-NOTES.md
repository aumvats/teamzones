# Design Notes — TeamZones

## Design System Applied
- Color tokens: ✅ all 10 colors match spec exactly (#2563EB, #F8FAFC, #FFFFFF, #E2E8F0, #0F172A, #64748B, #0EA5E9, #10B981, #EF4444, #F59E0B)
- Typography: ✅ DM Sans headings, Inter body, correct weights loaded (600/700 heading, 400/500/600 body)
- Spacing: ✅ 4px base unit, Tailwind scale (1=4px, 2=8px, 4=16px, 6=24px, 8=32px, 12=48px, 16=64px)
- Border radii: ✅ sm=4px, md=8px, lg=12px, full=9999px via `@theme inline`
- Animations: ✅ fast=150ms, normal=250ms ease-out; added stagger-in and pulse-dot keyframes

## Changes Made

### globals.css
1. Added `::selection` color using primary
2. Added `scroll-behavior: smooth`
3. Added font smoothing (`-webkit-font-smoothing`, `-moz-osx-font-smoothing`)
4. Added `focus-ring` utility class for consistent focus rings
5. Added `stagger-in` and `pulse-dot` keyframe animations

### Landing Page (`src/app/page.tsx`)
1. **Nav**: Sticky with `backdrop-blur-sm` + `bg-surface/80` for frosted glass effect. Dashboard link now a button-styled CTA
2. **Hero**: Added pill badge ("Works across 90+ countries") above heading. Larger heading scale (3.5rem on lg). Better line-height (1.1). More vertical space before CTAs
3. **CTA Buttons**: Rounded to `rounded-lg`. Added shadow on primary button that lifts on hover. Full-width stacking on mobile
4. **Preview Cards**: Added `working` state indicator (green vs gray dot). Larger time display (text-2xl). `tabular-nums` for consistent number widths. Refined shadow on hover
5. **Features Section**: Added subtitle paragraph. Increased gap between cards (gap-10). Better icon container sizing
6. **Social Proof**: Replaced single Globe+text with separated items and dot dividers
7. **Footer**: Split into two-column layout (brand + tagline)

### Dashboard Layout (`src/app/dashboard/layout.tsx`)
1. Sticky header with frosted glass backdrop
2. Increased gap between logo and nav items
3. Slightly smaller nav icons (15px) for refinement
4. Active state uses `primary/8` opacity
5. Mobile: Hide "Home" text, show only icon

### Dashboard Page (`src/app/dashboard/page.tsx`)
1. Improved loading skeleton to mirror page layout (header + card grid)
2. Larger, more spacious empty state (py-20, bigger globe, relaxed line-height)

### Member Cards (`src/components/features/MemberCard.tsx`)
1. Refined hover shadow to `shadow-[0_4px_16px_rgba(0,0,0,0.06)]` — softer, more premium
2. Increased card padding (via Card component: p-4 → p-5)
3. `tabular-nums` on clock display for stable digit widths
4. Better spacing between weather and holiday badge (mb-3 → mb-4)

### Overlap Page + Timeline
1. Better loading skeleton (header + body layout)
2. Summary bar padding increased to p-4 with mb-5
3. Overlap duration displayed in secondary color for hierarchy
4. Timeline member name column widened (w-32 → w-36) for less truncation
5. Row spacing slightly increased

### Holidays Page + List
1. Better loading skeleton with header + list items
2. Date header padding refined (py-2 → py-2.5)
3. List gap increased (space-y-2 → space-y-3)
4. Empty state more spacious

### Pricing Page
1. Sticky frosted glass nav (matching other pages)
2. Dashboard CTA in nav now button-styled
3. Highlighted tier: subtle blue shadow for depth
4. Price text larger (text-3xl → text-4xl) with tracking-tight
5. Feature list spacing increased (space-y-2 → space-y-2.5, mb-6 → mb-8)
6. FAQ: heading font applied, padding increased, better line-height
7. Footer matches landing page two-column layout

### UI Components
1. **Card**: Padding increased p-4 → p-5
2. **Skeleton**: Softer color (border/50 → border/40), rounded-md → rounded-lg
3. **Button**: No changes needed — already had proper hover/active/focus states

### Modals (Add, Edit, Upgrade)
1. Backdrop: lighter opacity (black/30 → black/25) with `backdrop-blur-[2px]` for depth
2. Modal shadow refined to `shadow-[0_8px_32px_rgba(0,0,0,0.12)]`
3. Dropdown shadow refined to `shadow-[0_4px_16px_rgba(0,0,0,0.08)]`
4. Dropdown row height increased for touch targets

## Responsive Status
| Page | Desktop | Mobile (390px) |
|------|---------|----------------|
| `/` | ✅ | ✅ — CTAs stack vertically, cards stack to 1-col, social proof dots hidden |
| `/dashboard` | ✅ | ✅ — cards stack to 1-col, mobile nav scrollable |
| `/dashboard/overlap` | ✅ | ✅ — timeline scrolls horizontally, date picker wraps |
| `/dashboard/holidays` | ✅ | ✅ — list items stack, filter dropdown full-width |
| `/pricing` | ✅ | ✅ — tier cards stack, FAQ full-width |

## Microinteractions Added
- **Page load stagger**: Hero pill → heading → subtext → CTAs → cards (75ms incremental delays)
- **Card hover lift**: -translate-y-0.5 + shadow lift on all cards (member, pricing, preview)
- **Sticky nav blur**: All headers use `backdrop-blur-sm` + semi-transparent background
- **Active state press**: `active:scale-[0.98]` on all buttons and CTAs
- **Focus rings**: `focus-visible:ring-2 ring-primary/30` on all interactive elements
- **Modal backdrop**: Subtle `backdrop-blur-[2px]` for depth separation
- **Modal entry**: `scale-in` animation (96% → 100% scale with fade)
- **Toast slide**: `slide-up` animation on notifications
- **Success glow**: Working status dot uses `shadow-[0_0_6px]` with green glow
- **Copy feedback**: Check icon swap on clipboard copy in overlap timeline

## Build Status
- After design pass: ✅ PASS (`npm run build` exits 0, all 5 routes + 4 API routes compiled)
