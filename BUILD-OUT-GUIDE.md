# Build-Out Guide — Mapping Tasters to the 3-Panel Format

**Architecture:** iPhone (user interaction) → AI Layer (processing) → Dashboard (operations)

Each taster below is broken down into what each panel shows, the key interactions, and how the concept extends to US expansion.

---

## 1. Jio Agent Platform

**Core idea:** The network where AI agents live. Five 5G SA products (AgentNet, AgentGrid, AgentGuard, IntentMesh, AgentRoam) that let AI agents operate as first-class citizens on the network.

### iPhone Panel
- MyJio home with agent-aware service tiles
- User configures an agent (e.g. "Set up a shopping agent for weekly groceries")
- Agent appears in a new "My Agents" section within the app
- Agent activity feed: "Your travel agent booked a cheaper flight" / "Your finance agent moved ₹5,000 to savings"
- Bottom nav: Jio | Mobile | Fiber | Finance | Play | Cloud (agents weave across all)
- AgentGuard notification: "Agent blocked — exceeded ₹2,000 spend cap"

### AI Layer
- **Pipeline:** User Intent → Agent Registry → Network Slice Allocation → Policy Check (AgentGuard) → Edge Routing (AgentGrid) → Execution → Confirmation
- Active model: AgentOrchestrator-v3
- Show network slice assignment in real-time (which agent gets which lane)
- Policy enforcement events: spend caps triggered, geofence violations, child-safety blocks
- IntentMesh translation: natural language → network policy rules

### Dashboard
- **Agent Fleet Overview:** Active agents per user, total fleet size, agents by category
- **Network Slice Monitor:** Slice utilisation per agent type, latency per slice, bandwidth allocation
- **Policy Engine:** Rules fired, blocks triggered, escalations
- **AgentRoam:** Cross-border agent sessions, roaming handoffs
- **Revenue:** Agent subscription tiers (₹199/₹349/₹499), ARPU per agent tier

### US Expansion Angle
- US carriers (T-Mobile, Verizon, AT&T) have no agent-native network product
- Enterprise play: AI agents for field service, logistics, fleet management running on dedicated 5G slices
- AgentGuard maps to US enterprise compliance requirements (SOC2, HIPAA agent constraints)
- AgentRoam positions Jio as the agent identity layer for cross-border operations — relevant as US enterprises deploy AI agents in India/APAC

---

## 2. Jio Token Network

**Core idea:** AI compute tokens bundled into every Jio connection. "You came for the data. You'll stay for the tokens." New metric: ARPU → ARPT (Average Revenue Per Token).

### iPhone Panel
- MyJio home with token balance prominently displayed (like data balance today)
- "AI Tokens: 2,450 remaining" in the account bar alongside Data and Plan
- User taps into JioCinema → uses AI scene analysis → token deduction shown
- User asks HelloJio a complex question → token cost displayed ("This used 12 tokens")
- Token top-up flow (like data booster purchase)
- Plan comparison: AI Lite / AI Plus / AI Family with token allocations
- Family view: per-member token usage breakdown

### AI Layer
- **Pipeline:** User Request → Token Metering → Model Router (Core LLM vs Edge SLM vs Split Inference) → Execution → Token Deduction → Response
- Show routing decisions: "Simple query → Edge SLM (2 tokens)" vs "Complex reasoning → Core LLM (45 tokens)"
- Split inference visualisation: partial processing at edge, escalation to core
- Token consumption rate, model selection logic
- Active model switches dynamically based on query complexity

### Dashboard
- **Token Economics:** Total tokens consumed today, token revenue (₹), ARPT trending
- **Model Distribution:** Requests routed to Core LLM vs Edge SLM vs On-Device — cost per route
- **Plan Analytics:** Subscribers by tier (Lite/Plus/Family), upgrade conversion rates, token depletion curves
- **Developer Ecosystem:** Third-party apps consuming tokens via API, top developers, token revenue share
- **Infrastructure:** GPU utilisation across data centres, edge node load, cost-per-token trending down

### US Expansion Angle
- US carriers are losing differentiation — data is commoditised. Tokens are the new value unit.
- Bundling AI compute into wireless plans is unexplored territory in the US market
- Developer token marketplace positions Jio as an AI distribution platform (like an app store, but for compute)
- Enterprise angle: US companies pay separately for OpenAI, Anthropic, Google AI — a carrier bundling this into connectivity is a paradigm shift
- Token roaming: use your AI tokens internationally, same as data roaming today

---

## 3. Jio MVNO-as-a-Service

**Core idea:** Any brand can launch mobile on Jio's network. White-label platform with worked examples: Manchester United, Mumbai Indians, Swiftie Mobile.

### iPhone Panel
- **Two modes** (toggle in demo):
  1. **Fan experience:** Manchester United Mobile app — branded home screen, plan card showing "Season Supporter ₹499/mo", matchday data boost notification, merch + SIM bundle, fan badge progression
  2. **Another brand:** Mumbai Indians — Wankhede 5G boost active, Paltan points balance, multi-angle replay toggle during live match
- Show the eSIM activation flow: Brand app → Pick plan → Activate eSIM → Live in 4 taps
- Bottom nav changes per brand (each MVNO has its own navigation)
- The Jio network is invisible — only the brand identity is visible to the user

### AI Layer
- **Pipeline:** Fan Action → Engagement Scoring → Offer Personalisation → Network Event (data boost / content unlock) → CRM Update → Analytics
- Show how matchday triggers automatic data boosts (time + location + event awareness)
- Fan segmentation engine: casual → committed → superfan progression
- Content unlock decisions: which tier gets what, when
- Real-time churn prediction per subscriber

### Dashboard
- **Partner Portal view** — this is what the brand sees:
  - Subscribers by tier, ARPU per tier, churn rate
  - Engagement metrics: content views, matchday boost usage, merch conversion
  - Revenue share breakdown (Jio vs Brand split)
  - Fan progression funnel: how many moved from Matchday → Season → Legend tier
- **Platform view** — what Jio sees across all MVNOs:
  - Total MVNO subscribers, active partners, platform revenue
  - Onboarding pipeline: brands in setup, brands live, brands scaling
  - Network capacity allocated to MVNO partners

### US Expansion Angle
- **This is the biggest US play.** The US has a massive brand-fan economy:
  - NFL teams (Cowboys Mobile, Chiefs Mobile), NBA (Lakers Mobile), MLB
  - Music: Taylor Swift, Beyonce, Drake — artist-branded mobile with concert pre-sales
  - Streaming: Netflix Mobile, Disney+ Mobile, Spotify Mobile — bundle connectivity with content
  - Fintech: Revolut Mobile (already happening in UK with Gigs OS + Vodafone)
- US VNO/MVNO regulatory framework already exists (TracFone, Mint Mobile, Google Fi model)
- Jio's platform could be licensed to US carriers or operated as a SaaS platform
- Revenue model: Platform licensing fee + per-subscriber rev share
- Key differentiator vs existing US MVNOs (Mint, Visible): brand-native experience, not just cheap plans

---

## 4. Jio Kirana Network

**Core idea:** Digitise 13 crore+ kirana shops before quick-commerce eats them. Photo-based catalogue creation, agentic commerce (customer speaks → AI shops nearby stores → 25-min delivery).

### iPhone Panel
- **Two perspectives** (toggle between Customer and Shop Owner):
  1. **Customer view:** Voice command "Jio, I need vegetables and milk under ₹500, 30 minutes" → AI assembles basket from nearby kirana → shows "Gupta General Store" with items and prices → confirm → track delivery
  2. **Shop Owner view (Jio Partner App):** New order notification → order details → pack confirmation → rider assigned → daily sales dashboard → "Verified by Jio" badge visible
- Customer's bottom nav: standard MyJio (ordering happens within the super-app)
- Owner's bottom nav: Orders | Catalogue | Payments | Support

### AI Layer
- **Customer pipeline:** Voice Input → ASR (Hindi) → Intent + Items Extraction → Nearby Store Search → Stock Check + Price Compare → Smart Basket Assembly → Store Notification → Rider Dispatch
- **Owner pipeline:** Photo Upload → Item Recognition (CV model) → Catalogue Auto-Population → Price Suggestion (market data) → Publish
- Show the store matching algorithm: proximity, stock availability, ratings, delivery speed
- Demand prediction: "Diwali in 3 days — suggest stocking sweets and diyas"

### Dashboard
- **Network Health:** Stores onboarded (3L+), cities active (600+), daily orders, GMV
- **Delivery Metrics:** Avg delivery time, rider utilisation, orders per store per day
- **Agentic Commerce:** Voice orders vs app orders, basket size comparison, conversion rates
- **Store Performance:** Revenue per store trending, catalogue completeness, payment settlement speed
- **Growth Map:** Heatmap of store density by city, underserved areas for expansion

### US Expansion Angle
- Translates directly to **small business digitisation** in the US:
  - Bodegas in NYC, corner stores, independent grocers, ethnic food shops
  - US small retailers face the same threat from Amazon Fresh, Instacart, DoorDash
- Voice-first ordering in Spanish/English for diverse US communities
- ONDC equivalent: open commerce protocols already being discussed in US/EU
- Jio's platform could power a "Shopify for physical retail" — inventory, payments, delivery, AI demand prediction
- Partnership with US carriers to offer small business bundles (connectivity + POS + online orders)

---

## 5. JioGuardian Mesh

**Core idea:** Voice-only parental safety in Hindi/Hinglish. Parent speaks → network enforces. "Block games after 10pm for Ananya, allow school apps and family WhatsApp."

### iPhone Panel
- **Two perspectives** (toggle between Parent and Child):
  1. **Parent view:** Voice interface with mic button. Speaks policy → sees confirmation. "My Agents" style section showing active policies for each child. Family member cards with status (online, restrictions active, emergency triggers set).
  2. **Child view:** Normal MyJio experience but with subtle "Protected by JioGuardian" indicator. After 10 PM: blocked apps show "Available tomorrow at 6 AM" overlay. Emergency button always visible.
- Show policy taking effect in real-time: parent speaks → child's phone updates within seconds
- Bottom nav (parent): Home | Family | Policies | Alerts | Settings

### AI Layer
- **Pipeline:** Mic → ASR (hi-IN) → Intent Parser (NLU) → Policy Generator → JioGuardian API → Network Enforcement → TTS Confirmation
- Show intent extraction: time windows, allowed apps, blocked apps, emergency phrases
- Policy conflict detection: "This conflicts with an existing rule — merge or replace?"
- Emergency event processing: child says trigger phrase → immediate parent notification + helpline
- Multi-language support: Hindi, Hinglish, Marathi, Tamil

### Dashboard
- **Family Safety Overview:** Active families, total policies, emergency events (last 24h)
- **Policy Analytics:** Most common rules (time-based blocks dominate), avg policies per family
- **Emergency Monitor:** Trigger events, response times, escalation rates
- **Engagement:** Parent interaction frequency, voice vs manual policy creation ratio
- **Network Enforcement:** Policies pushed to devices, enforcement success rate, latency

### US Expansion Angle
- US family safety market is large and fragmented (Bark, Qustodio, Circle, Apple Screen Time)
- None of them are **network-level** — they're all app-based and easily bypassed
- Voice-first in English + Spanish for US market
- Network-level enforcement is the differentiator: can't be uninstalled, can't be VPN'd around
- Carrier partnership: T-Mobile/Verizon could offer "Guardian" as a premium family add-on
- Regulatory tailwind: US COPPA compliance, child online safety legislation trending stricter
- Enterprise extension: employee device policy management via voice ("Block social media on company devices during work hours")

---

## Cross-Cutting US Expansion Themes

### Why Jio in the US?
1. **Technology export:** Jio's platform (agent network, token metering, MVNO-as-a-Service, agentic commerce, network-level safety) can be licensed to US carriers
2. **SaaS model:** Sell the platform, not the network. Jio doesn't need US spectrum — it needs US carrier partners
3. **Scale proof:** 500M+ subscribers in India validates the platform at scale no US carrier has achieved
4. **AI-native:** US carriers are retrofitting AI onto legacy networks. Jio built AI-native from day one on 5G SA
5. **Developer ecosystem:** Token APIs and agent SDKs create a platform play that US carriers have never attempted

### Which tasters are strongest for US?
| Taster | US Relevance | Why |
|--------|-------------|-----|
| MVNO-as-a-Service | Highest | Brand-fan economy is massive in US. NFL, NBA, artists, streaming platforms. Clear revenue model. |
| Token Network | High | AI compute bundling is genuinely novel. No US carrier does this. First-mover advantage. |
| Agent Platform | High | Enterprise 5G + AI agents. US enterprise market is largest in the world. |
| Guardian Mesh | Medium-High | Family safety is a $2B+ US market. Network-level enforcement is a real differentiator. |
| Kirana Network | Medium | Translates to small business, but US retail dynamics differ. Strongest as a platform licensing play. |

---

## Build Priority

When something bites tonight, the React app (`app/`) is ready. The 3-panel architecture is built. We swap in the specific demo content:

1. Replace iPhone screens with demo-specific flows
2. Update AI layer pipeline steps and model names
3. Update dashboard metrics, charts, and tables to match the domain
4. Add US expansion context as a secondary view or slide-out panel

The proof-of-concept already demonstrates we can build all of this. Tonight is about making one of them real.
