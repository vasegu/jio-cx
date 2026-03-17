# Demo Reference — Jio x Accenture
**For:** Mark's presentation (Mar 18)
**App:** `cd app && npm run dev` → http://localhost:5173

---

## What This Doc Is

Single source of truth connecting three things:
1. What **Accenture presented** (5 tasters, 3 horizons, US market)
2. What **Jio showed back** (Buddy, Agentic AI, 10 Platforms)
3. How **our demo proves they meet** (3-panel React app)

Focus areas: **Buddy** (Customer Champion), **Agentic AI Architecture** (5 agents + MCP), **10 AI Platforms**. GridX / Digital Twin is acknowledged but not the primary demo thread.

---

## The Demo's Argument in One Sentence

> Every tap on the phone is a customer interacting with Buddy. Every trace in the AI panel is an agent from the MCP orchestration layer doing its job. Every stat on the dashboard is a platform outcome being measured.

---

## How the 3 Panels Map to Jio's Architecture

```
┌─────────────────────┬──────────────────────┬─────────────────────────┐
│   IPHONE (310px)    │   AI LAYER (380px)   │   DASHBOARD (flex)      │
│                     │                      │                         │
│   = BUDDY           │   = AGENTIC AI       │   = 10 PLATFORMS        │
│   Customer Champion │   4-Layer Stack      │   Outcome Delivery      │
│                     │                      │                         │
│   "Your Buddy       │   Signal → Intel →   │   Each platform         │
│    for Life"        │   Orchestration →    │   delivers measurable   │
│                     │   Action             │   enterprise value      │
│                     │                      │                         │
│   Accumulated       │   5 Specialist       │   Stat cards =          │
│   context across    │   Agents via MCP     │   platform KPIs         │
│   every interaction │                      │                         │
│                     │   Token Network =    │   Cluster map =         │
│   Voice-first       │   horizontal layer   │   offer embedding       │
│   "Ask Jio"         │   powering all       │   space (where agents   │
│                     │   scenarios          │   place customers)      │
└─────────────────────┴──────────────────────┴─────────────────────────┘
```

---

## Panel 1: iPhone = Buddy (Jio Customer Champion)

### Jio's Vision (Slide 9)
> "Most services forget you the moment the call ends. Jio Buddy never does."

Buddy accumulates context: Day 1 → Months 3-6 → Year 1-2 → Year 2-4 → Year 4+. From "first plan chosen" to "Jio feels irreplaceable." Buddy remembers delights, frustrations, spend, expectations.

### How Our Demo Shows This

The phone IS Buddy's interface. The user is **Vasco** — a single customer whose every action is tracked and contextualized.

| Scenario | What Buddy Does | Jio Buddy Stage |
|----------|----------------|-----------------|
| **MyJio Home** | Shows token balance (2,450), knows his AI Plus tier, surfaces personalized "Upgrade" promo, voice-first "Ask Jio" input | Growing User → Loyal Customer |
| **Smart Commerce** | Knows his location, assembles smart basket from nearby Gupta General Store, voice ordering in Hindi, tracks delivery | Life Moments (ecosystem services added) |
| **HelloJio** | Interactive chat with memory, NLU confidence shown, Guardian Mesh card for Ananya (parental controls), knows family structure | Loyal Customer (family plan connections) |
| **JioFinance** | Fraud alert on unusual transaction, risk-scored transactions, AI expense insights ("your food spend is 32% higher"), spending category breakdown | Growing User → Loyal Customer |

### Key Buddy Behaviors Demonstrated
- **Proactive:** Fraud alert appears BEFORE damage. Plan optimization hints on home screen.
- **Contextual:** Token costs shown per service (~3 tok, ~8 tok). Buddy knows what each action costs.
- **Accumulated:** The chat in HelloJio builds on prior messages. Guardian Mesh card persists.
- **Voice-first:** "Ask Jio anything..." pill on home screen. Voice order bar in Commerce. Mic in Support.
- **Cross-service:** SHOPPING tile on home → navigates to Commerce. FINANCE tile → navigates to JioFinance. Buddy bridges services.

### Mapping to Accenture's Horizons
- **H1 (Enhance):** Chat support with quick replies, basic plan info
- **H2 (Intent-driven):** "Say what you need..." voice ordering, natural language parental controls
- **H3 (Agent-to-agent):** Smart basket auto-assembled, fraud auto-blocked, plan auto-optimized

---

## Panel 2: AI Layer = Agentic AI Architecture

### Jio's Architecture (Slide 13)
> "Four layers. Fully automated. Deployed at Jio scale."

Signal → Intelligence → Orchestration (5 agents via MCP) → Action (closed-loop, no human needed)

### How Our Demo Shows This

Every phone tap triggers a **pipeline animation + trace waterfall** showing the 4-layer stack in action.

**Pipeline stages per scenario (maps to Jio's 4 layers):**

| Scenario | Pipeline | Jio Layer Mapping |
|----------|----------|-------------------|
| **MyJio Home** | Meter → Route → Select → Execute → Deduct | Signal (meter check) → Intelligence (route edge vs core) → Orchestration (select model) → Action (execute + deduct tokens) |
| **Smart Commerce** | Voice → Extract → Search → Assemble → Dispatch | Signal (ASR transcription) → Intelligence (NLU item extraction) → Orchestration (store search + basket assembly) → Action (rider dispatch) |
| **HelloJio** | Transcribe → Classify → Retrieve → Generate → Synthesize | Signal (ASR) → Intelligence (intent classify) → Orchestration (KB retrieval + LLM gen) → Action (TTS response) |
| **JioFinance** | Auth → Score → Gateway → Settle → Notify | Signal (auth token) → Intelligence (fraud ML score) → Orchestration (UPI gateway) → Action (settle + notify) |

**Mapping to Jio's 5 Specialist Agents:**

| Jio Agent | Our Demo Scenario | What It Does |
|-----------|------------------|--------------|
| **Plan Agent** | MyJio Home | Token balance monitoring, AI Plus upsell, usage metrics. Trace: `token.meter.check`, `model.router.edge_vs_core` |
| **Care Agent** | HelloJio | Issue detection (speed test), closed-loop fix (NLU confidence 98%), Guardian Mesh policy enforcement |
| **Upsell Agent** | Smart Commerce | Ecosystem commerce: voice ordering, smart basket assembly, kirana store matching |
| **Retention Agent** | MyJio Home + HelloJio | Proactive credits (shown in Buddy), loyalty offers, churn signal detection |
| **Network Agent** | (horizontal) | QoS data feeds into every scenario's Signal layer — visible as latency/quality metrics |

**Token Network as Horizontal Layer:**
Every trace shows token cost: `"8 tok · Edge SLM"` or `"35 tok · Core LLM"`. This maps to Jio's signal layer (Usage & Plan DNA) and demonstrates the split inference model (Edge SLM for simple queries, Core LLM for complex reasoning).

**Metrics strip per scenario (maps to Jio's intelligence layer):**

| Scenario | Metrics | Source |
|----------|---------|--------|
| Home | Token Bal / Tok/min / Edge% / Cost/Tok | Plan Agent + Token Network |
| Commerce | Stores / Delivery / Voice% / Basket | Upsell Agent + Commerce Platform |
| Support | Confidence / Resolve / Handle Time / CSAT | Care Agent + Customer Ops Platform |
| Finance | Fraud Score / Txn/s / Block% / UPI OK | Risk model + Finance Platform |

**Session context line** below model name shows which agent is active:
- Home: "AI Plus tier — split inference active"
- Commerce: "Agentic order — Hindi voice → Gupta General Store"
- Support: "Intent: network_diagnostics — Hindi/English"
- Finance: "Risk level: Low — UPI transaction verified"

---

## Panel 3: Dashboard = 10 AI Platforms (Outcome Delivery)

### Jio's Vision (Slide 14)
> "Each platform delivers an outcome that delivers measurable enterprise value."

10 platforms from Infra & Network Build to Data & Digital Enablement.

### How Our Demo Shows This

**Stat cards = platform KPIs per scenario:**

| Scenario | Card 1 | Card 2 | Card 3 | Card 4 | Jio Platforms Shown |
|----------|--------|--------|--------|--------|-------------------|
| **Home** | Token Consumption 1.2M/hr | Avg Token Cost ₹0.003 | Edge vs Core 78% | Token Revenue ₹4.2Cr/day | #10 Data & Digital, #9 Innovation |
| **Commerce** | Daily Orders 2.4M | Stores Active 3.4L | Avg Delivery 22min | Daily GMV ₹84Cr | #5 Customer Acquisition, #6 Supply Chain |
| **Support** | Active Sessions 84K | Resolution Rate 89.4% | Handle Time 2.4min | CSAT 4.6/5 | #4 Customer Operations |
| **Finance** | Transactions/s 12.4K | Fraud Blocked ₹8.2Cr | False Positive 0.3% | UPI Success 99.7% | #7 Finance |

**Cluster Map = Offer Embedding Space:**
Shows where Buddy's agents are placing customers relative to available offers. Vasco (the dot) drifts through offer-space based on accumulated actions. When he gets close to an offer, it glows "Recommended" — this is the **Upsell Agent** and **Plan Agent** at work.

Different offers per scenario demonstrate how each platform's product catalog adapts:
- Home: AI Lite / AI Plus / AI Family plans + Token Boosters (Platform #9, #10)
- Commerce: Digital Catalogue / Smart Sourcing / Voice Ordering / Delivery (Platform #5, #6)
- Support: Speed Test Fix / Plan Upgrade Assist / Network Diagnostics (Platform #3, #4)
- Finance: UPI Cashback / Credit Line / Mutual Fund SIP / Insurance (Platform #7)

**Platform Activity Feed** shows real-time cross-user activity — Vasco highlighted in blue among other users (Priya M., Arjun K., etc.). This represents the platform-level observability from Jio's System of Operations & Observability (#10 in DFC).

---

## The Accenture Value-Add Story

### What Jio Has (from their slides)
- DFC: 12 composable systems, API-based, real-time, close-looped
- Data: 320B events, 500M subs, 180K+ attributes in Databricks
- Agents: 5 specialist agents orchestrated by MCP on Mosaic AI
- Vision: Buddy for Life — accumulated context over years
- Platforms: 10 AI platforms covering entire business

### What Accenture Brings (from our presentations)

| Accenture Capability | Mapped to Demo |
|---------------------|----------------|
| **Token Network** (presentation) | Home screen: token balance, AI tiers, split inference visible in every trace |
| **Kirana Network** (presentation) | Commerce tab: voice ordering, Gupta General Store, agentic basket assembly, rider dispatch |
| **Guardian Mesh** (presentation) | Support tab: voice parental controls, Guardian Mesh card, policy enforcement at network level |
| **MVNO-as-a-Service** (presentation) | (Future tab — brand partnerships, fan packages. Not in current 4 tabs but referenced in presentation) |
| **Agent Platform** (presentation) | The AI Layer IS the agent platform — MCP orchestration, multi-agent traces, tool-use visible |
| **US Market Knowledge** | The export story — how these agents map to Verizon/T-Mobile/Comcast archetypes |
| **Horizon 2-3 Acceleration** | Browser agent demo (negotiation), voice-to-policy, agent-to-agent commerce |

### Accenture's Posture: Flexible to What Bites
The 5 taster presentations (Token Network, Kirana, Guardian Mesh, MVNO, Agent Platform) are probes, not commitments. The demo's 4 tabs mirror that flexibility — if Jio bites hardest on Commerce, we double down on Kirana. If Guardian Mesh gets energy, HelloJio becomes the lead tab. If Token Network resonates as the platform play, the horizontal token layer becomes the story. The architecture is deliberately modular so we can pivot the emphasis overnight based on what lands today.

### The Gap We Fill
Jio has the infra and the 5 agents. We showed:
1. **Consumer-facing agent interactions** they don't have yet (voice ordering, smart basket, fraud auto-block)
2. **Cross-service orchestration** through Buddy (one user moving across commerce, support, finance seamlessly)
3. **The token economics layer** that monetizes every AI interaction (ARPU → ARPT)
4. **New business models** (MVNO brand partnerships, kirana digital commerce)
5. **US market fit** — how these map to the specific needs of Verizon, T-Mobile, Comcast

---

## Presentation Flow Suggestion

When Mark presents the demo:

**1. Start on MyJio Home tab.**
"This is Buddy. One customer — Vasco. Buddy knows his tier (AI Plus), his token balance, his usage. Every service shows what it costs in AI tokens. Voice is the primary input."

**2. Tap services, show AI layer animating.**
"Every tap triggers the 4-layer stack. Signal → Intelligence → Orchestration → Action. You can see which model ran, how many tokens it consumed, whether it hit Edge SLM or Core LLM."

**3. Switch to Smart Commerce.**
"Buddy becomes a commerce agent. Voice ordering — 'I need vegetables under 500 rupees.' The pipeline shifts: Voice → Extract → Search → Assemble → Dispatch. The Care Agent becomes the Upsell Agent. Same architecture, different application."

**4. Switch to HelloJio.**
"Buddy as support + guardian. Interactive chat with NLU confidence. Quick replies trigger real responses. And here — Guardian Mesh. 'Block games after 10pm for Ananya.' Voice-to-policy, enforced at the network level."

**5. Switch to JioFinance.**
"Buddy protecting your money. Fraud alert — unusual transaction blocked before you even know. Risk dots on every transaction. AI expense insights. The Finance Agent scores every transaction in <25ms."

**6. Point to Dashboard throughout.**
"The stat cards change per scenario because each scenario maps to different Jio AI Platforms. The cluster map shows where Buddy's agents are positioning this customer in offer-space. The activity feed shows this happening at scale — not just Vasco, but 500 million subscribers."

---

## Key Numbers to Reference

| Stat | Source | Use in demo |
|------|--------|-------------|
| 500M subscribers | Jio (GridX slide) | "This is one of 500 million" |
| 320B events/day | Jio (GridX slide) | "Every tap adds to the 320 billion daily events" |
| 180K+ attributes | Jio (Agentic AI slide) | "The intelligence layer draws from 180K attributes" |
| 147M micro-grids | Jio (GridX slide) | "Network Agent has visibility into 147M micro-grids" |
| 5 specialist agents | Jio (Agentic AI slide) | "Plan, Network, Retention, Care, Upsell — all via MCP" |
| 3.8L RCF actions/day | Jio (DFC slide) | "3.8 lakh autonomous root-cause fixes per day" |
| 13Cr+ kirana stores | Accenture (Kirana presentation) | "13 crore stores, 82% shifting to quick-commerce" |
| 1,300Cr+ UPI/month | Accenture (Kirana presentation) | "1,300 crore UPI transactions monthly" |
| $3-5T agentic commerce by 2030 | Accenture (Kirana presentation, McKinsey) | "McKinsey projects $3-5 trillion" |

---

## Jio's Design Principles (from DFC slide)

Our demo follows all 6:
1. **Loosely Coupled** — each panel is independent, scenario-driven data
2. **Modular** — swap scenario, everything changes (pipeline, metrics, offers, screens)
3. **Composable** — same trace/pipeline UI, different agents per scenario
4. **API based** — every phone tap = API call, trace shows the API chain
5. **Real time data** — live metrics, streaming events, animated pipeline
6. **Close looped** — action on phone → AI processes → dashboard updates → new offer appears

---

## Quotes to Drop During Presentation

**When showing Buddy:**
> "Most services forget you the moment the call ends. Jio Buddy never does." (Jio's own slide)

**When showing token cost on traces:**
> "You came for the data. You'll stay for the tokens." (Our Token Network presentation)

**When showing Commerce:**
> "Your shop, now digital, with Jio." (Our Kirana presentation)

**When showing Guardian Mesh in HelloJio:**
> "Block games after 10pm for Ananya, allow school apps and family WhatsApp." (Our Guardian Mesh demo)

**When pointing to Dashboard:**
> "Each platform delivers an outcome that delivers measurable enterprise value." (Jio's own slide)

**When asked about US relevance:**
> "This is a replacement market. The question is: can you replace with something that's already proven at 500M scale?" (Dan Rice's market analysis + Jio's scale)
