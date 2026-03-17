# Jio Demos — Index

## The Play

**Today (Mar 17):** Mark presents all 5 tasters to Jio in a quick session. We listen, watch reactions, see what lands.
**Tonight:** We build a high-quality, polished web app for whatever bites.
**Tomorrow (Mar 18):** Present the built-out version — "this is what it will look like."

**Location:** Accenture Office, MDC2

---

## Structure

```
jio-demos/
├── app/                    # React build-out (Vite) — the polished deliverable
├── presentations/          # Mark's 5 taster presentations (static HTML)
├── brand-assets/           # Logos, fonts (shared)
├── brand-references/       # CSS theme, JS tokens, widget reference, brand guide
└── template/               # Starter template for new pages
```

**Architecture pattern:** iPhone (user interaction) → AI Layer (processing) → Dashboard (operations)

---

## The 5 Tasters (presentations/)

### 1. Jio Agent Platform
**Path:** `presentations/agent-platform/index.html`
**One-liner:** The network where AI agents live.
**What it proposes:** Five new 5G SA network products:
- **AgentNet** — priority network lanes per AI agent
- **AgentGrid** — multi-agent coordination at the edge (MEC marketplace)
- **AgentGuard** — network-level safety/policy enforcement (spend caps, child safety, geofencing)
- **IntentMesh** — speak natural language, get network rules ("optimise for exam month")
- **AgentRoam** — agent identity persists across borders
**Key numbers:** 450M+ subs, 10+ live network slices, pricing Rs.199-499/mo
**Build-out potential:** Interactive agent config dashboard, live policy builder, network slice visualisation

### 2. Jio Token Network
**Path:** `presentations/token-network/index.html`
**One-liner:** AI compute tokens bundled into every Jio connection.
**What it proposes:** "You came for the data. You'll stay for the tokens."
- Three plan tiers: AI Lite / AI Plus / AI Family
- 7-layer intelligence stack (Physical > Compute > AI Platform > Telecom AI > Edge > Apps > Orchestration)
- New metric: ARPU to ARPT (Average Revenue Per Token)
**Key numbers:** 500M+ subscribers reach, three commercial model levers
**Build-out potential:** Token usage dashboard, plan comparison tool, developer portal mockup

### 3. Jio MVNO-as-a-Service
**Path:** `presentations/mvno-as-a-service/index.html`
**One-liner:** Any brand can launch mobile on Jio's network.
**What it proposes:** White-label MVNO platform. Three worked brand examples:
- **Manchester United** — fan plans with matchday data boosts, merch bundles, India tour priority
- **Mumbai Indians** — season ticket + SIM, 5G priority at Wankhede, Paltan points
- **Swiftie Mobile** — pre-sale ticket windows, fan level progression, exclusive drops
**Key numbers:** 234M+ 5G users, 99.9% urban coverage, VNO framework under Telecom Act 2023
**Build-out potential:** Brand configurator ("design your MVNO"), onboarding flow, pricing calculator

### 4. Jio Kirana Network
**Path:** `presentations/kirana-network/index.html`
**One-liner:** Digitise 13 crore+ kirana shops before quick-commerce eats them.
**What it proposes:**
- Digital catalogue, stock & sourcing, all payments, delivery
- "Verified by Jio" trust badge, Jio Mitra local support
- **Agentic commerce vision:** customer speaks > AI finds nearby stores > smart basket > 25-min delivery
**Key numbers:** 13Cr+ kiranas, 82% buyer shift to quick-commerce, $40B market by 2030
**Build-out potential:** Kirana owner dashboard, live order flow, agentic basket builder demo

### 5. JioGuardian Mesh
**Path:** `presentations/guardian-mesh.html`
**One-liner:** Voice-only parental safety in Hindi/Hinglish.
**What it proposes:** Parent speaks → network enforces.
- Mic > ASR (Hindi) > Orchestrator > JioGuardian API > TTS confirmation
- Emergency triggers: "If she says 'help' or 'dar lag raha hai', call me immediately"
**Tech:** Web Speech API (hi-IN), zero external dependencies, fully interactive
**Build-out potential:** Full family dashboard, device management UI, policy timeline, emergency flow

---

## Quick-Open Tasters

```bash
cd ~/Documents/GitHub/jio-demos
open presentations/agent-platform/index.html
open presentations/token-network/index.html
open presentations/mvno-as-a-service/index.html
open presentations/kirana-network/index.html
open presentations/guardian-mesh.html
```

## Run React App

```bash
cd ~/Documents/GitHub/jio-demos/app
npm run dev
```

---

## Build-Out Readiness

| Asset | Location | Purpose |
|-------|----------|---------|
| **React app** | `app/` | Vite + React — the polished build-out |
| JioType fonts (3 weights) | `brand-assets/fonts/jiotype/` | Real corporate typeface |
| Jio logos (4 variants) | `brand-assets/jio-logo-*.svg` | Blue, red, white, current |
| CSS theme (drop-in) | `brand-references/jio-theme.css` | Pre-built components |
| JS design tokens | `brand-references/jio-tokens.js` | Colors, fonts, Tailwind config |
| App widget reference | `brand-references/app-widgets.md` | MyJio super-app UI inventory |
| Starter template | `template/index.html` | Pre-wired HTML with fonts, colors |

---

## Notes

- **Guardian Mesh** requires microphone permission — test on presenter's machine
- **Agent Platform** is a React SPA — may need `npx serve` if file:// doesn't work
- The React app (`app/`) has JioType fonts and logos already copied in
