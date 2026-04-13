import { useState, useEffect, useRef } from 'react'

const LANGSMITH_URL = 'https://eu.smith.langchain.com/o/7e48788f-5872-4578-a229-4f3f90fc07d4/projects/p/42036c3a-32bc-4bf8-8b39-26c6e6eb45c4?timeModel=%7B%22duration%22%3A%221d%22%7D'
const LIVEKIT_CLOUD_URL = 'https://cloud.livekit.io/projects/p_5axl57e61bj/sessions'

export default function TracePanel({ events = [], agentState = 'disconnected', roomId = null }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  const stateColors = {
    speaking: '#3D6FFF',
    listening: '#4CAF50',
    thinking: '#FFB74D',
    connecting: '#9E9E9E',
    disconnected: '#666',
  }

  const stateColor = stateColors[agentState] || '#666'

  return (
    <div style={{
      width: 380, height: '100%',
      background: '#0c0c18',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: stateColor,
            boxShadow: `0 0 8px ${stateColor}`,
          }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'var(--font)' }}>
            Agent Spine
          </span>
          <span style={{
            fontSize: 9, padding: '2px 8px', borderRadius: 10,
            background: `${stateColor}20`, color: stateColor,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {agentState}
          </span>
        </div>

        {/* Stack info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
          <span>STT: Google</span>
          <span>TTS: Google</span>
          <span>LLM: Gemini Flash</span>
          <span>Router: Flash-Lite</span>
          <span>Region: europe-west1</span>
        </div>
      </div>

      {/* Graph flow — minimal node indicators */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Spine Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'stt', label: 'STT', swap: 'Google / Sarvam / Deepgram' },
            { id: 'router', label: 'Router', swap: 'Flash-Lite (swappable)' },
            { id: 'agent', label: 'Agent', swap: 'Flash (swappable)' },
            { id: 'tools', label: 'Tools', swap: 'RAG · Diagnostics · Plans' },
            { id: 'synthesis', label: 'Synthesis', swap: 'Flash-Lite (swappable)' },
            { id: 'tts', label: 'TTS', swap: 'Google / Sarvam / ElevenLabs' },
          ].map((node, i, arr) => (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={node.swap}>
              <div style={{
                padding: '4px 8px', borderRadius: 6,
                background: (node.id === 'agent' && agentState === 'thinking') ? 'rgba(255,183,77,0.15)'
                  : (node.id === 'synthesis' && agentState === 'speaking') ? 'rgba(61,111,255,0.15)'
                  : (node.id === 'stt' && agentState === 'listening') ? 'rgba(76,175,80,0.15)'
                  : 'rgba(255,255,255,0.03)',
                border: (node.id === 'agent' && agentState === 'thinking') ? '1px solid rgba(255,183,77,0.25)'
                  : (node.id === 'synthesis' && agentState === 'speaking') ? '1px solid rgba(61,111,255,0.25)'
                  : (node.id === 'stt' && agentState === 'listening') ? '1px solid rgba(76,175,80,0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s ease',
                fontSize: 9, fontWeight: 500,
                color: (node.id === 'agent' && agentState === 'thinking') ? '#FFB74D'
                  : (node.id === 'synthesis' && agentState === 'speaking') ? '#6B8FFF'
                  : (node.id === 'stt' && agentState === 'listening') ? '#66BB6A'
                  : 'rgba(255,255,255,0.35)',
              }}>
                {node.label}
              </div>
              {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          hover nodes for swappable providers
        </div>
      </div>

      {/* Live events */}
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', padding: '8px 16px',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Live Events
        </div>
        {events.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, padding: '8px 0' }}>
            Waiting for conversation...
          </div>
        )}
        {events.map((evt, i) => (
          <div key={i} style={{
            padding: '4px 0',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex', gap: 8,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', minWidth: 50, fontSize: 9 }}>
              {evt.time}
            </span>
            <span style={{
              color: evt.type === 'user' ? '#4CAF50'
                : evt.type === 'agent' ? '#6B8FFF'
                : evt.type === 'filler' ? '#FFB74D'
                : evt.type === 'tool' ? '#CE93D8'
                : evt.type === 'state' ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.5)',
              fontSize: 10,
            }}>
              {evt.type === 'state' && `◆ ${evt.text}`}
              {evt.type === 'user' && `You: ${evt.text}`}
              {evt.type === 'agent' && `Agent: ${evt.text}`}
              {evt.type === 'filler' && `⟡ filler: "${evt.text}"`}
              {evt.type === 'tool' && `⚙ ${evt.text}`}
              {evt.type === 'timing' && `⏱ ${evt.text}`}
              {!['state', 'user', 'agent', 'filler', 'tool', 'timing'].includes(evt.type) && evt.text}
            </span>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 8,
      }}>
        <a
          href={LANGSMITH_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: '8px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 9, textAlign: 'center', textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Open LangSmith
        </a>
        <a
          href={roomId ? `${LIVEKIT_CLOUD_URL}/${roomId}` : LIVEKIT_CLOUD_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: '8px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 9, textAlign: 'center', textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          LiveKit Cloud
        </a>
      </div>
    </div>
  )
}
