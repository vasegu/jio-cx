import { useState } from 'react'

const SLIDES = [
  // Slide 1: Title
  {
    title: 'Agentic Spine',
    subtitle: 'Voice-First CX Operating System',
    content: (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', marginBottom: 8 }}>
          jio
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 40 }}>
          Home Broadband Division
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', maxWidth: 400, margin: '0 auto', lineHeight: 1.8 }}>
          A modular voice agent built on open-source infrastructure.
          Every component swappable. Every decision traceable.
          The brain is portable. The mouth is pluggable.
        </div>
      </div>
    ),
  },

  // Slide 2: Three layers
  {
    title: 'Three Layers, One Spine',
    subtitle: 'Transport · Brain · Voice',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 0' }}>
        {[
          {
            layer: 'Transport',
            tech: 'LiveKit (open source)',
            color: '#4CAF50',
            items: ['WebRTC audio transport', 'VAD + turn detection', 'Adaptive interruptions', 'Self-hostable on GKE'],
            swap: 'Swap to: Pipecat, Twilio, custom WebRTC',
          },
          {
            layer: 'Brain',
            tech: 'LangGraph (portable)',
            color: '#FFB74D',
            items: ['Deterministic routing', 'Tool calling (RAG, diagnostics, plans)', 'Voice separation pattern', 'Per-node model selection'],
            swap: 'Swap to: any orchestration framework — graph is pure Python',
          },
          {
            layer: 'Voice',
            tech: 'STT → Synthesis → TTS',
            color: '#6B8FFF',
            items: ['Google STT (swap to Sarvam for Hindi)', 'Gemini Flash-Lite synthesis', 'Google TTS (swap to ElevenLabs)', 'Contextual filler responses'],
            swap: 'Every provider swappable via env var',
          },
        ].map(layer => (
          <div key={layer.layer} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${layer.color}20`,
            borderLeft: `3px solid ${layer.color}`,
            borderRadius: 8, padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: layer.color }}>{layer.layer}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{layer.tech}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {layer.items.map(item => (
                <span key={item} style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 4,
                  background: `${layer.color}10`, color: `${layer.color}aa`,
                  border: `1px solid ${layer.color}15`,
                }}>
                  {item}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
              {layer.swap}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // Slide 3: The Graph
  {
    title: 'The Brain: LangGraph',
    subtitle: 'Deterministic routing, LLM reasoning, tool execution',
    content: (
      <div style={{ padding: '20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap', marginBottom: 24,
        }}>
          {[
            { node: 'STT', desc: 'Google Speech', color: '#4CAF50' },
            { node: 'Router', desc: 'Flash-Lite 300ms', color: '#FFB74D' },
            { node: 'Agent', desc: 'Flash + Tools', color: '#FF7043' },
            { node: 'RAG', desc: 'Vertex AI', color: '#CE93D8' },
            { node: 'Extract', desc: 'Python 0ms', color: '#78909C' },
            { node: 'Synthesis', desc: 'Flash-Lite 280ms', color: '#6B8FFF' },
            { node: 'TTS', desc: 'Google Speech', color: '#4CAF50' },
          ].map((n, i, arr) => (
            <div key={n.node} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `${n.color}15`, border: `1.5px solid ${n.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: n.color,
                }}>
                  {n.node}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                  {n.desc}
                </div>
              </div>
              {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { title: 'Voice Separation', desc: 'Graph nodes reason internally. Only the synthesis step speaks. Router text, tool calls, intermediate reasoning — none leak to audio.' },
            { title: 'Filler Responses', desc: 'Router generates a contextual acknowledgment in 300ms. User hears "Sure, let me check" while the graph thinks for 3-5 seconds.' },
            { title: 'Per-Node Models', desc: 'Router uses Flash-Lite (fast, no thinking). Agent uses Flash (reasoning). Synthesis uses Flash-Lite. Each swappable independently.' },
          ].map(card => (
            <div key={card.title} style={{
              flex: 1, padding: '12px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // Slide 4: Why this architecture
  {
    title: 'Why This Architecture',
    subtitle: 'Lessons from building the voice spine',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0' }}>
        {[
          {
            before: 'Gemini Live (monolith)',
            after: 'LiveKit + LangGraph (modular)',
            why: 'Gemini Live is a black box — can\'t debug latency, can\'t swap components, voice inconsistent between turns. 6s turns that crashed on turn 2.',
          },
          {
            before: 'ADK (Google locked)',
            after: 'LangGraph (portable)',
            why: 'ADK ties you to Gemini. LangGraph works with any LLM. The graph is pure Python — runs with LiveKit, Pipecat, or a CLI test harness.',
          },
          {
            before: 'LLM adapter pattern',
            after: 'Agent.llm_node() override',
            why: 'The adapter had no session access — couldn\'t do filler responses. llm_node gives us yield for streaming, session.say() for filler, full pipeline control.',
          },
          {
            before: 'All-in-one streaming',
            after: 'Voice separation + FlushSentinel',
            why: 'Graph internal text leaked to TTS (router said "ROUTE:plan" aloud). Voice separation: graph sets instructions, synthesis speaks. FlushSentinel enables filler before answer.',
          },
          {
            before: 'Gemini 2.5 Flash (thinking)',
            after: 'Flash-Lite (no thinking)',
            why: 'Flash\'s "thinking" adds 2-3s per call. Flash-Lite has 280ms TTFT for the same quality on routing and synthesis. 3 LLM calls per turn — every ms counts.',
          },
        ].map((lesson, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ minWidth: 120 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,80,80,0.6)', textDecoration: 'line-through', marginBottom: 2 }}>{lesson.before}</div>
              <div style={{ fontSize: 10, color: '#6B8FFF', fontWeight: 600 }}>{lesson.after}</div>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, flex: 1 }}>
              {lesson.why}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // Slide 5: Performance
  {
    title: 'Performance Journey',
    subtitle: 'From 20s to 500ms perceived latency',
    content: (
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { config: 'Gemini Live', ttft: '6.0s', filler: '—', notes: 'Crashed on turn 2', color: '#ff5252' },
            { config: 'LiveKit + LangGraph v1', ttft: '13.5s', filler: '—', notes: '3 batched tokens', color: '#ff7043' },
            { config: 'Flash-Lite + EU region', ttft: '3.4s', filler: '—', notes: 'True streaming', color: '#FFB74D' },
            { config: 'Filler + FlushSentinel', ttft: '3.4s', filler: '500ms', notes: 'User hears acknowledgment', color: '#66BB6A' },
            { config: 'Current (warm)', ttft: '3.3s', filler: '500ms', notes: 'Contextual filler + synthesis', color: '#4CAF50' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 14px', borderRadius: 6,
              background: i === 4 ? 'rgba(76,175,80,0.08)' : 'rgba(255,255,255,0.02)',
              border: i === 4 ? '1px solid rgba(76,175,80,0.2)' : '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 10, color: row.color, fontWeight: 600, minWidth: 160 }}>{row.config}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', minWidth: 60 }}>TTFT: {row.ttft}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>Filler: {row.filler}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', flex: 1 }}>{row.notes}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: 8,
          background: 'rgba(61,111,255,0.08)', border: '1px solid rgba(61,111,255,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6B8FFF' }}>500ms</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            perceived response time (filler) · 3.3s to full answer (warm)
          </div>
        </div>
      </div>
    ),
  },

  // Slide 6: What's next
  {
    title: 'Art of the Possible',
    subtitle: 'What the spine enables next',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 0' }}>
        {[
          {
            title: 'Proactive Mode',
            desc: 'Pub/Sub signals feed the same graph. Network drops → spine credits before they call.',
            status: 'Signal pipeline built. Graph ready. Connect them.',
            color: '#FF7043',
          },
          {
            title: 'Customer Memory',
            desc: 'Interaction, emotional, commitment memory persists across sessions.',
            status: 'Architecture defined. Firestore or AlloyDB.',
            color: '#CE93D8',
          },
          {
            title: 'Hindi / Marathi Voice',
            desc: 'Swap to Sarvam AI for native code-switching. One env var change.',
            status: 'Plugin installed. Sarvam API key needed.',
            color: '#4CAF50',
          },
          {
            title: 'Multi-Channel Output',
            desc: 'Same graph, different mouth. Voice → WhatsApp → SMS → Push.',
            status: 'Graph is channel-agnostic. Output routing is the next node.',
            color: '#6B8FFF',
          },
          {
            title: 'Exposure Ladder',
            desc: 'Shadow → Advisory → Controlled → Autonomous. Per-hypothesis.',
            status: 'Guardrails scaffold exists. Policy engine next.',
            color: '#FFB74D',
          },
        ].map(item => (
          <div key={item.title} style={{
            display: 'flex', gap: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            borderLeft: `3px solid ${item.color}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: item.color, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.25)', minWidth: 140,
              alignSelf: 'center', textAlign: 'right', fontStyle: 'italic',
            }}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

export default function ArchitectureSlides({ onBack }) {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]

  return (
    <div
      style={{
        height: '100%', width: '100%',
        background: 'linear-gradient(135deg, #060610 0%, #0a0a1a 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font)',
        color: '#fff',
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') setCurrent(c => Math.min(c + 1, SLIDES.length - 1))
        if (e.key === 'ArrowLeft') setCurrent(c => Math.max(c - 1, 0))
        if (e.key === 'Escape' && onBack) onBack()
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.04em' }}>jio</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>CX · Agentic Spine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            {current + 1} / {SLIDES.length}
          </span>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.5)',
                fontSize: 10, cursor: 'pointer',
              }}
            >
              Back to Demo
            </button>
          )}
        </div>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, padding: '24px 40px', overflow: 'auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
          {slide.title}
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 16px' }}>
          {slide.subtitle}
        </p>
        {slide.content}
      </div>

      {/* Navigation dots */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 0 20px',
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === current ? '#6B8FFF' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
