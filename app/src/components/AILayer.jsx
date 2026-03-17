import { useEffect, useState, useRef } from 'react'

/*
 * AI Processing Layer — "Vasco's Session"
 * Shows what's happening for THIS specific user:
 * pipeline flow → trace detail → request log
 */

const TRACES = {
  'service-tap':    { spans: ['api.intent.detect', 'svc.profile.lookup', 'engine.context', 'router.decide', 'svc.personalize'] },
  'plan-select':    { spans: ['api.intent.detect', 'ml.usage.analyze', 'ml.recommend.infer', 'svc.price.optimize', 'svc.offer.build'] },
  'chat-reply':     { spans: ['asr.transcribe', 'nlu.classify', 'kb.retrieve', 'llm.generate', 'tts.synthesize'] },
  'ai-tap':         { spans: ['graph.user.fetch', 'ml.usage.predict', 'ml.plan.match', 'svc.savings.calc', 'api.recommend'] },
  'finance-action': { spans: ['auth.token.verify', 'ml.fraud.score', 'upi.gateway.call', 'db.balance.update', 'svc.notify.push'] },
  'transaction-tap':{ spans: ['db.txn.fetch', 'ml.category.tag', 'ml.pattern.match', 'llm.insight.gen', 'api.dashboard.sync'] },
  'quick-action':   { spans: ['api.intent.detect', 'svc.eligible.check', 'db.offer.lookup', 'svc.price.calc', 'ui.render'] },
  'search-tap':     { spans: ['nlp.query.parse', 'idx.service.match', 'ml.rank.score', 'svc.personalize', 'ui.results'] },
  'promo-tap':      { spans: ['ml.segment.user', 'db.offer.match', 'svc.eligible.check', 'svc.price.rule', 'api.deeplink'] },
  'tab-tap':        { spans: ['router.switch', 'cache.prefetch', 'state.sync', 'ui.render', 'api.analytics'] },
  'nav-back':       { spans: ['router.pop', 'state.restore', 'cache.prefetch', 'ui.render'] },
  'voice-order':    { spans: ['asr.transcribe.hi_IN', 'nlu.items.extract', 'geo.store.search', 'ml.basket.assemble', 'svc.rider.dispatch'] },
  'store-select':   { spans: ['geo.store.lookup', 'db.stock.check', 'ml.price.compare', 'svc.store.verify', 'ui.store.render'] },
  'basket-confirm': { spans: ['db.basket.validate', 'ml.price.optimize', 'svc.payment.init', 'svc.store.notify', 'svc.rider.allocate'] },
  'delivery-track': { spans: ['geo.rider.locate', 'ml.eta.predict', 'svc.route.optimize', 'svc.notify.push', 'ui.map.render'] },
}

/* Pipeline stages — high-level architecture nodes (per scenario) */
const PIPELINES = {
  home:     [{ id: 'meter', label: 'Meter' }, { id: 'route', label: 'Route' }, { id: 'select', label: 'Select' }, { id: 'execute', label: 'Execute' }, { id: 'deduct', label: 'Deduct' }],
  commerce: [{ id: 'voice', label: 'Voice' }, { id: 'extract', label: 'Extract' }, { id: 'search', label: 'Search' }, { id: 'assemble', label: 'Assemble' }, { id: 'dispatch', label: 'Dispatch' }],
  support:  [{ id: 'transcribe', label: 'Transcribe' }, { id: 'classify', label: 'Classify' }, { id: 'retrieve', label: 'Retrieve' }, { id: 'generate', label: 'Generate' }, { id: 'synthesize', label: 'Synthesize' }],
  finance:  [{ id: 'auth', label: 'Auth' }, { id: 'score', label: 'Score' }, { id: 'gateway', label: 'Gateway' }, { id: 'settle', label: 'Settle' }, { id: 'notify', label: 'Notify' }],
}

const MODELS = {
  home:     { name: 'JioGPT-Lite',       ver: 'v2.4', node: 'mum-edge-04' },
  commerce: { name: 'JioCommerce-Agent',  ver: 'v2.1', node: 'ai-cloud-12' },
  support:  { name: 'HelloJio-NLU',      ver: 'v4.0', node: 'mum-nlp-07' },
  finance:  { name: 'JioFin-Risk',       ver: 'v1.8', node: 'sec-encl-02' },
}

const SESSION_CONTEXT = {
  home: 'AI Plus tier \u2014 split inference active',
  commerce: 'Agentic order \u2014 Hindi voice \u2192 Gupta General Store',
  support: 'Intent: network_diagnostics \u2014 Hindi/English',
  finance: 'Risk level: Low \u2014 UPI transaction verified',
}

const METRICS_CONFIG = {
  home:     [{ k: 'Token Bal', v: () => `${Math.floor(Math.random() * 200 + 2300)}`, color: () => 'var(--jio-blue)' },
             { k: 'Tok/min', v: () => `${(Math.random() * 5 + 10).toFixed(1)}`, color: () => 'var(--jio-blue)' },
             { k: 'Edge%', v: () => `${Math.floor(Math.random() * 8 + 74)}%`, color: () => 'var(--jio-green)' },
             { k: 'Cost/Tok', v: () => `\u20B9${(Math.random() * 0.002 + 0.002).toFixed(3)}`, color: () => 'var(--jio-green)' }],
  commerce: [{ k: 'Stores', v: () => `${(Math.random() * 0.4 + 3.2).toFixed(1)}L`, color: () => 'var(--jio-blue)' },
             { k: 'Delivery', v: () => `${Math.floor(Math.random() * 8 + 18)}m`, color: (val) => 'var(--jio-green)' },
             { k: 'Voice%', v: () => `${Math.floor(Math.random() * 10 + 62)}%`, color: () => 'var(--jio-blue)' },
             { k: 'Basket', v: () => `\u20B9${Math.floor(Math.random() * 80 + 280)}`, color: () => 'var(--jio-gold)' }],
  support:  [{ k: 'Conf.', v: () => `${(Math.random() * 3 + 96).toFixed(1)}%`, color: () => 'var(--jio-green)' },
             { k: 'Resolve', v: () => `${(Math.random() * 4 + 87).toFixed(1)}%`, color: () => 'var(--jio-green)' },
             { k: 'Handle', v: () => `${(Math.random() * 1.5 + 1.8).toFixed(1)}m`, color: () => 'var(--jio-gold)' },
             { k: 'CSAT', v: () => `${(Math.random() * 0.4 + 4.4).toFixed(1)}`, color: () => 'var(--jio-green)' }],
  finance:  [{ k: 'Fraud', v: () => `${(Math.random() * 0.05 + 0.01).toFixed(2)}`, color: () => 'var(--jio-green)' },
             { k: 'Txn/s', v: () => `${(Math.random() * 3 + 11).toFixed(1)}K`, color: () => 'var(--jio-blue)' },
             { k: 'Block%', v: () => `${(Math.random() * 0.2 + 0.2).toFixed(1)}%`, color: () => 'var(--jio-gold)' },
             { k: 'UPI OK', v: () => `${(Math.random() * 0.3 + 99.5).toFixed(1)}%`, color: () => 'var(--jio-green)' }],
}

function useMetrics(n, scenario) {
  const [m, setM] = useState([])
  useEffect(() => {
    const config = METRICS_CONFIG[scenario] || METRICS_CONFIG.home
    setM(config.map(c => ({ k: c.k, v: c.v(), color: c.color() })))
  }, [n, scenario])
  return m
}

const card = {
  background: '#fff',
  borderRadius: 'var(--jio-radius)',
  boxShadow: 'var(--jio-shadow)',
  overflow: 'hidden',
}

const sectionLabel = {
  fontSize: 9, fontWeight: 700, color: 'var(--jio-grey-muted)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
}

export default function AILayer({ events, scenario }) {
  const [trace, setTrace] = useState(null)
  const [revealed, setRevealed] = useState(0)
  const [pipelineActive, setPipelineActive] = useState(-1)
  const timeouts = useRef([])
  const model = MODELS[scenario] || MODELS.home
  const pipeline = PIPELINES[scenario] || PIPELINES.home
  const met = useMetrics(events.length, scenario)

  useEffect(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    if (!events.length) return

    const ev = events[0]
    const def = TRACES[ev.type] || TRACES['tab-tap']
    const spans = def.spans.map((name) => {
      const dur = Math.floor(Math.random() * 28 + 2)
      return { name, dur, status: 200 }
    })
    let cumulative = 0
    spans.forEach(s => { s.offset = cumulative; cumulative += s.dur + Math.floor(Math.random() * 3) })
    const total = cumulative

    const traceId = Math.random().toString(16).slice(2, 14)
    const isEdge = total < 60
    const tokens = isEdge ? Math.floor(Math.random() * 6 + 3) : Math.floor(Math.random() * 30 + 20)
    const tokenType = isEdge ? 'Edge SLM' : 'Core LLM'
    setTrace({ id: traceId, type: ev.type, spans, total, time: ev.timestamp, tokens, tokenType })
    setRevealed(0)

    // Animate pipeline stages
    setPipelineActive(0)
    pipeline.forEach((_, i) => {
      timeouts.current.push(setTimeout(() => setPipelineActive(i), 60 + i * 140))
    })
    // Then animate trace spans
    spans.forEach((_, i) => {
      timeouts.current.push(setTimeout(() => setRevealed(i + 1), 60 + pipeline.length * 140 + i * 120))
    })
    // Clear pipeline highlight after all done
    timeouts.current.push(setTimeout(() => setPipelineActive(pipeline.length), 60 + pipeline.length * 140 + spans.length * 120 + 300))

    return () => timeouts.current.forEach(clearTimeout)
  }, [events, pipeline])

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--jio-bg)',
      fontFamily: 'var(--font)',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1, overflow: 'auto', padding: '16px 14px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>

        {/* ── Session Header ── */}
        <div style={{ ...card, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--jio-black)' }}>
                Vasco Eguren
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--jio-grey-muted)', marginTop: 2 }}>
                {model.name} {model.ver} / {model.node}
              </div>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--jio-blue)', marginTop: 2, opacity: 0.7 }}>
                {SESSION_CONTEXT[scenario] || SESSION_CONTEXT.home}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jio-green)' }} />
                <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--jio-green)' }}>Live</span>
              </div>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--jio-grey-muted)', marginTop: 3 }}>
                {events.length} requests
              </div>
            </div>
          </div>

          {/* Metrics strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {met.map(m => (
              <div key={m.k} style={{ background: 'var(--jio-bg)', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--jio-grey-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: m.color, marginTop: 1 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pipeline Flow ── */}
        <div style={{ ...card, padding: '14px 16px' }}>
          <div style={{ ...sectionLabel, marginBottom: 12 }}>Pipeline</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'center' }}>
            {pipeline.map((stage, i) => {
              const isActive = pipelineActive >= i && pipelineActive < pipeline.length
              const isDone = pipelineActive >= pipeline.length || (pipelineActive > i && pipelineActive < pipeline.length)
              const isCurrent = pipelineActive === i && pipelineActive < pipeline.length
              return (
                <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Node */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    minWidth: 44,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: `2px solid ${isCurrent ? 'var(--jio-blue)' : isDone ? 'var(--jio-green)' : isActive ? 'var(--jio-blue)' : 'var(--jio-border)'}`,
                      background: isCurrent ? 'var(--jio-blue-soft)' : isDone ? 'var(--jio-green-soft)' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}>
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--jio-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : isCurrent ? (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--jio-blue)',
                          animation: 'pulse 1s ease infinite',
                        }} />
                      ) : (
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--jio-border)',
                        }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      color: isCurrent ? 'var(--jio-blue)' : isDone ? 'var(--jio-green)' : 'var(--jio-grey-muted)',
                      fontFamily: 'var(--mono)',
                      transition: 'color 0.2s ease',
                    }}>
                      {stage.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < pipeline.length - 1 && (
                    <div style={{
                      width: 20, height: 2, marginBottom: 18,
                      background: isDone ? 'var(--jio-green)' : isCurrent ? 'var(--jio-blue)' : 'var(--jio-border)',
                      transition: 'background 0.2s ease',
                      borderRadius: 1,
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Trace Detail ── */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px 8px',
          }}>
            <span style={sectionLabel}>Trace</span>
            {trace && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--jio-grey-muted)' }}>
                  {trace.id}
                </span>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 600,
                  color: trace.total < 80 ? 'var(--jio-green)' : 'var(--jio-gold)',
                }}>
                  {trace.total}ms
                </span>
                {trace.tokens && (
                  <span style={{
                    fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 600,
                    color: trace.tokenType === 'Edge SLM' ? 'var(--jio-green)' : 'var(--jio-blue)',
                    background: trace.tokenType === 'Edge SLM' ? 'var(--jio-green-soft)' : 'var(--jio-blue-soft)',
                    padding: '1px 6px', borderRadius: 4,
                  }}>
                    {trace.tokens} tok &middot; {trace.tokenType}
                  </span>
                )}
              </div>
            )}
          </div>

          {trace ? (
            <div style={{ borderTop: '1px solid var(--jio-border-light)' }}>
              {/* Trace type header */}
              <div style={{ padding: '8px 16px 4px' }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 500,
                  color: 'var(--jio-blue)',
                }}>
                  {trace.type}
                </span>
              </div>
              {/* Waterfall */}
              <div style={{ padding: '0 0 10px' }}>
                {trace.spans.map((span, i) => {
                  const show = i < revealed
                  const barLeft = (span.offset / trace.total) * 100
                  const barWidth = Math.max((span.dur / trace.total) * 100, 4)
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '100px 1fr 30px',
                      alignItems: 'center', gap: 6,
                      padding: '4px 16px',
                      opacity: show ? 1 : 0.25,
                      transition: 'opacity 0.2s ease',
                    }}>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--mono)',
                        color: show ? 'var(--jio-grey)' : 'var(--jio-grey-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {span.name}
                      </span>
                      <div style={{
                        position: 'relative', height: 12, borderRadius: 3,
                        background: 'var(--jio-bg)',
                      }}>
                        <div style={{
                          position: 'absolute', top: 1, bottom: 1,
                          left: `${barLeft}%`, width: `${barWidth}%`,
                          borderRadius: 2, minWidth: 4,
                          background: show
                            ? (span.dur > 25 ? 'var(--jio-gold)' : 'var(--jio-blue)')
                            : 'var(--jio-border)',
                          transition: 'background 0.3s, width 0.3s',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--mono)', textAlign: 'right',
                        color: show ? 'var(--jio-grey)' : 'var(--jio-grey-muted)',
                        fontWeight: show ? 500 : 400,
                      }}>
                        {span.dur}ms
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '24px 16px', textAlign: 'center',
              color: 'var(--jio-grey-muted)', fontSize: 11,
            }}>
              Waiting for trace...
            </div>
          )}
        </div>

        {/* ── Request Log ── */}
        <div style={{ ...card, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px 6px', flexShrink: 0,
          }}>
            <span style={sectionLabel}>Requests</span>
            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--jio-grey-muted)' }}>
              {events.length} total
            </span>
          </div>
          <div style={{
            overflow: 'auto', flex: 1,
            borderTop: '1px solid var(--jio-border-light)',
          }}>
            {events.length > 0 ? events.slice(0, 15).map((e, i) => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 16px',
                borderBottom: '1px solid var(--jio-border-light)',
                background: i === 0 ? 'var(--jio-blue-soft)' : 'transparent',
                animation: i === 0 ? 'fadeUp 0.2s ease' : 'none',
              }}>
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)',
                  color: 'var(--jio-grey-muted)', flexShrink: 0, width: 50,
                }}>
                  {e.timestamp}
                </span>
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 500,
                  color: i === 0 ? 'var(--jio-blue)' : 'var(--jio-grey)',
                  flexShrink: 0,
                }}>
                  {e.type}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{
                  fontSize: 9, fontFamily: 'var(--mono)',
                  color: 'var(--jio-green)', fontWeight: 600, flexShrink: 0,
                }}>
                  200
                </span>
              </div>
            )) : (
              <div style={{
                padding: '16px', textAlign: 'center',
                color: 'var(--jio-grey-muted)', fontSize: 10,
              }}>
                No requests yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
