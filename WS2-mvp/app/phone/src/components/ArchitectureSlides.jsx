import { useState } from 'react'

// LiveKit SVG palette — light mode
const C = {
  transport: { bg: '#F1F5FE', border: '#598DFC', accent: '#598DFC', text: '#1D4FCC', dim: '#9BB8F7' },
  brain:     { bg: '#FFFBF0', border: '#F9AE1F', accent: '#D4940A', text: '#7A6200', dim: '#E0C96A' },
  tools:     { bg: '#F8F1FD', border: '#D479F9', accent: '#B456D6', text: '#7B2D9E', dim: '#DDB3F5' },
  future:    { bg: '#F9F9F9', border: '#CDCDCD', accent: '#AAA',    text: '#888',    dim: '#CCC' },
}

// Step number badge
function Step({ n, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 18, height: 18, borderRadius: '50%',
      background: color, color: '#fff',
      fontSize: 9, fontWeight: 700, flexShrink: 0,
    }}>{n}</span>
  )
}

// Swap indicator
function Swap() {
  return <span title="Swappable provider" style={{ fontSize: 9, color: '#598DFC', marginLeft: 3, cursor: 'help', fontWeight: 600 }}>&#x27F2;</span>
}

// Node card
function Node({ step, label, provider, latency, color, swappable, onClick, active, future, small }) {
  const [hov, setHov] = useState(false)
  const hi = hov || active
  const c = future ? C.future : (color || C.transport)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: small ? '7px 10px' : '10px 14px',
        borderRadius: 8,
        background: hi ? c.bg : '#FDFDFC',
        border: `1px ${future ? 'dashed' : 'solid'} ${hi ? c.border : '#D5D5D5'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        minWidth: small ? 70 : 90,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: provider ? 4 : 0 }}>
        {step && <Step n={step} color={c.accent} />}
        <span style={{ fontSize: small ? 10 : 11, fontWeight: 600, color: hi ? c.text : '#333' }}>{label}</span>
      </div>
      {provider && (
        <div style={{ fontSize: 8, color: '#999', marginLeft: step ? 24 : 0 }}>
          {provider}{swappable && <Swap />}
        </div>
      )}
      {latency && (
        <div style={{ fontSize: 8, color: '#C0C0C0', marginLeft: step ? 24 : 0, marginTop: 1 }}>{latency}</div>
      )}
    </div>
  )
}

// Section box
function Section({ children, color, label, sublabel, style = {} }) {
  return (
    <div style={{
      background: color.bg, border: `1px solid ${color.border}`,
      borderRadius: 10, padding: '14px 18px', ...style,
    }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: color.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
          {sublabel && <span style={{ fontSize: 9, color: '#AAA' }}>{sublabel}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

// Arrow
function Arrow({ direction = 'down', label, color = '#B2B2B2' }) {
  if (direction === 'right') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0 4px', flexShrink: 0 }}>
        <svg width="24" height="10" viewBox="0 0 24 10">
          <line x1="0" y1="5" x2="18" y2="5" stroke={color} strokeWidth="1" />
          <polyline points="16,2 20,5 16,8" stroke={color} strokeWidth="1.2" fill="none" />
        </svg>
        {label && <span style={{ fontSize: 7, color: '#BBB', whiteSpace: 'nowrap' }}>{label}</span>}
      </div>
    )
  }
  if (direction === 'bidir') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0 4px', flexShrink: 0 }}>
        <svg width="28" height="10" viewBox="0 0 28 10">
          <line x1="4" y1="5" x2="24" y2="5" stroke={color} strokeWidth="1" />
          <polyline points="6,2 2,5 6,8" stroke={color} strokeWidth="1.2" fill="none" />
          <polyline points="22,2 26,5 22,8" stroke={color} strokeWidth="1.2" fill="none" />
        </svg>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '3px 0' }}>
      {label && <span style={{ fontSize: 7, color: '#BBB' }}>{label}</span>}
      <svg width="10" height="18" viewBox="0 0 10 18">
        <line x1="5" y1="0" x2="5" y2="14" stroke={color} strokeWidth="1" strokeDasharray="3,2" />
        <polyline points="2,12 5,16 8,12" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  )
}

// Dotted connection for future nodes
function FutureArrow({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
      <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="#CCC" strokeWidth="1" strokeDasharray="2,2" /></svg>
      {label && <span style={{ fontSize: 7, color: '#CCC' }}>{label}</span>}
    </div>
  )
}

const NODE_DETAILS = {
  stt: { title: '1. Speech-to-Text (Ears)', layer: 'LiveKit Transport', layerColor: C.transport.accent, current: 'Google Cloud Speech API\nStreaming recognition', alternatives: ['Sarvam Saaras V3 (Hindi/Marathi native)', 'Deepgram Nova-3 (fastest English)', 'Azure Speech (enterprise SLA)'], swap: 'STT_PROVIDER env var', tracing: 'LiveKit Cloud — audio replay, word-level timing', notes: 'Runs inside LiveKit pipeline. Swap by changing one env var. Streaming interim results enable instant transcript display in the UI. Part of the Ears layer — swappable independently of the orchestration layer.' },
  router: { title: '2. Intent Router + Filler', layer: 'Orchestration Layer', layerColor: C.brain.accent, current: 'Gemini 2.5 Flash-Lite\n290ms classify + 280ms filler', alternatives: ['Groq Llama 3.3 (sub-100ms)', 'Keyword classifier (0ms, deterministic)', 'Claude Haiku (strong reasoning)'], swap: 'ROUTER_LLM env var', tracing: 'LangSmith — classify_intent + generate_filler spans', notes: 'Routes: troubleshoot | plan | complaint | greeting. Filler generated from last 4 messages for natural context. Streams filler to TTS immediately via FlushSentinel — customer hears acknowledgment in under 600ms while the agent reasons. New routes added by extending the classifier prompt.' },
  agent: { title: '3. Agent (Reasoning + Tools)', layer: 'Orchestration Layer', layerColor: C.brain.accent, current: 'Gemini 2.5 Flash\n11 tools bound · ~1.2s per turn', alternatives: ['Claude Sonnet 4 (empathetic complaints)', 'GPT-4o (strong tool calling)', 'Groq Llama (fast, weaker reasoning)'], swap: 'AGENT_LLM env var', tracing: 'LangSmith — agent node, tool_calls, prompt + response', notes: 'Loops Agent → Tools → Agent until done. System prompt selected by route (plan.md, troubleshoot.md, complaint.md). Architecture supports N sub-agents. Add a route + system prompt to create a new specialist. LLM can be swapped per-route.' },
  tools: { title: '4. Tools', layer: 'Orchestration Layer', layerColor: C.tools.accent, current: 'RAG: Vertex AI (500ms warm, 4-14s cold)\nDiagnostics: Mocked (<10ms each)\n11 today — extensible to N', alternatives: ['Local FAISS for RAG (<50ms)', 'Jio OSS APIs (real diagnostics)', 'Jio CRM + Billing APIs'], swap: 'Replace tool function implementations', tracing: 'LangSmith — individual tool spans with query + results', notes: '11 tools: rag_search, search_plans, get_plan_details, get_customer_profile, check_connection, run_speed_test, check_router_health, restart_router, check_device_count, log_complaint, check_complaint_status. Add any tool by implementing the function interface. Agent discovers tools at runtime.' },
  extract: { title: '5. Voice State Extract', layer: 'Orchestration Layer', layerColor: C.brain.accent, current: 'Pure Python · 0ms\nDeterministic — no LLM', alternatives: ['N/A — deterministic by design'], swap: 'N/A', tracing: 'LangSmith — extract node span', notes: 'Reads the agent\'s last AIMessage → voice_instructions. Collects ToolMessages → voice_data. The bridge between graph reasoning and voice synthesis. Never speaks directly.' },
  synthesis: { title: '6. Voice Synthesis', layer: 'Orchestration Layer (outside graph)', layerColor: C.brain.accent, current: 'Gemini 2.5 Flash-Lite\n280ms TTFT · LangChain .stream()', alternatives: ['Claude (natural phrasing)', 'GPT-4o (instruction following)', 'Groq (sub-100ms TTFT)'], swap: 'SYNTHESIS_LLM env var', tracing: 'LangSmith — voice_synthesis span', notes: 'Max 2 sentences. Numbers in word form. Matches customer language. If filler was spoken, continues naturally from it. Runs outside graph for true token-by-token streaming via asyncio.Queue bridge.' },
  tts: { title: '7. Text-to-Speech (Mouth)', layer: 'LiveKit Transport', layerColor: C.transport.accent, current: 'Google Cloud TTS\ngemini-2.5-flash-tts · Streaming', alternatives: ['Sarvam Bulbul V3 (best Hindi)', 'ElevenLabs (voice cloning)', 'Azure Neural TTS'], swap: 'TTS_PROVIDER env var', tracing: 'LiveKit Cloud — TTS latency, segment boundaries', notes: 'Sentence tokenizer buffers text until period/pause. FlushSentinel splits filler from answer into separate TTS segments so filler plays immediately. Part of the Mouth layer — receives streaming tokens from any node that yields speech.' },
  memory: { title: 'Customer Memory', layer: 'Future — connects to Agent', layerColor: C.future.accent, current: 'Not yet implemented', alternatives: ['Firestore (serverless)', 'AlloyDB + pgvector', 'Agent Engine Memory Bank'], swap: 'Add memory node to graph before/after agent', tracing: 'Would trace via LangSmith', notes: 'Three memory types: interaction memory (what happened in past calls), emotional memory (NPS trend, sentiment), commitment memory (promises made — "we\'ll credit you"). Read before agent, write after extract. Persists across sessions.' },
  signals: { title: 'Signal Pipeline', layer: 'Future — triggers Router', layerColor: C.future.accent, current: 'Pub/Sub simulator + processor built\nNot yet connected to graph', alternatives: ['Databricks streaming', 'Dataflow (Apache Beam)', 'Direct Pub/Sub → Cloud Run'], swap: 'Connect trigger.py to graph.ainvoke()', tracing: 'Cloud Monitoring + LangSmith', notes: 'Proactive outreach: network drop detected → pipeline enriches signal → triggers graph with context → agent calls customer. 6 scenario types built. Shadow mode: log decisions without calling. Bypasses STT, enters at router.' },
  guardrails: { title: 'Guardrails', layer: 'Future — wraps Synthesis', layerColor: C.future.accent, current: 'Not yet implemented', alternatives: ['NeMo Guardrails', 'Custom policy engine', 'LLM-as-judge'], swap: 'Add guardrail node after synthesis in llm_node', tracing: 'LangSmith — guardrail check span', notes: 'Exposure ladder: how much to reveal per turn. Frequency caps: don\'t offer same plan twice. Compliance: block PII in responses. Tone check: empathy scoring. Would sit between synthesis output and TTS yield.' },
}

export default function ArchitectureSlides({ onBack }) {
  const [selected, setSelected] = useState(null)
  const detail = selected ? NODE_DETAILS[selected] : null

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#FDFDFC',
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
      color: '#070707', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 28px', borderBottom: '1px solid #E8E8E8', flexShrink: 0, background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.04em' }}>jio</span>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Agentic Spine</span>
          <span style={{ fontSize: 9, color: '#BBB', marginLeft: 8 }}>System Architecture  ·  April 2026</span>
        </div>
        {onBack && (
          <button onClick={onBack} style={{
            background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 6,
            padding: '5px 14px', color: '#666', fontSize: 11, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Back to Demo</button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main diagram */}
        <div style={{ flex: 1, padding: '16px 28px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* AGENTIC SPINE — the OODA loop wrapper */}
          <div style={{
            border: '2px solid #0F3CC9', borderRadius: 12,
            padding: '10px 14px 14px', background: 'rgba(15,60,201,0.015)',
            display: 'flex', flexDirection: 'column', gap: 6, flex: 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#0F3CC9', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agentic Spine</span>
                <span style={{ fontSize: 9, color: '#8899CC' }}>Observe — Orient — Decide — Act</span>
              </div>
              <span style={{ fontSize: 8, color: '#AAC' }}>Ears (STT) — Brain (Orchestration) — Mouth (TTS)</span>
            </div>

          {/* TRANSPORT — compact strip */}
          <Section color={C.transport} label="LiveKit Transport" sublabel="Open source · Self-hostable · Swappable transport layer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#0F3CC9', opacity: 0.4, letterSpacing: '0.1em' }}>OBSERVE</span>
                <Node step="1" label="STT" provider="Google Speech" latency="~100ms stream" color={C.transport} swappable onClick={() => setSelected('stt')} active={selected === 'stt'} />
              </div>
              <Arrow direction="right" label="text" />
              <div style={{
                flex: 1, padding: '8px 14px', borderRadius: 8,
                border: `1px solid ${C.transport.border}`, background: '#F7FAFF',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.transport.text }}>llm_node()</div>
                  <div style={{ fontSize: 8, color: C.transport.dim }}>Agent.llm_node() override — graph + synthesis inside</div>
                </div>
                <div style={{ fontSize: 8, color: C.transport.dim, textAlign: 'right' }}>
                  VAD: Silero · Turn: Multilingual · Interrupts: Adaptive
                </div>
              </div>
              <Arrow direction="right" label="tokens" />
              <Node step="7" label="TTS" provider="Google TTS" latency="~200ms stream" color={C.transport} swappable onClick={() => setSelected('tts')} active={selected === 'tts'} />
            </div>
            {/* Streaming explainer — two paths */}
            <div style={{
              marginTop: 8, padding: '8px 14px', borderRadius: 6,
              background: 'rgba(89,141,252,0.06)', border: '1px solid rgba(89,141,252,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <svg width="16" height="10" viewBox="0 0 16 10">
                  <path d="M2,5 Q5,2 8,5 Q11,8 14,5" stroke="#598DFC" strokeWidth="1.2" fill="none" />
                </svg>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#598DFC' }}>Live Streaming — no node waits for the next</span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 8, fontWeight: 600, color: '#598DFC' }}>Path 1</span>
                  <span style={{ fontSize: 8, color: '#8AB' }}>Router generates filler → streams to TTS immediately while agent thinks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 8, fontWeight: 600, color: '#598DFC' }}>Path 2</span>
                  <span style={{ fontSize: 8, color: '#8AB' }}>Synthesis generates tokens → each token streams to TTS as produced</span>
                </div>
              </div>
            </div>
          </Section>

          <Arrow label="graph.astream(stream_mode='updates')" />

          {/* ORCHESTRATION LAYER — external systems feed in, LangGraph is the graph */}
          <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'stretch' }}>

            {/* LEFT: External inputs — Signals / Pub/Sub */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', minWidth: 120 }}>
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                border: '1px dashed #CDCDCD', background: '#F9F9F9',
                cursor: 'pointer',
              }} onClick={() => setSelected('signals')}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 4 }}>Signal Pipeline</div>
                <div style={{ fontSize: 8, color: '#999', marginBottom: 6 }}>Google Pub/Sub</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Network drops', 'Billing events', 'App behaviour', 'Device telemetry'].map(s => (
                    <span key={s} style={{ fontSize: 7, color: '#AAA', padding: '1px 0' }}>{s}</span>
                  ))}
                </div>
                <div style={{ fontSize: 7, color: '#BBB', marginTop: 6, fontStyle: 'italic' }}>
                  Detect before customer notices
                </div>
              </div>

              <div style={{
                padding: '10px 12px', borderRadius: 8,
                border: '1px dashed #CDCDCD', background: '#F9F9F9',
                cursor: 'pointer',
              }} onClick={() => setSelected('memory')}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 4 }}>Customer Memory</div>
                <div style={{ fontSize: 8, color: '#999', marginBottom: 6 }}>Firestore / AlloyDB</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Interaction history', 'Emotional state (NPS)', 'Commitments made'].map(s => (
                    <span key={s} style={{ fontSize: 7, color: '#AAA' }}>{s}</span>
                  ))}
                </div>
                <div style={{ fontSize: 7, color: '#BBB', marginTop: 6, fontStyle: 'italic' }}>
                  Read before, write after each turn
                </div>
              </div>
            </div>

            {/* ARROWS: external → graph */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
              <Arrow direction="right" label="trigger" />
              <Arrow direction="bidir" />
            </div>

            {/* CENTER: LangGraph orchestration */}
            <Section color={C.brain} label="Orchestration Layer" sublabel="Framework-agnostic · Per-node LLM selection · LangSmith traced" style={{ flex: 1, position: 'relative' }}>

              {/* LangGraph badge */}
              <div style={{
                position: 'absolute', top: 10, right: 18,
                padding: '3px 10px', borderRadius: 10,
                border: '1px solid #F9AE1F', background: '#FFFBF0',
                fontSize: 8, fontWeight: 700, color: C.brain.accent, letterSpacing: '0.04em',
              }}>LangGraph</div>

              {/* Main flow: Router → Agent ↔ Tools */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>

                {/* Router */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: '#0F3CC9', opacity: 0.4, letterSpacing: '0.1em' }}>ORIENT</span>
                  <Node step="2" label="Router" provider="Flash-Lite" latency="290ms" color={C.brain} swappable onClick={() => setSelected('router')} active={selected === 'router'} />
                  <div style={{ padding: '4px 10px', borderRadius: 4, background: '#FFF6DC', border: '1px solid #F9D86C', fontSize: 8, color: '#A07D00', fontWeight: 600 }}>
                    streams filler to TTS (280ms)
                  </div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {['troubleshoot', 'plan', 'complaint', 'greeting'].map(r => (
                      <span key={r} style={{
                        fontSize: 7, padding: '2px 5px', borderRadius: 3,
                        background: '#FFF9EA', border: '1px solid #F0DFA0', color: '#A07D00',
                      }}>{r}</span>
                    ))}
                  </div>
                </div>

                <Arrow direction="right" />

                {/* Agent */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: '#0F3CC9', opacity: 0.4, letterSpacing: '0.1em' }}>DECIDE</span>
                  <Node step="3" label="Agent" provider="Flash" latency="~1.2s" color={C.brain} swappable onClick={() => setSelected('agent')} active={selected === 'agent'} />
                  <div style={{ fontSize: 8, color: C.brain.dim }}>N sub-agents -- prompt per route</div>
                </div>

                <Arrow direction="bidir" />

                {/* Tools */}
                <Section color={C.tools} label="Tools" sublabel="N tools -- extensible" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Node label="rag_search" provider="Vertex AI" latency="500ms" color={C.tools} swappable small onClick={() => setSelected('tools')} active={selected === 'tools'} />
                    <Node label="check_connection" provider="API" color={C.tools} small onClick={() => setSelected('tools')} />
                    <Node label="run_speed_test" provider="API" color={C.tools} small onClick={() => setSelected('tools')} />
                    <Node label="search_plans" provider="API" color={C.tools} small onClick={() => setSelected('tools')} />
                    <Node label="log_complaint" provider="API" color={C.tools} small onClick={() => setSelected('tools')} />
                    <div style={{
                      padding: '7px 10px', borderRadius: 8,
                      border: '1px dashed #D479F9', background: '#FDFAFF',
                      fontSize: 9, color: '#B456D6', fontWeight: 500,
                    }}>+ N more</div>
                  </div>
                </Section>
              </div>

              {/* Extract → Synthesis → tokens out */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 8,
                background: 'rgba(249,174,31,0.04)', border: '1px solid rgba(249,174,31,0.12)',
              }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#0F3CC9', opacity: 0.4, letterSpacing: '0.1em', marginRight: 2 }}>ACT</span>
                <Node step="5" label="Extract" provider="Python · 0ms" color={C.brain} onClick={() => setSelected('extract')} active={selected === 'extract'} />
                <Arrow direction="right" />
                <Node step="6" label="Synthesis" provider="Flash-Lite" latency="280ms TTFT" color={C.brain} swappable onClick={() => setSelected('synthesis')} active={selected === 'synthesis'} />
                <Arrow direction="right" />
                <Node label="Guardrails" provider="Policy engine" color={C.future} future small onClick={() => setSelected('guardrails')} active={selected === 'guardrails'} />
                <Arrow direction="right" color={C.transport.accent} />
                <div style={{
                  padding: '6px 12px', borderRadius: 6,
                  background: C.transport.bg, border: `1px solid ${C.transport.border}`,
                  fontSize: 9, fontWeight: 600, color: C.transport.text,
                }}>
                  token stream → TTS
                </div>
              </div>

              {/* Streaming note */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 10 }}>
                {['Any graph node can yield speech to TTS mid-pipeline', 'FlushSentinel = immediate TTS without waiting', 'Token-by-token streaming via asyncio.Queue bridge'].map(t => (
                  <span key={t} style={{ fontSize: 8, color: C.brain.dim }}>{t}</span>
                ))}
              </div>
            </Section>

          </div>

          </div>
          {/* end Agentic Spine wrapper */}

          {/* KEY */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 24, padding: '8px 0', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: '1px solid #598DFC', background: '#F1F5FE' }} />
              <span style={{ fontSize: 9, color: '#888' }}>Transport</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: '1px solid #F9AE1F', background: '#FFFBF0' }} />
              <span style={{ fontSize: 9, color: '#888' }}>Orchestration</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: '1px solid #D479F9', background: '#F8F1FD' }} />
              <span style={{ fontSize: 9, color: '#888' }}>Tools</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: '1px dashed #CCC', background: '#F9F9F9' }} />
              <span style={{ fontSize: 9, color: '#888' }}>Future</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#598DFC' }}>&#x27F2;</span>
              <span style={{ fontSize: 9, color: '#888' }}>Swappable -- STT, TTS, LLMs, RAG</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Step n="N" color="#CCC" />
              <span style={{ fontSize: 9, color: '#888' }}>Pipeline step</span>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div style={{
          width: 300, borderLeft: '1px solid #E8E8E8',
          padding: '20px', overflow: 'auto', background: '#FAFAFA',
        }}>
          {detail ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#070707', marginBottom: 4 }}>{detail.title}</div>
              <div style={{ fontSize: 10, color: detail.layerColor || '#999', marginBottom: 16, fontWeight: 500 }}>{detail.layer}</div>

              <Label>Current</Label>
              <div style={{
                fontSize: 10, color: '#444', marginBottom: 16, lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace", whiteSpace: 'pre-line',
              }}>{detail.current}</div>

              <Label>Swap To</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {detail.alternatives.map(a => (
                  <div key={a} style={{
                    fontSize: 10, padding: '6px 10px', borderRadius: 5,
                    background: '#fff', border: '1px solid #E8E8E8', color: '#555', lineHeight: 1.4,
                  }}>{a}</div>
                ))}
              </div>

              <div style={{
                fontSize: 9, color: '#AAA', marginBottom: 16,
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              }}>{detail.swap}</div>

              <Label>Tracing</Label>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>{detail.tracing}</div>

              <Label>Notes</Label>
              <div style={{ fontSize: 10, color: '#666', lineHeight: 1.7 }}>{detail.notes}</div>
            </>
          ) : (
            <div style={{ paddingTop: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#BBB', marginBottom: 8, fontWeight: 500 }}>Select a component</div>
              <div style={{ fontSize: 10, color: '#D0D0D0', lineHeight: 1.7, padding: '0 16px' }}>
                Every layer is swappable. Click any node to see its current provider, alternatives, and how to swap it.
              </div>
              <div style={{
                marginTop: 20, padding: '12px 16px', borderRadius: 8,
                background: '#F5F7FF', border: '1px solid #E0E6F5',
                textAlign: 'left', fontSize: 9, color: '#667', lineHeight: 1.8,
              }}>
                <div style={{ fontWeight: 700, color: '#555', marginBottom: 4 }}>The Spine</div>
                Observe (STT) — Orient (Router) — Decide (Agent) — Act (Synthesis + TTS).
                Framework-agnostic OODA loop. N agents, N tools, all providers swappable.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {children}
    </div>
  )
}
