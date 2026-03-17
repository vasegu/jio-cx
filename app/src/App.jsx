import { useState } from 'react'
import IPhoneMockup from './components/IPhoneMockup'
import AILayer from './components/AILayer'
import Dashboard from './components/Dashboard'
import jioLogo from './assets/jio-logo-white.svg'

const SCENARIOS = [
  { id: 'home', label: 'MyJio Home' },
  { id: 'commerce', label: 'Smart Commerce' },
  { id: 'support', label: 'HelloJio' },
  { id: 'finance', label: 'JioFinance' },
]

/* Accenture full wordmark in white (from accenture-logo-subtle.svg, recolored) */
const AccentureLogo = () => (
  <svg height="12" viewBox="0 0 163.4 43" xmlns="http://www.w3.org/2000/svg">
    <g fill="rgba(255,255,255,0.75)">
      <polygon points="95.1,4.9 95.1,0 111.2,6.5 111.2,10.5 95.1,17 95.1,12 104.5,8.5"/>
      <path d="M 6.2,43 C 2.8,43 0,41.3 0,37.5 v -0.2 c 0,-4.6 4,-6.2 8.9,-6.2 h 2.3 v -0.9 c 0,-1.9 -0.8,-3 -2.8,-3 -1.8,0 -2.7,1 -2.8,2.4 h -5 c 0.4,-4.2 3.7,-6.2 8.1,-6.2 4.5,0 7.8,1.9 7.8,6.6 V 42.6 H 11.4 V 40.4 C 10.4,41.8 8.7,43 6.2,43 Z m 5,-6.6 V 34.6 H 9.1 c -2.6,0 -3.9,0.7 -3.9,2.4 v 0.2 c 0,1.3 0.8,2.2 2.6,2.2 1.8,-0.1 3.4,-1.1 3.4,-3 z M 28.4,43 c -5.2,0 -9,-3.2 -9,-9.6 v -0.3 c 0,-6.4 4,-9.8 9,-9.8 4.3,0 7.8,2.2 8.2,7.1 h -5 c -0.3,-1.8 -1.3,-3 -3.1,-3 -2.2,0 -3.8,1.8 -3.8,5.5 v 0.6 c 0,3.8 1.4,5.5 3.8,5.5 1.8,0 3.1,-1.3 3.4,-3.4 h 4.8 C 36.4,40 33.5,43 28.4,43 Z M 48,43 c -5.2,0 -9,-3.2 -9,-9.6 v -0.3 c 0,-6.4 4,-9.8 9,-9.8 4.3,0 7.8,2.2 8.2,7.1 h -5 c -0.3,-1.8 -1.3,-3 -3.1,-3 -2.2,0 -3.8,1.8 -3.8,5.5 v 0.6 c 0,3.8 1.4,5.5 3.8,5.5 1.8,0 3.1,-1.3 3.4,-3.4 h 4.8 C 56,40 53.1,43 48,43 Z m 19.7,0 c -5.4,0 -9.1,-3.2 -9.1,-9.5 v -0.4 c 0,-6.3 3.9,-9.8 9,-9.8 4.7,0 8.6,2.6 8.6,8.9 v 2.3 H 63.9 c 0.2,3.4 1.7,4.7 3.9,4.7 2,0 3.1,-1.1 3.5,-2.4 h 4.9 C 75.6,40.3 72.6,43 67.7,43 Z M 64,31 h 7 c -0.1,-2.8 -1.4,-4 -3.5,-4 -1.6,0.1 -3.1,1 -3.5,4 z m 15.4,-7.2 h 5.3 v 2.8 c 0.9,-1.8 2.8,-3.2 5.7,-3.2 3.4,0 5.7,2.1 5.7,6.6 V 42.6 H 90.8 V 30.8 c 0,-2.2 -0.9,-3.2 -2.8,-3.2 -1.8,0 -3.3,1.1 -3.3,3.5 v 11.5 h -5.3 z m 26.4,-5.7 v 5.7 h 3.6 v 3.9 h -3.6 v 8.9 c 0,1.4 0.6,2.1 1.9,2.1 0.8,0 1.3,-0.1 1.8,-0.3 v 4.1 c -0.6,0.2 -1.7,0.4 -3,0.4 -4.1,0 -6,-1.9 -6,-5.7 v -9.5 h -2.2 v -3.9 h 2.2 v -3.5 z m 23.4,24.5 H 124 v -2.8 c -0.9,1.8 -2.7,3.2 -5.5,3.2 -3.4,0 -5.9,-2.1 -5.9,-6.5 V 23.8 h 5.3 v 12 c 0,2.2 0.9,3.2 2.7,3.2 1.8,0 3.3,-1.2 3.3,-3.5 V 23.8 h 5.3 z m 3.9,-18.8 h 5.3 v 3.5 c 1.1,-2.5 2.9,-3.7 5.7,-3.7 v 5.2 c -3.6,0 -5.7,1.1 -5.7,4.2 v 9.7 h -5.3 z M 154.8,43 c -5.4,0 -9.1,-3.2 -9.1,-9.5 v -0.4 c 0,-6.3 3.9,-9.8 9,-9.8 4.7,0 8.6,2.6 8.6,8.9 v 2.3 h -12.2 c 0.2,3.4 1.7,4.7 3.9,4.7 2,0 3.1,-1.1 3.5,-2.4 h 4.9 c -0.8,3.5 -3.7,6.2 -8.6,6.2 z M 151,31 h 7.1 c -0.1,-2.8 -1.4,-4 -3.5,-4 -1.6,0.1 -3.1,1 -3.6,4 z"/>
    </g>
  </svg>
)

export default function App() {
  const [activeScenario, setActiveScenario] = useState('home')
  const [aiEvents, setAiEvents] = useState([])
  const [dashboardData, setDashboardData] = useState({ eventCount: 0 })

  const handleUserAction = (action) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const event = { ...action, timestamp, id: Date.now() }
    setAiEvents(prev => [event, ...prev].slice(0, 20))
    setTimeout(() => {
      setDashboardData(prev => ({
        ...prev, lastEvent: event,
        eventCount: (prev?.eventCount || 0) + 1,
      }))
    }, 800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(135deg, var(--jio-deep-blue) 0%, #061654 100%)',
        padding: '0 32px',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 100,
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Left: Jio x Accenture */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <img src={jioLogo} alt="Jio" style={{ height: 24 }} />
          <span style={{
            color: 'rgba(255,255,255,0.2)', fontSize: 13,
            fontWeight: 300,
          }}>
            /
          </span>
          <AccentureLogo />
        </div>

        {/* Center: Scenario tabs */}
        <nav style={{
          display: 'flex', gap: 0,
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          height: '100%',
        }}>
          {SCENARIOS.map(s => {
            const active = activeScenario === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                style={{
                  background: 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--jio-blue)' : '2px solid transparent',
                  padding: '0 20px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  fontFamily: 'var(--font)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.02em',
                  height: '100%',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {s.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* ── 3-Panel Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '310px 380px 1fr',
        gridTemplateRows: 'auto 1fr',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Column Headers */}
        {[
          { label: 'Customer Experience', bg: '#f0f2f5', border: '1px solid var(--jio-border)' },
          { label: 'AI Session', bg: 'var(--jio-bg)', border: '1px solid var(--jio-border-light)' },
          { label: 'Platform Operations', bg: 'var(--jio-bg)', border: 'none' },
        ].map((col, i) => (
          <div key={col.label} style={{
            background: col.bg,
            borderRight: col.border,
            borderBottom: '1px solid var(--jio-border-light)',
            padding: '10px 20px',
          }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: 'var(--jio-grey-muted)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {col.label}
            </span>
          </div>
        ))}

        {/* Panel 1: iPhone */}
        <div style={{
          background: '#f0f2f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 16px 20px',
          borderRight: '1px solid var(--jio-border)',
        }}>
          <IPhoneMockup
            scenario={activeScenario}
            onAction={handleUserAction}
            onScenarioChange={setActiveScenario}
          />
        </div>

        {/* Panel 2: AI Layer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--jio-bg)',
          borderRight: '1px solid var(--jio-border-light)',
        }}>
          <AILayer events={aiEvents} scenario={activeScenario} />
        </div>

        {/* Panel 3: Dashboard */}
        <div style={{
          background: 'var(--jio-bg)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Dashboard data={dashboardData} scenario={activeScenario} events={aiEvents} />
        </div>
      </div>
    </div>
  )
}
