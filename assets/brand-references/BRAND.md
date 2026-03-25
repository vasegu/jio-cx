---
name: jio-brand
description: "Jio brand identity companion skill for web apps and mobile mockups. Use alongside any HTML, React, or design output for Reliance Jio. Provides real JioType fonts, verified colors (cross-checked March 2026), logos (SVG), CSS custom properties, JS design tokens, and iPhone templates. Trigger when the user mentions 'Jio', 'Reliance Jio', 'Jio demo', 'Jio workshop', or wants outputs branded for Jio. This is a companion skill — always use it IN ADDITION to your primary task."
---

# Jio Brand Identity Skill

This skill ensures all Jio deliverables — web app demos and mobile mockups — look authentically on-brand. All colors and assets verified against jio.com live site, March 2026.

## Assets Available (Offline-Ready)

All assets are bundled locally. No network required.

| Asset | Path | Notes |
|-------|------|-------|
| Jio logo (current, full) | `assets/jio-logo-current.svg` | Full current logo from jio.com CDN (3 elements) |
| Jio logo (blue circle) | `assets/jio-logo-blue.svg` | Primary mark — white "jio" in `#0F3CC9` circle |
| Jio logo (red circle) | `assets/jio-logo-red.svg` | Secondary — white "jio" in `#DA2441` circle |
| Jio logo (white) | `assets/jio-logo-white.svg` | For dark backgrounds |
| JioType Bold | `assets/fonts/jiotype/JioTypeW04-Bold.ttf` (.woff also) | Real JioType — use this, NOT Nunito |
| JioType Medium | `assets/fonts/jiotype/JioTypeW04-Medium.ttf` (.woff also) | Body text weight |
| JioType Light | `assets/fonts/jiotype/JioTypeW04-Light.ttf` (.woff also) | Captions, subtle text |
| Accenture logo (full) | `assets/accenture-logo.svg` | Purple `#A100FF` — use sparingly |
| Accenture logo (subtle) | `assets/accenture-logo-subtle.svg` | Grey `#666` — for footer attribution |
| Rupee glyph font | `assets/fonts/rupee/RupeeForadian.ttf` (.woff also) | ₹ currency symbol font used in Jio apps |
| CSS theme | `references/jio-theme.css` | Drop-in with @font-face + custom properties |
| JS tokens | `references/jio-tokens.js` | Constants + theme object + Tailwind config |
| Brand guide | `references/brand-guide.md` | Full sourced reference with verification notes |
| **App widget reference** | `references/app-widgets.md` | **Complete MyJio super-app UI inventory** — build FROM this |

## Verified Brand Facts (March 2026)

**WARNING:** Older brand reference sites cite `#005AAC` — this is OUTDATED. Use the values below.

| Fact | Value | Source |
|------|-------|--------|
| **Primary Blue** | `#0F3CC9` | `--color-blue-100` on jio.com (verified across 4 pages) |
| **Primary Red** | `#DA2441` | Live logo SVG from myjiostatic.cdn.jio.com |
| **Deep Blue** | `#0a2885` | Dark accent, jio.com/business |
| **Focus Blue** | `#005fcc` | Accessibility focus states |
| **Light Tint** | `#E7EBF8` | Section backgrounds on jio.com |
| **Black** | `#141414` | `--color-black-100` body text |
| Corporate typeface | **JioType** (Monotype) — 3 weights included | jio.com/selfcare @font-face |
| Logo typeface | Omnes Bold (Darden Studio), all lowercase | fontsinuse.com |
| Design pillars | Simple, Smart, Secure | Interbrand case study |
| Brand promise | "Digital Life" | Studio Schnauze |

## Typography — Use Real JioType

JioType font files are included (from Jio's Akamai CDN). Always use JioType.

### @font-face (for HTML / CSS)

```css
@font-face {
  font-family: 'JioType';
  src: url('assets/fonts/jiotype/JioTypeW04-Light.woff') format('woff'),
       url('assets/fonts/jiotype/JioTypeW04-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'JioType';
  src: url('assets/fonts/jiotype/JioTypeW04-Medium.woff') format('woff'),
       url('assets/fonts/jiotype/JioTypeW04-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'JioType';
  src: url('assets/fonts/jiotype/JioTypeW04-Bold.woff') format('woff'),
       url('assets/fonts/jiotype/JioTypeW04-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}
```

### Font stack

```css
font-family: 'JioType', 'Nunito', sans-serif;
letter-spacing: 0.02em;
```

## Color Palette

### Primary (verified from jio.com, March 2026)
- **Jio Blue:** `#0F3CC9` — headers, primary buttons, headings, active states
- **Jio Red:** `#DA2441` — alerts, secondary actions, logo accent
- **Deep Blue:** `#0a2885` — hover states, dark sections
- **Light Tint:** `#E7EBF8` — subtle backgrounds, alternating rows
- **Black:** `#141414` — body text

### Extended "Colours of India" (approximate, sampled from Jio materials)
- Saffron `#FF6F00` · Magenta `#D9008D` · Green `#00C853` · Teal `#00BCD4`
- Purple `#7B1FA2` · Gold `#FFD600` · Sky `#29B6F6` · Coral `#FF7043`

### Chart series order
```
#0F3CC9 → #FF6F00 → #D9008D → #00C853 → #00BCD4 → #7B1FA2 → #FFD600 → #FF7043
```

## Accenture Branding — Keep It Minimal

**Do NOT** create co-branded headers or prominent dual logos. The Accenture presence should be subtle:

- **Footer only:** Small text "Made by Accenture" in muted grey
- Use `accenture-logo-subtle.svg` (grey version) at small scale if a logo mark is needed
- Accenture purple `#A100FF` should NOT appear in the UI — use the grey version
- The work should feel like a Jio product, with Accenture as the quiet hand behind it

### Example footer pattern

```html
<footer style="padding: 16px 24px; text-align: center; color: #999; font-size: 12px; letter-spacing: 0.05em;">
  Made by Accenture
</footer>
```

## Design Language

- `border-radius: 8px` on cards, buttons, containers (rounded = friendly = Jio)
- Generous whitespace — clean, digital feel
- Active state indicator: `4px solid #0F3CC9` bottom border
- Card shadows: `0 4px 16px rgba(0,0,0,0.16)`
- JioPattern: algorithmically unique dot patterns using Colours of India
- The circle is sacred — use circular avatars, round icon containers

## iPhone App Mockup Guide

For mobile mockups targeting iPhone:

### Dimensions
| Device | Width | Height | Safe Area Top | Safe Area Bottom |
|--------|-------|--------|---------------|-----------------|
| iPhone 15 Pro | 393px | 852px | 59px | 34px |
| iPhone 15 Pro Max | 430px | 932px | 59px | 34px |
| iPhone SE | 375px | 667px | 20px | 0px |

### Mobile design rules
- Status bar: 59px top safe area (notch devices)
- Home indicator: 34px bottom safe area
- Tab bar: 49px height + bottom safe area
- Navigation bar: 44px height + top safe area
- Touch targets: minimum 44x44px
- System font for navigation chrome, JioType for content
- Bottom sheet patterns over full-page navigation for AI features
- Card padding: 16px on mobile (vs 20px desktop)

### Mobile color adjustments
- On OLED screens, use `#000000` for true black backgrounds in dark mode
- Jio Blue headers work well on mobile — keep them
- Reduce the extended palette to 4-5 colors max on mobile to avoid visual noise

## The "Looks Like Jio" Checklist

Before delivering any output, verify:

- [ ] `#0F3CC9` Jio Blue is the dominant brand color (NOT the old #005AAC)
- [ ] **JioType** font used (not Nunito — we have the real font)
- [ ] `letter-spacing: 0.02em` applied
- [ ] Body text color is `#141414` (not pure black)
- [ ] Rounded corners (8px) on cards, buttons, containers
- [ ] Clean whitespace — the feel is digital and modern
- [ ] Chart/data viz uses the extended colour palette
- [ ] Logo present in header (blue circle variant)
- [ ] Accenture attribution is footer-only, subtle grey text
- [ ] No ugly co-branding — this is a Jio product
