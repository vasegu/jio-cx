import { useState } from 'react'

/* ---------- sub-app definitions ---------- */
const SUB_APPS = {
  home: {
    bottomTabs: [
      { icon: 'jio', label: 'Home', active: true },
      { icon: 'mobile', label: 'Mobile' },
      { icon: 'fiber', label: 'Fiber' },
      { icon: 'finance', label: 'Finance' },
      { icon: 'play', label: 'Play' },
      { icon: 'cloud', label: 'Cloud' },
    ],
  },
  commerce: {
    bottomTabs: [
      { icon: 'jio', label: 'Home' },
      { icon: 'mobile', label: 'Orders', active: true },
      { icon: 'fiber', label: 'Nearby' },
      { icon: 'finance', label: 'Track' },
      { icon: 'cloud', label: 'Account' },
    ],
  },
  support: {
    bottomTabs: [
      { icon: 'jio', label: 'Home' },
      { icon: 'mobile', label: 'Mobile' },
      { icon: 'fiber', label: 'Fiber' },
      { icon: 'finance', label: 'Finance' },
      { icon: 'play', label: 'Play' },
      { icon: 'cloud', label: 'Cloud' },
    ],
  },
  finance: {
    bottomTabs: [
      { icon: 'home', label: 'Home', active: true },
      { icon: 'pay', label: 'Pay' },
      { icon: 'scan', label: 'Scan', elevated: true },
      { icon: 'history', label: 'History' },
      { icon: 'more', label: 'More' },
    ],
  },
}

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
  home: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  pay: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  scan: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  ),
  history: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  more: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
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
  { key: 'aicloud', title: 'AICLOUD', sub: 'Easy backup', color: '#29B6F6' },
  { key: 'shopping', title: 'SHOPPING', sub: 'Best deals', color: '#EFA73D' },
]

/* ---------- component ---------- */
export default function IPhoneMockup({ scenario, onAction, onScenarioChange }) {
  const [highlightTap, setHighlightTap] = useState(null)
  const app = SUB_APPS[scenario] || SUB_APPS.home

  const handleTap = (item, type) => {
    setHighlightTap(item)
    setTimeout(() => setHighlightTap(null), 300)
    onAction({ type, item, scenario })

    // Navigate to sub-app on certain taps
    if (type === 'service-tap') {
      if (item === 'shopping') onScenarioChange('commerce')
      else if (item === 'finance_svc') onScenarioChange('finance')
    }
    if (type === 'tab-tap') {
      if (item === 'Home' || item === 'jio') onScenarioChange('home')
      else if (item === 'Mobile') onScenarioChange('commerce')
      else if (item === 'Finance') onScenarioChange('finance')
    }
  }

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
          background: scenario === 'home' ? '#fff' : (scenario === 'finance' ? '#0F3CC9' : '#fff'),
          color: scenario === 'finance' ? '#fff' : '#000',
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

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          background: scenario === 'finance' ? '#f0f4ff' : '#fff',
        }}>
          {scenario === 'home' && <HomeScreen onTap={handleTap} highlight={highlightTap} />}
          {scenario === 'commerce' && <CommerceScreen onTap={handleTap} highlight={highlightTap} />}
          {scenario === 'support' && <SupportScreen onTap={handleTap} />}
          {scenario === 'finance' && <FinanceScreen onTap={handleTap} highlight={highlightTap} />}
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
            const color = tab.active ? '#0F3CC9' : '#999'
            return (
              <button
                key={i}
                onClick={() => handleTap(tab.label, 'tab-tap')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: tab.elevated ? '0 8px' : '4px 6px',
                  position: 'relative',
                  ...(tab.elevated ? { marginTop: -16 } : {}),
                }}
              >
                {tab.elevated ? (
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#0F3CC9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {icons[tab.icon]?.('#fff')}
                  </div>
                ) : (
                  icons[tab.icon]?.(color)
                )}
                <span style={{
                  fontSize: 9, fontWeight: tab.active ? 700 : 500, color,
                  fontFamily: 'var(--font)',
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

/* ---------- Screen: Home ---------- */
function HomeScreen({ onTap, highlight }) {
  return (
    <div style={{ padding: '4px 12px 12px' }}>
      {/* Search Bar */}
      <div
        onClick={() => onTap('search', 'search-tap')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f5f5f5', borderRadius: 24, padding: '8px 14px',
          marginBottom: 8, cursor: 'pointer',
        }}
      >
        {icons.search('#999')}
        <span style={{ flex: 1, color: '#999', fontSize: 13 }}>Search Jio</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {icons.mic('#444')}{icons.bell('#444')}{icons.qr('#444')}
        </div>
      </div>

      {/* Voice Button — "Ask Jio" */}
      <div
        onClick={() => onTap('voice', 'ai-tap')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #0F3CC9, #3D5FE3)',
          borderRadius: 100, padding: '8px 16px',
          marginBottom: 12, cursor: 'pointer',
        }}
      >
        {icons.mic('#fff')}
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500 }}>Ask Jio anything...</span>
      </div>

      {/* Service Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: '1px solid #eee', borderRadius: 12, overflow: 'hidden',
        marginBottom: 12,
      }}>
        {SERVICES.map((s, i) => {
          const tokenHints = { mobile: '~3 tok', home_svc: '~4 tok', entertainment: '~8 tok', finance_svc: '~12 tok', aicloud: '~2 tok', shopping: '~5 tok' }
          return (
            <div
              key={s.key}
              onClick={() => onTap(s.key, 'service-tap')}
              style={{
                padding: '10px 12px',
                borderBottom: i < 4 ? '1px solid #eee' : 'none',
                borderRight: i % 2 === 0 ? '1px solid #eee' : 'none',
                cursor: 'pointer',
                background: highlight === s.key ? '#f0f4ff' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#141414' }}>{s.title}</div>
                <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--jio-blue)', opacity: 0.5 }}>
                  {tokenHints[s.key]}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>{s.sub}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: 20, height: 20, borderRadius: 5,
                    background: `${s.color}${j === 0 ? '20' : j === 1 ? '15' : '10'}`,
                    border: `1px solid ${s.color}30`,
                  }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* More link */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#0F3CC9', fontWeight: 500 }}>More ▾</span>
      </div>

      {/* Promo Carousel — AI Plus upsell */}
      <div style={{
        background: 'linear-gradient(135deg, #0F3CC9, #3D5FE3)',
        borderRadius: 12, padding: 14, marginBottom: 12,
        color: '#fff', position: 'relative',
      }}>
        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>AI Plus</div>
        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
          5x more tokens<br/>Advanced reasoning
        </div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>Upgrade your AI — studies, work, creative tools</div>
        <button
          onClick={() => onTap('promo', 'promo-tap')}
          style={{
            marginTop: 8, background: '#fff', color: '#0F3CC9',
            border: 'none', borderRadius: 100, padding: '5px 14px',
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}
        >
          Upgrade Now
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

      {/* Account Bar — with Token balance */}
      <div style={{
        border: '1px solid #eee', borderRadius: 12, overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderBottom: '1px solid #eee',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0F3CC9"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>Postpaid 97XXXXXX43</span>
          <span style={{ color: '#999', fontSize: 14 }}>›</span>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, padding: '8px 10px', borderBottom: '3px solid #0F3CC9' }}>
            <div style={{ fontSize: 9, color: '#999' }}>Data</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>XXX GB</div>
            <div style={{ fontSize: 8, color: '#999' }}>Left of XX GB</div>
          </div>
          <div style={{ flex: 1, padding: '8px 10px', borderRight: '1px solid #eee', borderLeft: '1px solid #eee' }}>
            <div style={{ fontSize: 9, color: '#0F3CC9' }}>AI Tokens</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F3CC9' }}>2,450</div>
            <div style={{ fontSize: 8, color: '#999' }}>AI Plus tier</div>
          </div>
          <div style={{ flex: 1, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#999' }}>Plan</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>₹XXX</div>
            <div style={{ fontSize: 8, color: '#999' }}>Billed 26th</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {['Token\nbooster', 'AI Plus', 'Family\ntokens', 'Usage'].map((label, i) => (
          <button
            key={i}
            onClick={() => onTap(label, 'quick-action')}
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

/* ---------- Screen: Smart Commerce (Kirana) ---------- */
function CommerceScreen({ onTap, highlight }) {
  return (
    <div style={{ padding: '4px 12px 12px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '4px 0',
      }}>
        <span onClick={() => onTap('back', 'nav-back')} style={{ cursor: 'pointer', fontSize: 18, color: '#0F3CC9' }}>‹</span>
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>Smart Commerce</span>
        {icons.search('#444')}
      </div>

      {/* Voice Order Bar */}
      <div
        onClick={() => onTap('voice-order', 'voice-order')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #7B1FA2, #9C27B0)',
          borderRadius: 100, padding: '10px 16px',
          marginBottom: 14, cursor: 'pointer',
        }}
      >
        {icons.mic('#fff')}
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500 }}>
          Say what you need...
        </span>
      </div>

      {/* Smart Basket Card */}
      <div style={{
        border: '2px solid #0F3CC9', borderRadius: 12, padding: 14,
        marginBottom: 14, background: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#141414' }}>Smart Basket</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>from Gupta General Store</div>
          </div>
          <span style={{
            fontSize: 8, fontWeight: 700, color: '#00C853',
            background: '#00C85315', padding: '2px 8px', borderRadius: 100,
          }}>Verified by Jio</span>
        </div>
        {[
          { item: 'Tamatar (1 kg)', price: '₹40' },
          { item: 'Palak (500g)', price: '₹30' },
          { item: 'Amul Doodh (1L)', price: '₹68' },
          { item: 'Bread (Brown)', price: '₹45' },
        ].map((row, i) => (
          <div key={i}
            onClick={() => onTap(row.item, 'basket-confirm')}
            style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 11, color: '#444' }}>{row.item}</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{row.price}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 10, paddingTop: 8, borderTop: '1px solid #eee',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Total ₹218</span>
          <button style={{
            background: '#0F3CC9', color: '#fff', border: 'none',
            borderRadius: 8, padding: '6px 16px', fontSize: 11,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
          }}>Confirm Order</button>
        </div>
      </div>

      {/* Nearby Stores */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Nearby Stores</div>
      {[
        { name: 'Gupta General Store', dist: '0.3 km', time: '8 min', rating: '4.8', open: true },
        { name: 'Sharma Provisions', dist: '0.7 km', time: '15 min', rating: '4.5', open: true },
        { name: 'Patel Mart', dist: '1.2 km', time: '22 min', rating: '4.3', open: false },
      ].map((store, i) => (
        <div
          key={i}
          onClick={() => onTap(store.name, 'store-select')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none',
            cursor: 'pointer', opacity: store.open ? 1 : 0.5,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#0F3CC910', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F3CC9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{store.name}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{store.dist} · {store.time} delivery</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#EFA73D' }}>{store.rating}</div>
            <div style={{ fontSize: 9, color: store.open ? '#00C853' : '#999', fontWeight: 500 }}>
              {store.open ? 'Open' : 'Closed'}
            </div>
          </div>
        </div>
      ))}

      {/* Delivery Tracker */}
      <div style={{
        background: '#f0f4ff', borderRadius: 12, padding: 14, marginTop: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>Rider Enroute</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>ETA 8 min — Gupta General Store</div>
          </div>
          <button
            onClick={() => onTap('track', 'delivery-track')}
            style={{
              background: '#0F3CC9', color: '#fff', border: 'none',
              borderRadius: 8, padding: '5px 12px', fontSize: 10,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >Track</button>
        </div>
        <div style={{ height: 4, background: '#E0E0E0', borderRadius: 2, marginTop: 10 }}>
          <div style={{ width: '65%', height: '100%', background: '#0F3CC9', borderRadius: 2 }} />
        </div>
      </div>

      {/* Quick Order Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        {['Last\norder', 'Weekly\nessentials', 'Festival\nspecials', 'Voice\norder'].map((label, i) => (
          <button
            key={i}
            onClick={() => onTap(label, i === 3 ? 'voice-order' : 'quick-action')}
            style={{
              background: '#f5f7fa', border: '1px solid #eee', borderRadius: 10,
              padding: '10px 4px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font)',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#7B1FA220', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#7B1FA2' }} />
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

/* ---------- Screen: HelloJio Support ---------- */
function SupportScreen({ onTap }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Namaste! I\'m HelloJio. How can I help you today?', time: '12:06', confidence: null },
    { from: 'user', text: 'My internet is slow since morning', time: '12:07' },
    { from: 'bot', text: 'I can see your connection is active on True5G. Let me run a quick diagnostic...', time: '12:07', confidence: '97%' },
    { from: 'bot', text: 'Network: Normal (48ms latency)\nSignal: Strong (-82 dBm)\nSpeed: 142 Mbps down / 28 Mbps up\n\nYour speeds look healthy. The slowness might be app-specific. Which app feels slow?', time: '12:07', confidence: '98%' },
  ])
  const [typing, setTyping] = useState(false)

  const REPLIES = {
    'Speed test': 'Running diagnostic... Download: 142 Mbps, Upload: 28 Mbps. Speeds are healthy.',
    'Check data balance': '4.2 GB remaining of 6 GB daily. Resets at midnight.',
    'Set parental controls': 'I can set rules for Ananya\'s device. Say what you\'d like: e.g., "Block games after 10pm, allow school apps."',
    'Talk to agent': 'Connecting to human agent... Wait: ~2 min.',
  }

  const handleQuickReply = (text) => {
    onTap(text, 'chat-reply')
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { from: 'user', text, time: now }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const botReply = REPLIES[text] || 'Let me look into that for you...'
      setMessages(prev => [...prev, { from: 'bot', text: botReply, time: now, confidence: '98%' }])
    }, 800)
  }

  const suggestions = ['Speed test', 'Check data balance', 'Set parental controls', 'Talk to agent']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderBottom: '1px solid #eee',
      }}>
        <span onClick={() => onTap('back', 'nav-back')} style={{ cursor: 'pointer', fontSize: 18, color: '#0F3CC9' }}>‹</span>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#0F3CC9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>jio</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>HelloJio</div>
          <div style={{ fontSize: 9, color: '#00C853' }}>● Online</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 8,
          }}>
            <div style={{ maxWidth: '80%' }}>
              <div style={{
                background: m.from === 'user' ? '#0F3CC9' : '#f5f5f5',
                color: m.from === 'user' ? '#fff' : '#141414',
                borderRadius: 12,
                borderTopLeftRadius: m.from === 'bot' ? 4 : 12,
                borderTopRightRadius: m.from === 'user' ? 4 : 12,
                padding: '8px 12px',
                fontSize: 11,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}>
                {m.text}
                <div style={{
                  fontSize: 8, opacity: 0.6, textAlign: 'right', marginTop: 4,
                }}>{m.time}</div>
              </div>
              {m.confidence && (
                <div style={{
                  display: 'inline-block', marginTop: 2,
                  fontSize: 8, fontWeight: 600, color: '#00C853',
                  background: '#00C85310', padding: '1px 6px', borderRadius: 4,
                }}>
                  {m.confidence} match
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div style={{
              background: '#f5f5f5', borderRadius: 12, borderTopLeftRadius: 4,
              padding: '10px 16px', fontSize: 14, letterSpacing: 2,
              color: '#999',
            }}>
              ...
            </div>
          </div>
        )}
      </div>

      {/* Guardian Mesh Card */}
      <div style={{
        margin: '0 12px 8px', padding: '10px 12px',
        background: '#f0f4ff', borderRadius: 10,
        border: '1px solid #0F3CC920',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0F3CC9' }}>Family Safety Active</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>Ananya: Games blocked 10PM-6AM</div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#00C853',
          }} />
        </div>
      </div>

      {/* Quick Replies */}
      <div style={{
        display: 'flex', gap: 6, padding: '8px 12px',
        overflowX: 'auto', flexShrink: 0,
      }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => handleQuickReply(s)}
            style={{
              background: '#fff', border: '1px solid #0F3CC9', borderRadius: 100,
              padding: '5px 12px', fontSize: 10, color: '#0F3CC9',
              fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font)',
            }}
          >{s}</button>
        ))}
      </div>

      {/* Input Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderTop: '1px solid #eee',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, background: '#f5f5f5', borderRadius: 20,
          padding: '8px 14px', fontSize: 11, color: '#999',
        }}>
          Type a message...
        </div>
        {icons.mic('#0F3CC9')}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#0F3CC9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </div>
      </div>
    </div>
  )
}

/* ---------- Screen: Finance (sub-app with own nav) ---------- */
function FinanceScreen({ onTap, highlight }) {
  const [alertDismissed, setAlertDismissed] = useState(false)

  const transactions = [
    { name: 'Swiggy', amount: '-₹432', time: '11:30 AM', type: 'debit', risk: 'safe' },
    { name: 'UPI from Rahul', amount: '+₹2,000', time: '10:15 AM', type: 'credit', risk: 'safe' },
    { name: 'JioMart Groceries', amount: '-₹1,248', time: 'Yesterday', type: 'debit', risk: 'flagged' },
    { name: 'Salary Credit', amount: '+₹85,000', time: 'Mar 1', type: 'credit', risk: 'safe' },
  ]

  const riskColors = { safe: '#00C853', flagged: '#EFA73D', blocked: '#DA2441' }

  return (
    <div style={{ padding: '4px 12px 12px' }}>
      {/* Fraud Alert Banner */}
      {!alertDismissed && (
        <div style={{
          background: '#DA244115', border: '1px solid #DA244130',
          borderRadius: 12, padding: 12, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#DA2441' }}>Unusual Transaction Blocked</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>₹12,400 to unknown UPI ID — Verify?</div>
            </div>
            <span
              onClick={() => setAlertDismissed(true)}
              style={{ fontSize: 14, color: '#999', cursor: 'pointer', lineHeight: 1 }}
            >x</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => { onTap('approve-txn', 'finance-action'); setAlertDismissed(true) }}
              style={{
                background: '#00C853', color: '#fff', border: 'none',
                borderRadius: 6, padding: '5px 14px', fontSize: 10,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >Approve</button>
            <button
              onClick={() => { onTap('block-txn', 'finance-action'); setAlertDismissed(true) }}
              style={{
                background: '#DA2441', color: '#fff', border: 'none',
                borderRadius: 6, padding: '5px 14px', fontSize: 10,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >Block</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: '#0F3CC9', borderRadius: 12, padding: 16,
        color: '#fff', marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Total Balance</div>
        <div style={{ fontWeight: 700, fontSize: 26 }}>₹4,12,847</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Savings</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>₹3,84,512</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Current</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>₹28,335</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Send', iconPath: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' },
          { label: 'Request', iconPath: 'M19 12H5M12 19l-7-7 7-7' },
          { label: 'Bills', iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
          { label: 'Rewards', iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => onTap(a.label, 'finance-action')}
            style={{
              background: '#fff', border: '1px solid #eee', borderRadius: 10,
              padding: '10px 4px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F3CC9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={a.iconPath}/></svg>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions with Risk Dots */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Recent Transactions</div>
      {transactions.map((tx, i) => (
        <div
          key={i}
          onClick={() => onTap(tx.name, 'transaction-tap')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Risk Dot */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: riskColors[tx.risk],
            flexShrink: 0,
          }} />
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: tx.type === 'credit' ? '#00C85315' : '#DA244115',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            {tx.type === 'credit' ? '↙' : '↗'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{tx.name}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{tx.time}</div>
          </div>
          <span style={{
            fontWeight: 700, fontSize: 13,
            color: tx.type === 'credit' ? '#00C853' : '#141414',
          }}>{tx.amount}</span>
        </div>
      ))}

      {/* Expense Insights with Spending Bars */}
      <div style={{
        background: '#fff', border: '1px solid #eee', borderRadius: 12,
        padding: 14, marginTop: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 12 }}>AI Expense Insights</span>
          <span style={{ fontSize: 11, color: '#0F3CC9' }}>✦</span>
        </div>
        <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5, marginBottom: 10 }}>
          Your food delivery spend is <span style={{ color: '#DA2441', fontWeight: 700 }}>32% higher</span> than last month.
          Switching to JioMart Quick could save <span style={{ color: '#00C853', fontWeight: 700 }}>₹2,400/mo</span>.
        </div>
        {/* Spending Category Bars */}
        {[
          { label: 'Food', pct: 38, color: '#D9008D' },
          { label: 'Transport', pct: 22, color: '#0F3CC9' },
          { label: 'Shopping', pct: 18, color: '#EFA73D' },
          { label: 'Bills', pct: 22, color: '#00C853' },
        ].map(cat => (
          <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: '#999', width: 52 }}>{cat.label}</span>
            <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 3 }}>
              <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#444', width: 28, textAlign: 'right' }}>{cat.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
