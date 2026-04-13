import { useState, createContext, useContext } from 'react'
import IPhoneMockup from './components/IPhoneMockup'
import TracePanel from './components/TracePanel'

// Shared context for agent events (VoiceContent → TracePanel)
export const AgentEventsContext = createContext({
  events: [],
  addEvent: () => {},
  agentState: 'disconnected',
  setAgentState: () => {},
})

export function useAgentEvents() {
  return useContext(AgentEventsContext)
}

export default function App() {
  const [events, setEvents] = useState([])
  const [agentState, setAgentState] = useState('disconnected')

  const addEvent = (type, text) => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setEvents(prev => [...prev.slice(-50), { time, type, text }]) // keep last 50
  }

  return (
    <AgentEventsContext.Provider value={{ events, addEvent, agentState, setAgentState }}>
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #060610 0%, #0a0a1a 100%)',
        display: 'flex',
        fontFamily: 'var(--font)',
      }}>
        {/* Left: Title + Phone */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h1 style={{
              fontSize: 20, fontWeight: 700, color: '#fff',
              margin: 0, letterSpacing: '0.02em',
            }}>
              Jio CX <span style={{ color: 'rgba(61,111,255,0.7)', fontWeight: 400 }}>· Agentic Spine</span>
            </h1>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
              margin: '4px 0 0', letterSpacing: '0.05em',
            }}>
              LiveKit · LangGraph · Gemini Flash · Voice Separation
            </p>
          </div>
          <IPhoneMockup />
        </div>

        {/* Right: Trace Panel */}
        <TracePanel events={events} agentState={agentState} />
      </div>
    </AgentEventsContext.Provider>
  )
}
