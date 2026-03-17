import { useState, useEffect, useMemo } from 'react'
import ClusterMap from './ClusterMap'

/* ── SVG Icons (outlined, 1.8px stroke, JDS spec) ── */
const Icons = {
  users: (c = '#0F3CC9') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  bolt: (c = '#00C853') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  clock: (c = '#EFA73D') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  trending: (c = '#D9008D') => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  arrowUp: (c = '#00C853') => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  ),
  arrowDown: (c = '#00C853') => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
}

/* ── Data ── */
const STAT_CARDS = {
  home: [
    { label: 'Token Consumption', value: '1.2M/hr', change: '+8.4%', positive: true, color: '#0F3CC9', icon: 'users', sparkData: [30, 45, 38, 52, 48, 60, 55, 68, 72, 65, 78, 82] },
    { label: 'Avg Token Cost', value: '₹0.003', change: '-12.1%', positive: true, color: '#00C853', icon: 'bolt', sparkData: [70, 65, 60, 55, 50, 48, 52, 45, 42, 38, 35, 30] },
    { label: 'Edge vs Core', value: '78% edge', change: '+3.2%', positive: true, color: '#EFA73D', icon: 'clock', sparkData: [55, 58, 60, 62, 65, 68, 70, 72, 74, 75, 77, 78] },
    { label: 'Token Revenue', value: '₹4.2Cr/day', change: '+6.7%', positive: true, color: '#D9008D', icon: 'trending', sparkData: [35, 42, 48, 52, 55, 60, 58, 65, 70, 75, 72, 80] },
  ],
  commerce: [
    { label: 'Daily Orders', value: '2.4M', change: '+18.2%', positive: true, color: '#0F3CC9', icon: 'users', sparkData: [30, 38, 42, 50, 55, 62, 68, 72, 78, 82, 88, 92] },
    { label: 'Stores Active', value: '3.4 Lakh', change: '+8.4%', positive: true, color: '#00C853', icon: 'bolt', sparkData: [50, 55, 58, 60, 62, 65, 68, 70, 72, 74, 76, 78] },
    { label: 'Avg Delivery', value: '22 min', change: '-12.1%', positive: true, color: '#EFA73D', icon: 'clock', sparkData: [70, 68, 65, 62, 58, 55, 52, 50, 48, 45, 42, 40] },
    { label: 'Daily GMV', value: '₹84Cr', change: '+14.6%', positive: true, color: '#D9008D', icon: 'trending', sparkData: [35, 42, 48, 52, 55, 60, 65, 70, 72, 78, 82, 88] },
  ],
  support: [
    { label: 'Active Sessions', value: '84K', change: '+4.2%', positive: true, color: '#0F3CC9', icon: 'users', sparkData: [40, 45, 48, 52, 55, 58, 60, 62, 65, 68, 72, 75] },
    { label: 'Resolution Rate', value: '89.4%', change: '+2.1%', positive: true, color: '#00C853', icon: 'bolt', sparkData: [72, 74, 76, 78, 80, 82, 84, 85, 86, 87, 88, 89] },
    { label: 'Avg Handle Time', value: '2.4min', change: '-8.1%', positive: true, color: '#EFA73D', icon: 'clock', sparkData: [65, 60, 58, 55, 52, 50, 48, 45, 42, 40, 38, 35] },
    { label: 'CSAT Score', value: '4.6/5', change: '+0.3', positive: true, color: '#D9008D', icon: 'trending', sparkData: [60, 62, 64, 65, 66, 68, 70, 72, 74, 75, 78, 80] },
  ],
  finance: [
    { label: 'Transactions/s', value: '12.4K', change: '+4.2%', positive: true, color: '#0F3CC9', icon: 'users', sparkData: [40, 48, 52, 58, 62, 68, 72, 75, 78, 82, 85, 88] },
    { label: 'Fraud Blocked', value: '₹8.2Cr', change: '+12.8%', positive: true, color: '#00C853', icon: 'bolt', sparkData: [30, 35, 40, 45, 50, 55, 58, 62, 65, 70, 75, 80] },
    { label: 'False Positive', value: '0.3%', change: '-0.1%', positive: true, color: '#EFA73D', icon: 'clock', sparkData: [70, 68, 65, 62, 58, 55, 52, 50, 48, 45, 42, 38] },
    { label: 'UPI Success Rate', value: '99.7%', change: '+0.2%', positive: true, color: '#D9008D', icon: 'trending', sparkData: [92, 93, 94, 95, 95, 96, 96, 97, 97, 98, 98, 99] },
  ],
}

/* ── Sparkline SVG ── */
function Sparkline({ data, color, width = 80, height = 28 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Shared styles ── */
const card = {
  background: '#fff',
  borderRadius: 'var(--jio-radius)',
  boxShadow: 'var(--jio-shadow)',
  overflow: 'hidden',
}

const sectionHead = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px 12px',
}

const sectionTitle = {
  fontWeight: 700, fontSize: 13, color: 'var(--jio-black)',
}

const sectionMeta = {
  fontSize: 10, color: 'var(--jio-grey-muted)', fontWeight: 500,
}

/* ── Component ── */
export default function Dashboard({ data, scenario, events }) {
  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '16px 20px 24px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {(STAT_CARDS[scenario] || STAT_CARDS.home).map((c, i) => (
          <div key={c.label} style={{
            ...card,
            padding: '16px 18px 12px',
            borderTop: `3px solid ${c.color}`,
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--jio-grey)', fontWeight: 500, marginBottom: 6 }}>
                  {c.label}
                </div>
                <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1, color: 'var(--jio-black)' }}>
                  {c.value}
                </div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${c.color}0D`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Icons[c.icon]?.(c.color)}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 12, paddingTop: 10,
              borderTop: '1px solid var(--jio-border-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {c.positive ? Icons.arrowUp('#00C853') : Icons.arrowDown('#DA2441')}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: c.positive ? '#00C853' : '#DA2441',
                }}>
                  {c.change}
                </span>
                <span style={{ fontSize: 10, color: 'var(--jio-grey-muted)', marginLeft: 2 }}>
                  vs yesterday
                </span>
              </div>
              <Sparkline data={c.sparkData} color={c.color} width={64} height={22} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Neural Edge Network (Cluster Map) ── */}
      <div style={card}>
        <div style={sectionHead}>
          <span style={sectionTitle}>Neural Edge Network</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--jio-green)' }} />
              <span style={sectionMeta}>6 clusters active</span>
            </div>
            <span style={{ ...sectionMeta, fontFamily: 'var(--mono)' }}>
              {data.eventCount || 0} processed
            </span>
          </div>
        </div>
        <ClusterMap
          lastEvent={data.lastEvent}
          eventCount={data.eventCount}
          scenario={scenario}
        />
      </div>

      {/* ── Platform Activity Feed ── */}
      <div style={card}>
        <div style={sectionHead}>
          <span style={sectionTitle}>Platform Activity</span>
          <span style={sectionMeta}>All users — real-time</span>
        </div>
        <div style={{ padding: '0 4px 8px', maxHeight: 180, overflow: 'auto' }}>
          {events.length > 0 ? events.slice(0, 10).map((e, i) => {
            const platformUsers = ['Vasco E.', 'Priya M.', 'Arjun K.', 'Sneha D.', 'Rohan P.', 'Aisha S.', 'Vikram T.', 'Meera R.']
            const user = i === 0 ? 'Vasco E.' : platformUsers[Math.floor((e.id * 7 + i) % platformUsers.length)]
            const isVasco = user === 'Vasco E.'
            return (
              <div key={e.id + '-' + i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 16px',
                borderRadius: 6,
                margin: '0 4px',
                background: isVasco ? 'var(--jio-blue-soft)' : 'transparent',
                animation: i === 0 ? 'fadeUp 0.25s ease' : 'none',
              }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--jio-grey-muted)',
                  flexShrink: 0, width: 60,
                }}>
                  {e.timestamp}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  color: isVasco ? 'var(--jio-blue)' : 'var(--jio-grey)',
                  flexShrink: 0, width: 62,
                }}>
                  {user}
                </span>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 500,
                  background: isVasco ? 'var(--jio-blue-soft)' : 'var(--jio-bg)',
                  color: isVasco ? 'var(--jio-blue)' : 'var(--jio-grey)',
                  padding: '1px 8px', borderRadius: 4,
                  whiteSpace: 'nowrap',
                }}>
                  {e.type}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--jio-green)',
                  fontWeight: 500, flexShrink: 0,
                }}>
                  OK
                </span>
              </div>
            )
          }) : (
            <div style={{
              padding: '24px 16px', textAlign: 'center',
              color: 'var(--jio-grey-muted)', fontSize: 11,
            }}>
              Tap elements in the phone to generate activity
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
