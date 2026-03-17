import { useEffect, useState, useRef, useMemo } from 'react'

/*
 * Offer Embedding Map
 * Dots = people. Circles = offers. Gaps = opportunity.
 * Vasco's accumulated actions drift him through offer-space.
 */

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function gaussian(cx, cy, count, spread, seed) {
  const rng = mulberry32(seed)
  const pts = []
  for (let i = 0; i < count; i++) {
    const u1 = rng(), u2 = rng()
    const r = Math.sqrt(-2 * Math.log(Math.max(u1, 0.001))) * spread
    const th = 2 * Math.PI * u2
    pts.push({ x: cx + r * Math.cos(th), y: cy + r * Math.sin(th) })
  }
  return pts
}

/* ── Offers (the circles) ── */
const OFFERS_BY_SCENARIO = {
  home: [
    { id: 'ai-lite',   name: 'AI Lite Plan',       detail: '100 tok/day', x: 72,  y: 58,  color: '#0F3CC9', r: 16, people: 40, spread: 20, seed: 111 },
    { id: 'ai-plus',   name: 'AI Plus Plan',       detail: 'Popular',     x: 200, y: 70,  color: '#0F3CC9', r: 20, people: 55, spread: 22, seed: 112 },
    { id: 'ai-family', name: 'AI Family Plan',     detail: '1500 tok/day',x: 310, y: 80,  color: '#7B1FA2', r: 16, people: 28, spread: 16, seed: 113 },
    { id: 'booster',   name: 'Token Booster 200',  detail: 'Top-up',      x: 130, y: 150, color: '#00C853', r: 14, people: 22, spread: 14, seed: 221 },
    { id: 'dev-pack',  name: 'Developer Token Pack',detail: 'API access', x: 350, y: 160, color: '#00C853', r: 12, people: 18, spread: 14, seed: 222 },
    { id: 'enterprise',name: 'Enterprise API',     detail: 'B2B bundle',  x: 280, y: 220, color: '#EFA73D', r: 14, people: 20, spread: 14, seed: 331 },
  ],
  commerce: [
    { id: 'catalogue', name: 'Digital Catalogue',  detail: 'Photo-based', x: 80,  y: 65,  color: '#0F3CC9', r: 18, people: 35, spread: 18, seed: 111 },
    { id: 'sourcing',  name: 'Smart Sourcing',     detail: 'Wholesale',   x: 200, y: 55,  color: '#0F3CC9', r: 20, people: 48, spread: 20, seed: 112 },
    { id: 'upi-settle',name: 'UPI Settlement',     detail: 'Instant',     x: 155, y: 130, color: '#00C853', r: 16, people: 30, spread: 16, seed: 221 },
    { id: 'voice-ord', name: 'Voice Ordering',     detail: 'Agentic',     x: 320, y: 70,  color: '#7B1FA2', r: 18, people: 38, spread: 18, seed: 222 },
    { id: 'delivery',  name: 'Delivery Network',   detail: 'Rider alloc', x: 290, y: 180, color: '#EFA73D', r: 14, people: 22, spread: 14, seed: 331 },
    { id: 'festive',   name: 'Festive Demand AI',  detail: 'Stock pred.', x: 70,  y: 220, color: '#D9008D', r: 14, people: 20, spread: 14, seed: 441 },
  ],
  support: [
    { id: 'speed',     name: 'Speed Test Fix',     detail: 'Auto-diag',   x: 80,  y: 60,  color: '#0F3CC9', r: 18, people: 38, spread: 18, seed: 111 },
    { id: 'upgrade',   name: 'Plan Upgrade Assist', detail: 'AI guided',  x: 200, y: 55,  color: '#0F3CC9', r: 20, people: 50, spread: 20, seed: 112 },
    { id: 'billing',   name: 'Bill Dispute',       detail: 'Resolution',  x: 310, y: 75,  color: '#EFA73D', r: 14, people: 22, spread: 14, seed: 221 },
    { id: 'netdiag',   name: 'Network Diagnostics',detail: 'Deep scan',   x: 140, y: 140, color: '#00C853', r: 16, people: 30, spread: 16, seed: 222 },
    { id: 'device',    name: 'Device Setup Guide', detail: 'Step-by-step',x: 70,  y: 210, color: '#7B1FA2', r: 13, people: 18, spread: 14, seed: 331 },
    { id: 'roaming',   name: 'Roaming Support',    detail: 'Intl help',   x: 290, y: 200, color: '#D9008D', r: 14, people: 20, spread: 14, seed: 441 },
  ],
  finance: [
    { id: 'upi-cash',  name: 'UPI Cashback 5%',    detail: 'Payments',   x: 80,  y: 60,  color: '#0F3CC9', r: 16, people: 32, spread: 17, seed: 111 },
    { id: 'insure',    name: 'JioInsure Health',   detail: '₹499/yr',    x: 140, y: 140, color: '#0F3CC9', r: 14, people: 20, spread: 14, seed: 112 },
    { id: 'mf-sip',    name: 'Mutual Fund SIP',    detail: 'Auto-invest',x: 300, y: 65,  color: '#00C853', r: 16, people: 28, spread: 16, seed: 221 },
    { id: 'credit',    name: 'Credit Line ₹50K',   detail: 'Pre-approved',x: 210, y: 100, color: '#7B1FA2', r: 18, people: 40, spread: 18, seed: 222 },
    { id: 'gold',      name: 'Gold Investment',    detail: 'Digital gold',x: 340, y: 150, color: '#EFA73D', r: 12, people: 16, spread: 12, seed: 331 },
    { id: 'ins-bundle',name: 'Insurance Bundle',   detail: 'Life + Health',x: 80, y: 240, color: '#D9008D', r: 14, people: 22, spread: 14, seed: 441 },
  ],
}

/* ── Gap zones (people with no offer) ── */
const GAPS_BY_SCENARIO = {
  home: [
    { id: 'heavy-ai', label: 'Heavy AI Users', potential: '₹8.1Cr', x: 80, y: 240, people: 22, spread: 18, seed: 661, color: '#DA2441' },
    { id: 'sme-bulk', label: 'SME Bulk Tokens', potential: '₹5.3Cr', x: 360, y: 260, people: 18, spread: 15, seed: 771, color: '#DA2441' },
  ],
  commerce: [
    { id: 'rural-mile', label: 'Rural Last-Mile', potential: '₹5.1Cr', x: 360, y: 240, people: 20, spread: 18, seed: 661, color: '#DA2441' },
    { id: 'ondc', label: 'ONDC Integration', potential: '₹8.3Cr', x: 160, y: 270, people: 22, spread: 16, seed: 771, color: '#DA2441' },
  ],
  support: [
    { id: 'complex-bill', label: 'Complex Billing', potential: '₹3.2Cr', x: 350, y: 240, people: 18, spread: 15, seed: 661, color: '#DA2441' },
    { id: 'multi-lang', label: 'Multi-language', potential: '₹5.7Cr', x: 170, y: 270, people: 22, spread: 18, seed: 771, color: '#DA2441' },
  ],
  finance: [
    { id: 'micro-loan', label: 'Micro-loans Rural', potential: '₹7.4Cr', x: 360, y: 230, people: 20, spread: 16, seed: 661, color: '#DA2441' },
    { id: 'cross-border', label: 'Cross-border Pay', potential: '₹4.1Cr', x: 180, y: 270, people: 18, spread: 15, seed: 771, color: '#DA2441' },
  ],
}

/* ── Action vectors (cumulative drift) ── */
const VECTORS = {
  'service-tap':     { x: 1.2,  y: -0.8, color: '#D9008D' },
  'search-tap':      { x: -0.6, y: -1.8, color: '#D9008D' },
  'plan-select':     { x: 3.5,  y: -1.0, color: '#00C853' },
  'chat-reply':      { x: 0.5,  y: 1.2,  color: '#7B1FA2' },
  'ai-tap':          { x: 1.8,  y: 0.5,  color: '#7B1FA2' },
  'finance-action':  { x: -2.5, y: 2.5,  color: '#0F3CC9' },
  'transaction-tap': { x: -1.8, y: 2.2,  color: '#0F3CC9' },
  'quick-action':    { x: 1.0,  y: 0.4,  color: '#7B1FA2' },
  'promo-tap':       { x: 0.8,  y: 1.0,  color: '#7B1FA2' },
  'tab-tap':         { x: 0.4,  y: 0.2,  color: 'rgba(0,0,0,0.35)' },
  'nav-back':        { x: -0.3, y: -0.1, color: 'rgba(0,0,0,0.35)' },
  'voice-order':     { x: 2.5,  y: -1.5, color: '#7B1FA2' },
  'store-select':    { x: 1.5,  y: 0.8,  color: '#00C853' },
  'basket-confirm':  { x: 2.0,  y: -0.5, color: '#0F3CC9' },
  'delivery-track':  { x: -1.0, y: 1.5,  color: '#EFA73D' },
}

function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }

export default function ClusterMap({ lastEvent, eventCount, scenario }) {
  /* Generate all people dots once */
  const offers = OFFERS_BY_SCENARIO[scenario] || OFFERS_BY_SCENARIO.home
  const gaps = GAPS_BY_SCENARIO[scenario] || GAPS_BY_SCENARIO.home
  const offerPeople = useMemo(() => offers.flatMap(o =>
    gaussian(o.x, o.y, o.people, o.spread, o.seed).map(p => ({ ...p, color: o.color, offerId: o.id }))
  ), [offers])
  const gapPeople = useMemo(() => gaps.flatMap(g =>
    gaussian(g.x, g.y, g.people, g.spread, g.seed).map(p => ({ ...p, color: g.color, gapId: g.id }))
  ), [gaps])

  const VASCO_START = { x: 185, y: 130 }
  const [vascoPos, setVascoPos] = useState(VASCO_START)
  const [vascoColor, setVascoColor] = useState('#0F3CC9')
  const [trail, setTrail] = useState([VASCO_START])
  const [actionCount, setActionCount] = useState(0)

  /* Nearest offer to Vasco */
  const nearestOffer = useMemo(() => {
    let best = null, bestD = Infinity
    for (const o of offers) {
      const d = dist(vascoPos, o)
      if (d < bestD) { bestD = d; best = { ...o, dist: d } }
    }
    return best
  }, [vascoPos, offers])

  const isNearOffer = nearestOffer && nearestOffer.dist < 40

  useEffect(() => {
    if (!lastEvent) return
    const vec = VECTORS[lastEvent.type] || { x: 0.3, y: 0.2, color: 'rgba(0,0,0,0.35)' }
    setVascoColor(vec.color)
    setVascoPos(prev => {
      const nx = Math.max(20, Math.min(400, prev.x + vec.x))
      const ny = Math.max(20, Math.min(295, prev.y + vec.y))
      setTrail(t => [...t.slice(-25), { x: nx, y: ny }])
      return { x: nx, y: ny }
    })
    setActionCount(c => c + 1)
  }, [lastEvent])

  return (
    <svg viewBox="0 0 420 310" style={{ width: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[1,2,3,4,5,6].map(i => <line key={`gx${i}`} x1={i*60} y1={0} x2={i*60} y2={310} stroke="#F0F2F5" strokeWidth={0.4} />)}
      {[1,2,3,4].map(i => <line key={`gy${i}`} x1={0} y1={i*65} x2={420} y2={i*65} stroke="#F0F2F5" strokeWidth={0.4} />)}

      {/* ── People dots (around offers) ── */}
      {offerPeople.map((p, i) => (
        <circle key={`op${i}`} cx={p.x} cy={p.y} r={1.2}
          fill={p.color} fillOpacity={0.18} />
      ))}

      {/* ── Gap people (no offer nearby) ── */}
      {gapPeople.map((p, i) => (
        <circle key={`gp${i}`} cx={p.x} cy={p.y} r={1.2}
          fill={p.color} fillOpacity={0.2} />
      ))}

      {/* ── Gap boundaries ── */}
      {gaps.map(g => (
        <g key={g.id}>
          <ellipse cx={g.x} cy={g.y}
            rx={g.spread + 8} ry={g.spread + 5}
            fill="none" stroke="#DA2441" strokeWidth={0.8}
            strokeOpacity={0.2} strokeDasharray="3 3" />
          <text x={g.x} y={g.y - g.spread - 8}
            textAnchor="middle" fontSize={7} fontWeight={600}
            fontFamily="var(--mono)" fill="#DA2441" opacity={0.6}>
            {g.label}
          </text>
          <text x={g.x} y={g.y - g.spread - 0}
            textAnchor="middle" fontSize={6.5} fontWeight={700}
            fontFamily="var(--mono)" fill="#DA2441" opacity={0.45}>
            GAP {g.potential}
          </text>
        </g>
      ))}

      {/* ── Offer circles ── */}
      {offers.map(o => {
        const isNearest = isNearOffer && nearestOffer.id === o.id
        return (
          <g key={o.id}>
            {/* Glow when Vasco is near */}
            {isNearest && (
              <circle cx={o.x} cy={o.y} r={o.r + 8}
                fill={o.color} fillOpacity={0.08}
                stroke={o.color} strokeWidth={1} strokeOpacity={0.2}>
                <animate attributeName="r" values={`${o.r + 6};${o.r + 10};${o.r + 6}`} dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Circle */}
            <circle cx={o.x} cy={o.y} r={o.r}
              fill="#fff"
              stroke={o.color}
              strokeWidth={isNearest ? 2 : 1}
              strokeOpacity={isNearest ? 0.7 : 0.3}
              style={{ transition: 'all 0.4s' }}
            />
            {/* Offer name */}
            <text x={o.x} y={o.y - 2}
              textAnchor="middle" fontSize={6.5} fontWeight={600}
              fontFamily="var(--mono)" fill={isNearest ? o.color : 'var(--jio-black)'}
              style={{ transition: 'fill 0.3s' }}>
              {o.name.length > 16 ? o.name.slice(0, 15) + '…' : o.name}
            </text>
            {/* Detail */}
            <text x={o.x} y={o.y + 7}
              textAnchor="middle" fontSize={6} fontWeight={500}
              fontFamily="var(--mono)" fill="rgba(0,0,0,0.3)">
              {o.detail}
            </text>
          </g>
        )
      })}

      {/* ── Vasco trail ── */}
      {trail.length > 1 && (
        <polyline
          points={trail.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={vascoColor} strokeWidth={0.7}
          strokeOpacity={0.15} strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 0.3s' }}
        />
      )}

      {/* ── Vasco ── */}
      <g>
        <circle cx={vascoPos.x} cy={vascoPos.y} r={9}
          fill={vascoColor} fillOpacity={0.06}
          style={{ transition: 'cx 0.5s ease, cy 0.5s ease, fill 0.3s' }} />
        <circle cx={vascoPos.x} cy={vascoPos.y} r={4}
          fill={vascoColor} stroke="#fff" strokeWidth={1.5}
          style={{ transition: 'cx 0.5s ease, cy 0.5s ease, fill 0.3s' }}>
          <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={vascoPos.x + 9} y={vascoPos.y - 4}
          fontSize={7.5} fontWeight={600} fontFamily="var(--mono)" fill={vascoColor}
          style={{ transition: 'all 0.5s ease' }}>
          vasco_e
        </text>
        {actionCount > 0 && (
          <text x={vascoPos.x + 9} y={vascoPos.y + 5}
            fontSize={6} fontFamily="var(--mono)" fill="rgba(0,0,0,0.2)"
            style={{ transition: 'all 0.5s ease' }}>
            {actionCount} actions
          </text>
        )}
      </g>

      {/* ── Nearest offer label (when close) ── */}
      {isNearOffer && actionCount > 0 && (
        <g>
          <line x1={vascoPos.x} y1={vascoPos.y}
            x2={nearestOffer.x} y2={nearestOffer.y}
            stroke={nearestOffer.color} strokeWidth={0.8} strokeOpacity={0.25}
            strokeDasharray="3 2" />
          <rect x={nearestOffer.x - 36} y={nearestOffer.y + nearestOffer.r + 4}
            width={72} height={14} rx={3}
            fill={nearestOffer.color} fillOpacity={0.08}
            stroke={nearestOffer.color} strokeWidth={0.5} strokeOpacity={0.2} />
          <text x={nearestOffer.x} y={nearestOffer.y + nearestOffer.r + 14}
            textAnchor="middle" fontSize={7} fontWeight={600}
            fontFamily="var(--mono)" fill={nearestOffer.color}>
            Recommended
          </text>
        </g>
      )}
    </svg>
  )
}
