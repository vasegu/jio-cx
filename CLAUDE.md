# Jio Demos

## Purpose
Polished demo apps for Jio stakeholders. Mark presents 5 tasters (in `presentations/`). We build out what bites as a React app (`app/`).

## Structure
```
jio-demos/
├── app/                    # React build-out (Vite) — the polished deliverable
├── presentations/          # Mark's 5 static taster presentations
├── brand-assets/           # Logos, fonts (shared)
├── brand-references/       # CSS theme, JS tokens, widget reference, brand guide
├── template/               # Starter template for new pages
└── BRAND.md                # Full brand identity reference
```

## Architecture Pattern
**iPhone (user interaction) → AI Layer (processing) → Dashboard (operations)**

MyJio is a super-app. The bottom tab bar changes per sub-app:
- Main: Jio | Mobile | Fiber | Finance | Play | Cloud
- Shopping: Shopping | Categories | Account | Cart
- Each service opens its own mini-app with its own navigation

## Design Standards — Strictly Follow JDS

Every screen, component, and interaction must feel native to Jio's design system. This is non-negotiable.

### No emojis. Ever.
Use Jio-style outlined SVG icons (1.8px stroke, rounded caps/joins, 24px grid). If you need an icon, draw it as an SVG following the JDS icon system: outlined, medium weight, uniform stroke, rounded joins.

### Typography
- **Font:** JioType only. Fallback to Nunito, then system sans-serif.
- **Weights:** Light (300) for body, Medium (500) for labels/UI, Bold (700) for headings/numbers.
- **Letter-spacing:** `0.02em` on all text.
- **Body color:** `#141414` (`--color-black-100`).
- **Secondary text:** `rgba(0,0,0,0.65)` (`--color-grey-90`).

### Color System
| Token | Hex | Usage |
|-------|-----|-------|
| `--jio-blue` | `#0F3CC9` | Primary actions, active states, links, headers |
| `--jio-deep-blue` | `#0a2885` | Header backgrounds, deep accents |
| `--jio-red` | `#DA2441` | Error, alerts, secondary CTA |
| `--jio-gold` | `#EFA73D` | Warnings, promotional accents |
| `--jio-green` | `#00C853` | Success, positive values, healthy status |
| `--jio-magenta` | `#D9008D` | Entertainment contexts (JioCinema) |
| `--jio-black` | `#141414` | Primary text |
| `--jio-light` | `#E7EBF8` | Tinted backgrounds |
| `--jio-bg` | `#F5F7FA` | Page background |
| `--jio-white` | `#FFFFFF` | Card surfaces |
| `--jio-border` | `#E0E0E0` | Dividers, borders |

Do NOT use `#005AAC` (old blue). Do NOT use arbitrary colours outside this palette.

### Surfaces and Elevation
- Card radius: `12px` (mobile), `8px` (web compact).
- Card shadow: `0 4px 16px rgba(0,0,0,0.08)`.
- Card padding: `16px`.
- Grid gap: `12px`.
- Section spacing: `24px`.
- Side margins: `16px` (mobile), `24px` (desktop).
- Active tab indicator: `border-bottom: 4px solid #0F3CC9`.
- Pill/chip radius: `100px`.

### Iconography
- Style: **Outlined / line icons** — never filled, never duotone.
- Stroke: `1.8px`, rounded caps and joins.
- Size grid: 24px standard, 20px compact, 32px featured.
- Color: `#141414` on white, `#FFFFFF` on blue, `#0F3CC9` for active.
- Uniform stroke width across all icons in a set.

### Motion
- Card transitions: `opacity + translateY` (fade up).
- Duration: `0.2s–0.4s`, ease timing.
- No bouncy/spring animations. Clean, professional, understated.

### Logo
- Use `brand-assets/jio-logo-blue.svg` on white backgrounds.
- Use `brand-assets/jio-logo-white.svg` on blue/dark backgrounds.
- Accenture: footer only, subtle grey. Never co-brand.

## React App (app/)
- Vite + React
- JioType fonts and logos already copied into `app/src/assets/`
- Run: `cd app && npm run dev`
- Brand colors defined as CSS variables in `src/styles.css`

## Brand Checklist
- [ ] JioType font loaded and rendering
- [ ] `#0F3CC9` Jio Blue is the dominant colour
- [ ] Body text `#141414`, letter-spacing `0.02em`
- [ ] Rounded corners (12px mobile, 8px web) on cards/buttons
- [ ] All icons are outlined SVGs (no emojis, no filled icons)
- [ ] Logo in header (correct variant for background)
- [ ] Accenture footer only, subtle grey
- [ ] Works standalone (no external dependencies that need auth)
- [ ] No emojis anywhere in the UI
