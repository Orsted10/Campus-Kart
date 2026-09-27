# CAMPUSKART — landing experience

The flagship public-facing site for **CampusKart**, a campus-first ecosystem for
**food · rides · essentials · campus services**.

Not the product — the front door. A cinematic, scroll-driven brand film you can
control: a living campus map, a fragmentation → convergence transformation, three
interactive product demos, and a day-on-campus narrative.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000

npm run build && npm start   # production
```

## The narrative (six acts, one page)

| Act | Section id | What happens |
| --- | --- | --- |
| I — Enter | `#top` | Hero + **Campus Pulse**: a stylised campus scene that reacts to cursor, service hover and scroll (camera pushes in, then hands the scene to the next section) |
| II — Recognise | `#chaos` | Five time-stamped moments of ordinary student life, spatially scattered, each opening a micro-scene; disconnected route fragments in the background |
| III — Connect | `#connect` | **The signature scroll transformation**: fragments dissolve, routes draw into one network, `ONE CAMPUS. ONE ECOSYSTEM.` reveals — fully scrubbed and reversible |
| IV — Experience | `#ecosystem` | Immersive service switcher with a continuity line (route → road → supply path) and three live demos: food journey, ride route planner, essentials shelf. Followed by `#pulse` (Campus Pulse signals) and `#map` (stylised zone plan with scroll-drawn routes) |
| V — Believe | `#stories` `#people` `#vendors` `#trust` `#tech` | Day-on-campus scenario sequence, editorial photography, vendor ↔ student connection, trust layer that draws itself, and an exploded **“under the surface”** stack of five systems |
| VI — Join | `#partner` + footer | Partner lead form, then the closing signature: every route converges into the CampusKart mark |

Plus: `app/not-found.tsx` — a CampusKart-native 404 (a route that never finds its
destination).

## Architecture

```
app/
  layout.tsx        fonts (Geist + Geist Mono + Instrument Serif), SEO, theme boot script
  page.tsx          <AppProvider><Experience/></AppProvider>
  globals.css       design tokens (light + dark), type scale, utilities, reduced-motion
  not-found.tsx  sitemap.ts  robots.ts
components/
  Experience.tsx    assembles scenes, smooth scroll, section tracking, ⌘K
  Chrome.tsx        mark, magnetic buttons, theme knob, loader, nav, mobile menu, cursor
  Overlays.tsx      search mode, login/register, support drawer, legal sheet
  CampusScene.tsx   reusable art-directed SVG campus (routes, blocks, nodes, parallax)
  Hero.tsx  Chaos.tsx  Convergence.tsx  Ecosystem.tsx  Journeys.tsx
  CampusMap.tsx     zone plan + CampusPulse
  Scenarios.tsx  People.tsx  Trust.tsx  Partner.tsx  Footer.tsx
lib/
  store.tsx         global state: theme (external store + radial day→night transition),
                    campus, service, ride points, overlays
  motion.ts         Lenis smooth scroll + GSAP ScrollTrigger, useReveal / useScrub
  data.ts           campuses, moments, dishes, shelf, scenarios, legal copy (all demo)
scripts/            visual QA suite (see below)
```

State is one coherent context (`theme, campus, service, pickup, destination,
overlays, activeSection`) — no isolated one-off hacks.

## Design system

- **Light**: warm cream `#F4F0E8`, surfaces `#FAF9F6` / `#EDE9E0`, ink `#171717`
- **Dark**: charcoal `#151515`, surfaces `#1D1D1B` / `#242422`, ink `#F5F1E8`
- **Accents**: brand blue `#2875D3`, food `#C9653B`, essentials `#65705A`
- Every accent also has an **`-ink` variant** (`--blue-ink`, `--food-ink`,
  `--essentials-ink`) used for *text* so all copy clears WCAG AA in both themes,
  while graphics keep the pure brand values.
- Theme switching is a **radial illumination** from the control, not a variable
  swap; the choice persists and respects `prefers-color-scheme`.

## Accessibility & performance

Semantic landmarks, one `h1`, labelled inputs, visible focus rings, keyboard +
touch navigation preserved under Lenis, `prefers-reduced-motion` disables smooth
scroll/infinite loops and reduces scroll-linked motion, `next/image` with lazy
loading, transforms only (no layout animation), overflow contained so the mobile
layout viewport never expands.

## Visual QA suite

```bash
npm run start &            # production server on :3100 (or change BASE in scripts)

npm run qa:shots           # 55 screenshots → qa/ (light, dark, mobile, overlays, a11y)
npm run qa:audit           # 59 checks: overflow, contrast, images, console, every flow
npm run qa:design          # 24 checks: scroll reversibility, nav behaviour, reduced motion
npm run qa:pixels          # 245 checks across the screenshots: theme, coverage, accents
```

All four suites pass on the current build. Photography lives in `public/img`
(demo imagery); `scripts/og.html` renders `public/og.png` for social cards.

## Demo honesty

Everything numeric or operational is labelled as demo (`Demo route · example
campus`, `Demo interaction complete`, placeholder legal copy). No backend is
wired: forms validate locally and say so.
