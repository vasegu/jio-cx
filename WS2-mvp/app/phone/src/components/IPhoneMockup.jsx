import { useState, useEffect, useRef, useCallback } from 'react'
import { useAgentEvents } from '../App'
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { RoomEvent } from 'livekit-client'

/* ---------- sub-app definitions ---------- */
const SUB_APPS = {
  home: {
    activeTab: 'Home',
    bottomTabs: [
      { icon: 'jio', label: 'Home' },
      { icon: 'mobile', label: 'Mobile' },
      { icon: 'fiber', label: 'Fiber' },
      { icon: 'finance', label: 'Finance' },
      { icon: 'play', label: 'Play' },
      { icon: 'cloud', label: 'Cloud' },
    ],
  },
}

/* ---------- AI badge ---------- */
const AiBadge = ({ text = 'AI' }) => (
  <span style={{
    fontSize: 8, fontWeight: 700, color: '#0F3CC9',
    background: '#0F3CC910', padding: '2px 6px',
    borderRadius: 4, letterSpacing: '0.04em',
    display: 'inline-flex', alignItems: 'center', gap: 3,
  }}>
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0F3CC9" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/>
    </svg>
    {text}
  </span>
)

/* ---------- tiny icon components ---------- */
const icons = {
  jio: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill={c}/>
      <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="var(--font)">jio</text>
    </svg>
  ),
  mobile: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18.01"/>
    </svg>
  ),
  fiber: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill={c}/>
    </svg>
  ),
  finance: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  play: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" fill={c} opacity="0.15"/>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  cloud: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  ),
  search: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  mic: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
  ),
  bell: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  qr: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3"/><path d="M20 14v7h-3"/></svg>
  ),
}

/* ---------- Service Grid items ---------- */
const SERVICES = [
  { key: 'mobile', title: 'MOBILE', sub: 'True5G speeds', color: '#0F3CC9' },
  { key: 'home_svc', title: 'HOME', sub: 'Fiber & AirFiber', color: '#0F3CC9' },
  { key: 'entertainment', title: 'ENTERTAINMENT', sub: 'TV, music & games', color: '#D9008D' },
  { key: 'finance_svc', title: 'FINANCE', sub: 'One-stop finance', color: '#00C853' },
  { key: 'aicloud', title: 'AICLOUD', sub: 'Easy backup', color: '#0F3CC9' },
  { key: 'shopping', title: 'SHOPPING', sub: 'Best deals', color: '#EFA73D' },
]

/* ---------- LiveKit config ---------- */
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://jiobuddy-y3inkf8x.livekit.cloud'
const TOKEN_URL = import.meta.env.VITE_TOKEN_URL || '/api/token'

/* ---------- Audio helpers ---------- */
function floatTo16BitPCM(float32Array) {
  const int16 = new Int16Array(float32Array.length)
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  return int16
}

function int16ToFloat32(int16Array) {
  const float32 = new Float32Array(int16Array.length)
  for (let i = 0; i < int16Array.length; i++) {
    float32[i] = int16Array[i] / 32768
  }
  return float32
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/* ---------- VoiceScreen (live agent via LiveKit) ---------- */
function VoiceScreen({ onClose }) {
  const [token, setToken] = useState(null)
  const tokenFetched = useRef(false)

  useEffect(() => {
    if (tokenFetched.current) return
    tokenFetched.current = true
    fetch(TOKEN_URL)
      .then(r => r.json())
      .then(d => setToken(d.token))
      .catch(e => console.error('[VoiceScreen] Token error:', e))
  }, [])

  if (!token) {
    return (
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0, bottom: 0, zIndex: 15,
        background: 'linear-gradient(180deg, #061654 0%, #0a1a3a 40%, #0d0d1a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)', fontSize: 13,
      }}>
        Connecting...
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0, zIndex: 15 }}>
      <LiveKitRoom
        serverUrl={LIVEKIT_URL}
        token={token}
        connect={true}
        audio={true}
        onDisconnected={() => {
          console.log('[VoiceScreen] Room disconnected')
          setToken(null)
          tokenFetched.current = false
        }}
        style={{ height: '100%', background: 'transparent' }}
      >
        <VoiceContent onClose={onClose} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}

function VoiceContent({ onClose }) {
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)
  const pendingUserMsgRef = useRef(null)
  const pendingAgentMsgRef = useRef(null)

  // Trace context — sends events to desktop trace panel
  const { addEvent, setAgentState: setAgentStateFn, setRoomId } = useAgentEvents()

  const agent = useVoiceAssistant()
  const agentState = agent?.state || 'connecting'
  const audioTrack = agent?.audioTrack

  // Push state changes to trace panel
  const prevState = useRef(agentState)
  useEffect(() => {
    if (agentState !== prevState.current) {
      setAgentStateFn(agentState)
      addEvent('state', agentState)
      prevState.current = agentState
    }
  }, [agentState])

  const room = useRoomContext()

  // Push room ID for trace links
  useEffect(() => {
    if (room?.sid) {
      setRoomId(room.sid)
    }
  }, [room?.sid])

  // Map agent state to our phase
  const phase = agentState === 'speaking' ? 'speaking'
    : agentState === 'thinking' ? 'thinking'
    : agentState === 'listening' ? 'listening'
    : agentState === 'connecting' ? 'connecting'
    : 'listening'

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  // Transcription handling via room events
  useEffect(() => {
    if (!room) return

    const handler = (segments, participant) => {
      const isAgent = participant?.identity?.startsWith('agent')
      for (const seg of segments) {
        const text = seg.text?.trim()
        if (!text) continue

        const from = isAgent ? 'agent' : 'user'
        const pendingRef = isAgent ? pendingAgentMsgRef : pendingUserMsgRef

        if (pendingRef.current !== null) {
          setMessages(prev => {
            const updated = [...prev]
            if (updated[pendingRef.current]) {
              updated[pendingRef.current] = { ...updated[pendingRef.current], text }
            }
            return updated
          })
        } else {
          setMessages(prev => {
            pendingRef.current = prev.length
            return [...prev, { from, text, ...(isAgent ? { tools: [] } : {}) }]
          })
        }

        if (seg.final) {
          pendingRef.current = null
          // Emit to trace panel
          addEvent(from, text)
        }
      }
    }

    room.on(RoomEvent.TranscriptionReceived, handler)
    return () => room.off(RoomEvent.TranscriptionReceived, handler)
  }, [room])

  const handleOrbTap = useCallback(() => {
    if (!room) return
    const isMuted = !room.localParticipant.isMicrophoneEnabled
    room.localParticipant.setMicrophoneEnabled(isMuted)
  }, [room])

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #061654 0%, #0a1a3a 40%, #0d0d1a 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font)',
    }}>
      {/* Visualizer + Status — top section */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 20px 0',
        '--lk-fg': '#3D6FFF',
        '--lk-va-bg': 'rgba(15,60,201,0.08)',
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: phase === 'speaking'
            ? 'radial-gradient(circle, rgba(15,60,201,0.25) 0%, transparent 70%)'
            : phase === 'listening'
            ? 'radial-gradient(circle, rgba(15,60,201,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(15,60,201,0.06) 0%, transparent 70%)',
          transition: 'background 0.6s ease',
          pointerEvents: 'none',
        }} />

        {/* Jio branding */}
        <div style={{
          fontSize: 22, fontWeight: 800, color: '#fff',
          letterSpacing: '0.08em', marginBottom: 2,
          fontFamily: 'var(--font)',
        }}>
          jio
        </div>
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16,
        }}>
          Home Assistant
        </div>

        {/* BarVisualizer — large, centered with glow ring */}
        <div style={{
          width: '100%', height: 100, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarVisualizer
            state={agentState}
            trackRef={audioTrack}
            barCount={7}
            style={{
              width: '85%', height: '100%',
              borderRadius: 16,
              background: 'transparent',
              gap: '6px',
              filter: phase === 'speaking'
                ? 'drop-shadow(0 0 12px rgba(61,111,255,0.4))'
                : 'drop-shadow(0 0 6px rgba(61,111,255,0.15))',
              transition: 'filter 0.4s ease',
            }}
          />
        </div>

        {/* Status pill */}
        <div style={{
          marginTop: 12, marginBottom: 8,
          padding: '4px 14px', borderRadius: 20,
          background: phase === 'speaking' ? 'rgba(15,60,201,0.2)'
            : phase === 'listening' ? 'rgba(255,255,255,0.06)'
            : phase === 'thinking' ? 'rgba(255,200,50,0.1)'
            : 'rgba(255,255,255,0.04)',
          border: phase === 'speaking' ? '1px solid rgba(15,60,201,0.3)'
            : '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 600,
            color: phase === 'speaking' ? '#6B8FFF'
              : phase === 'thinking' ? 'rgba(255,200,50,0.7)'
              : 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            {phase === 'connecting' ? 'connecting'
              : phase === 'listening' ? 'listening'
              : phase === 'thinking' ? 'thinking'
              : phase === 'speaking' ? 'speaking'
              : 'ready'}
          </span>
        </div>
      </div>

      {/* Transcript — scrollable middle section */}
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', padding: '8px 16px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            color: 'rgba(255,255,255,0.2)', fontSize: 11,
            lineHeight: 1.6,
          }}>
            {phase === 'connecting'
              ? 'Connecting to your assistant...'
              : 'Say hello to get started'}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '82%',
          }}>
            <div style={{
              background: msg.from === 'user'
                ? 'rgba(61,111,255,0.15)'
                : 'rgba(255,255,255,0.04)',
              border: msg.from === 'user'
                ? '1px solid rgba(61,111,255,0.25)'
                : '1px solid rgba(255,255,255,0.06)',
              color: msg.from === 'user' ? '#c8d8ff' : 'rgba(255,255,255,0.85)',
              borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '8px 14px',
              fontSize: 11, lineHeight: 1.5, fontFamily: 'var(--font)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 20, padding: '10px 20px 16px',
      }}>
        {/* Mute toggle */}
        <button
          onClick={handleOrbTap}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: room?.localParticipant?.isMicrophoneEnabled
              ? 'rgba(61,111,255,0.2)' : 'rgba(255,80,80,0.2)',
            border: room?.localParticipant?.isMicrophoneEnabled
              ? '1.5px solid rgba(61,111,255,0.4)' : '1.5px solid rgba(255,80,80,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={room?.localParticipant?.isMicrophoneEnabled ? '#6B8FFF' : '#ff5050'}
            strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            {!room?.localParticipant?.isMicrophoneEnabled && (
              <line x1="1" y1="1" x2="23" y2="23" stroke="#ff5050"/>
            )}
          </svg>
        </button>

        {/* End call */}
        <button
          onClick={() => {
            if (room) room.disconnect()
            onClose()
          }}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,60,60,0.15)',
            border: '1.5px solid rgba(255,60,60,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
            <line x1="23" y1="1" x2="1" y2="23"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ---------- Screen: Home ---------- */
function HomeScreen({ onVoiceTap }) {
  return (
    <div style={{ padding: '4px 16px 12px' }}>
      {/* Greeting */}
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, fontFamily: 'var(--font)', letterSpacing: '0.02em', color: '#141414' }}>Good afternoon</div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F5F7FA', borderRadius: 24, padding: '8px 14px',
          marginBottom: 8,
        }}
      >
        {icons.search('#999')}
        <span style={{ flex: 1, color: '#999', fontSize: 13, fontFamily: 'var(--font)', letterSpacing: '0.02em' }}>Search Jio</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {icons.mic('#444')}
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            {icons.bell('#444')}
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 12, height: 12, borderRadius: '50%',
              background: '#DA2441', color: '#fff',
              fontSize: 7, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>3</span>
          </span>
          {icons.qr('#444')}
        </div>
      </div>

      {/* Voice Button - Ask Buddy */}
      <div
        onClick={onVoiceTap}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #0F3CC9, #3D5FE3)',
          borderRadius: 100, padding: '8px 16px',
          marginBottom: 12, cursor: 'pointer',
        }}
      >
        {icons.mic('#fff')}
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font)', letterSpacing: '0.02em' }}>Ask Buddy anything...</span>
      </div>

      {/* Service Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: '1px solid #eee', borderRadius: 12, overflow: 'hidden',
        marginBottom: 12,
      }}>
        {SERVICES.map((s, i) => (
          <div
            key={s.key}
            style={{
              padding: '8px 10px',
              borderBottom: i < 4 ? '1px solid #eee' : 'none',
              borderRight: i % 2 === 0 ? '1px solid #eee' : 'none',
              background: 'transparent',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#141414' }}>{s.title}</div>
            </div>
            <div style={{ fontSize: 9, color: '#999', marginTop: 1 }}>{s.sub}</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
              {[0,1,2].map(j => (
                <div key={j} style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: `${s.color}${j === 0 ? '20' : j === 1 ? '15' : '10'}`,
                  border: `1px solid ${s.color}30`,
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* More link */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#0F3CC9', fontWeight: 500, fontFamily: 'var(--font)', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          More
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0F3CC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>

      {/* Promo Carousel */}
      <div style={{
        background: 'linear-gradient(135deg, #0F3CC9, #3D5FE3)',
        borderRadius: 12, padding: 14, marginBottom: 10,
        color: '#fff', position: 'relative',
      }}>
        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>JioTrue5G</div>
        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
          Unlimited 5G data<br/>at no extra cost
        </div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>Blazing speeds on India's largest True5G network</div>
        <button
          style={{
            marginTop: 8, background: '#fff', color: '#0F3CC9',
            border: 'none', borderRadius: 100, padding: '5px 14px',
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}
        >
          Check Coverage
        </button>
        <div style={{
          position: 'absolute', bottom: 8, right: 14,
          display: 'flex', gap: 4,
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
            }} />
          ))}
        </div>
      </div>

      {/* JioLifeGraph Card */}
      <div style={{
        border: '1px solid #0F3CC920', borderRadius: 12,
        padding: 10, background: '#f8f9ff', marginBottom: 10,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3CC9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>JioLifeGraph <AiBadge text="AI-learned" /></div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 8 }}>
          {[
            { day: 'M', h: 12 },
            { day: 'T', h: 18 },
            { day: 'W', h: 8 },
            { day: 'T', h: 22 },
            { day: 'F', h: 15 },
            { day: 'S', h: 28 },
            { day: 'S', h: 20 },
          ].map((bar, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="16" height="18" viewBox={`0 0 16 18`}>
                <rect x="2" y={18 - (bar.h / 28) * 18} width="12" height={(bar.h / 28) * 18} rx="2" fill="#0F3CC940"/>
              </svg>
              <span style={{ fontSize: 7, color: '#999', marginTop: 1 }}>{bar.day}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Learned: Morning commuter, Movie night Fri</div>
        <div style={{ fontSize: 8, color: '#999', fontStyle: 'italic' }}>On-device. Your data never leaves your phone.</div>
      </div>

      {/* Account Bar */}
      <div style={{
        border: '1px solid #eee', borderRadius: 12, overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderBottom: '1px solid #eee',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3CC9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>Prepaid 97XXXXXX43</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, padding: '8px 10px', borderBottom: '3px solid #0F3CC9' }}>
            <div style={{ fontSize: 9, color: '#999' }}>Data</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>14.2 GB</div>
            <div style={{ fontSize: 8, color: '#999' }}>Left of 24 GB</div>
            <div style={{ height: 3, background: '#E0E0E0', borderRadius: 2, marginTop: 4 }}>
              <div style={{ width: '60%', height: '100%', background: '#0F3CC9', borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ flex: 1, padding: '8px 10px', borderRight: '1px solid #eee', borderLeft: '1px solid #eee' }}>
            <div style={{ fontSize: 9, color: '#0F3CC9' }}>AI Tokens</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F3CC9' }}>2,450</div>
            <div style={{ fontSize: 8, color: '#999' }}>AI Plus tier</div>
          </div>
          <div style={{ flex: 1, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#999' }}>Plan</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>599</div>
            <div style={{ fontSize: 8, color: '#999' }}>Billed 26th</div>
          </div>
        </div>
      </div>

      {/* Guardian Mesh Status Pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: '#00C85315', borderRadius: 100,
        padding: '3px 10px', marginBottom: 12,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C853' }} />
        <span style={{ fontSize: 9, color: '#00C853', fontWeight: 600 }}>Family Safe</span>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {['Token\nbooster', 'AI Plus', 'Family\ntokens', 'Usage'].map((label, i) => (
          <button
            key={i}
            style={{
              background: '#f5f7fa', border: '1px solid #eee', borderRadius: 10,
              padding: '10px 4px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font)',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#0F3CC920', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0F3CC9' }} />
            </div>
            <span style={{ fontSize: 9, color: '#444', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line' }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- main component ---------- */
export default function IPhoneMockup() {
  const [voiceMode, setVoiceMode] = useState(false)
  const app = SUB_APPS.home

  return (
    <div style={{
      width: 280,
      height: 590,
      background: '#000',
      borderRadius: 40,
      padding: 8,
      position: 'relative',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
    }}>
      {/* Screen */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        borderRadius: 32,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Status Bar */}
        <div style={{
          height: 44,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          background: voiceMode ? '#061654' : '#fff',
          color: voiceMode ? '#fff' : '#000',
        }}>
          <span>12:06 PM</span>
          {/* Dynamic Island */}
          <div style={{
            width: 80,
            height: 22,
            background: '#000',
            borderRadius: 20,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 10,
          }} />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9 }}>5G</span>
            <svg width="12" height="10" viewBox="0 0 12 10"><rect x="0" y="6" width="2" height="4" fill="currentColor"/><rect x="3" y="4" width="2" height="6" fill="currentColor"/><rect x="6" y="2" width="2" height="8" fill="currentColor"/><rect x="9" y="0" width="2" height="10" fill="currentColor"/></svg>
            <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="0" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="14" y="3" width="2" height="4" rx="1" fill="currentColor"/><rect x="1.5" y="1.5" width="9" height="7" rx="1" fill="currentColor"/></svg>
          </div>
        </div>

        {/* Voice Mode Overlay */}
        {voiceMode && (
          <VoiceScreen
            onClose={() => setVoiceMode(false)}
          />
        )}

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          background: voiceMode ? '#0d0d1a' : '#fff',
        }}>
          {!voiceMode && (
            <HomeScreen onVoiceTap={() => setVoiceMode(true)} />
          )}
        </div>

        {/* Bottom Tab Bar */}
        <div style={{
          height: 64,
          borderTop: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 4px',
          paddingBottom: 8,
          flexShrink: 0,
          background: '#fff',
        }}>
          {app.bottomTabs.map((tab, i) => {
            const isActive = tab.label === 'Home'
            const color = isActive ? '#0F3CC9' : '#999'
            return (
              <button
                key={i}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '4px 6px',
                }}
              >
                {icons[tab.icon]?.(color)}
                <span style={{
                  fontSize: 9, fontWeight: isActive ? 700 : 500, color,
                  fontFamily: 'var(--font)', letterSpacing: '0.02em',
                }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
