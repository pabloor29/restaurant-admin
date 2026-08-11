import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont as loadSchibsted } from '@remotion/google-fonts/SchibstedGrotesk'
import { loadFont as loadHanken } from '@remotion/google-fonts/HankenGrotesk'
import { loadFont as loadNewsreader } from '@remotion/google-fonts/Newsreader'
import { C, easeOut, easeOutQuint } from './colors'

const { fontFamily: SCH } = loadSchibsted()
const { fontFamily: HAN } = loadHanken()
const { fontFamily: NEWS } = loadNewsreader()

const GOLD = '#F0A93B'

export const RESULTS_FPS = 30
export const RESULTS_DURATION = 540 // 18s

// ── Timeline (frames @30fps) ─────────────────────────────────
const T = {
  intro:  { from: 0,   len: 80  }, // 0–2.7s
  visites:{ from: 80,  len: 96  }, // 2.7–5.9s   409 visites
  resa:   { from: 176, len: 96  }, // 5.9–9.1s   99 réservations / 310 couverts
  avis:   { from: 272, len: 96  }, // 9.1–12.3s  18 avis Google
  recap:  { from: 368, len: 84  }, // 12.3–15.1s récap 3 chiffres
  outro:  { from: 452, len: 88  }, // 15.1–18s   Grâce à RESA
}

// count-up 0 → target
function countUp(frame: number, to: number, delay = 8, dur = 38) {
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint,
  })
  return Math.round(to * p)
}

export function ResaResultsJuillet() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Sequence from={T.intro.from} durationInFrames={T.intro.len}><Intro /></Sequence>
      <Sequence from={T.visites.from} durationInFrames={T.visites.len}>
        <StatScene
          len={T.visites.len} accent={C.infoText} tint={C.infoBg}
          value={409} label="visites sur le site" sub="Un site vitrine qui travaille pour lui."
        />
      </Sequence>
      <Sequence from={T.resa.from} durationInFrames={T.resa.len}>
        <StatScene
          len={T.resa.len} accent={C.pine} tint={C.pineLight}
          value={99} label="réservations" sub="soit" chipValue={310} chipUnit="couverts"
        />
      </Sequence>
      <Sequence from={T.avis.from} durationInFrames={T.avis.len}>
        <StatScene
          len={T.avis.len} accent={GOLD} tint={C.amberLight}
          value={18} prefix="+" label="avis Google" sub="Plus de preuve sociale, plus de visibilité." stars
        />
      </Sequence>
      <Sequence from={T.recap.from} durationInFrames={T.recap.len}><Recap /></Sequence>
      <Sequence from={T.outro.from} durationInFrames={T.outro.len}><Outro /></Sequence>
    </AbsoluteFill>
  )
}

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
function DriftGlow({ color, size = 900, x = '50%', y = '30%', op = 0.5 }: { color: string; size?: number; x?: string; y?: string; op?: number }) {
  const frame = useCurrentFrame()
  const dx = Math.sin(frame / 40) * 26
  const dy = Math.cos(frame / 52) * 22
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
      filter: 'blur(40px)', opacity: op, pointerEvents: 'none',
    }} />
  )
}

function TopPill({ op }: { op: number }) {
  return (
    <div style={{
      position: 'absolute', top: 140, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', opacity: op,
    }}>
      <span style={{
        fontFamily: HAN, fontSize: 26, fontWeight: 700, letterSpacing: '0.16em',
        color: C.pine, backgroundColor: C.surface, border: `1.5px solid ${C.border}`,
        padding: '12px 28px', borderRadius: 99,
      }}>
        JUILLET · GRÂCE À <span style={{ color: C.amber, fontWeight: 800 }}>RESA</span>
      </span>
    </div>
  )
}

function Stars({ frame, size = 44, gap = 8, start = 0 }: { frame: number; size?: number; gap?: number; start?: number }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {[0, 1, 2, 3, 4].map(i => {
        const delay = start + i * 5
        const on = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
        const scale = interpolate(frame, [delay, delay + 6, delay + 12], [0.3, 1.18, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <span key={i} style={{ fontSize: size, lineHeight: 1, color: on > 0.5 ? GOLD : 'rgba(0,0,0,0.12)', opacity: on, transform: `scale(${scale})`, display: 'inline-block' }}>★</span>
        )
      })}
    </div>
  )
}

// animated progress ring drawn around the big number
function Ring({ frame, accent, size = 620, delay = 6 }: { frame: number; accent: string; size?: number; delay?: number }) {
  const stroke = 12
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const p = interpolate(frame, [delay, delay + 46], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint })
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} opacity={0.5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)}
      />
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════
// INTRO
// ═════════════════════════════════════════════════════════════
function Intro() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const badgeOp = interpolate(frame, [4, 16], [0, 1], { extrapolateRight: 'clamp' })
  const badgeScale = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 130 } })

  const t1Op = interpolate(frame, [16, 30], [0, 1], { extrapolateRight: 'clamp' })
  const t1Y = interpolate(frame, [16, 32], [34, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const subOp = interpolate(frame, [34, 48], [0, 1], { extrapolateRight: 'clamp' })
  const subY = interpolate(frame, [34, 50], [24, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const sceneOp = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.pineDark} 0%, ${C.pine} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sceneOp, padding: 80,
    }}>
      <DriftGlow color={`${C.amber}30`} size={900} y="22%" op={1} />

      <div style={{
        opacity: badgeOp, transform: `scale(${badgeScale})`,
        fontFamily: HAN, fontSize: 30, fontWeight: 700, letterSpacing: '0.18em',
        color: C.pineDark, backgroundColor: C.amberBright, padding: '13px 30px', borderRadius: 99, marginBottom: 48,
      }}>UN RESTAURANT · UN MOIS</div>

      <h1 style={{
        margin: 0, fontFamily: SCH, fontSize: 132, fontWeight: 900, color: C.paper,
        letterSpacing: '-0.045em', lineHeight: 0.96, textAlign: 'center',
        opacity: t1Op, transform: `translateY(${t1Y}px)`,
      }}>Voilà ce que<br />donne <span style={{ color: C.amberBright }}>juillet</span></h1>

      <p style={{
        margin: '36px 0 0', fontFamily: NEWS, fontStyle: 'italic', fontSize: 50, color: C.amberLight,
        textAlign: 'center', opacity: subOp, transform: `translateY(${subY}px)`,
      }}>avec RESA — sans lever le petit doigt.</p>
    </AbsoluteFill>
  )
}

// ═════════════════════════════════════════════════════════════
// STAT SCENE (big count-up)
// ═════════════════════════════════════════════════════════════
function StatScene({ len, accent, tint, value, prefix = '', label, sub, chipValue, chipUnit, stars }: {
  len: number
  accent: string
  tint: string
  value: number
  prefix?: string
  label: string
  sub: string
  chipValue?: number
  chipUnit?: string
  stars?: boolean
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const inOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const outOp = interpolate(frame, [len - 12, len], [1, 0], { extrapolateLeft: 'clamp' })
  const op = Math.min(inOp, outOp)

  const numScale = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 120 } })
  const n = countUp(frame, value)

  const labelOp = interpolate(frame, [30, 44], [0, 1], { extrapolateRight: 'clamp' })
  const labelY = interpolate(frame, [30, 46], [22, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const subOp = interpolate(frame, [44, 58], [0, 1], { extrapolateRight: 'clamp' })

  const chip = chipValue != null ? countUp(frame, chipValue, 20, 38) : 0
  const chipScale = spring({ frame: frame - 42, fps, config: { damping: 12, stiffness: 130 } })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.paper} 0%, ${C.surfaceAlt} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: op, padding: 60,
    }}>
      <DriftGlow color={tint} size={760} y="46%" op={0.85} />
      <TopPill op={interpolate(frame, [6, 18], [0, 1], { extrapolateRight: 'clamp' })} />

      {/* big number + ring */}
      <div style={{ position: 'relative', width: 620, height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ring frame={frame} accent={accent} />
        <div style={{ transform: `scale(${numScale})`, display: 'flex', alignItems: 'baseline', color: accent }}>
          {prefix && (
            <span style={{ fontFamily: SCH, fontSize: 150, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{prefix}</span>
          )}
          <span style={{ fontFamily: SCH, fontSize: 250, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>{n}</span>
        </div>
      </div>

      <p style={{
        margin: '10px 0 0', fontFamily: SCH, fontSize: 74, fontWeight: 800, color: C.ink,
        letterSpacing: '-0.03em', textAlign: 'center', opacity: labelOp, transform: `translateY(${labelY}px)`,
      }}>{label}</p>

      {stars && (
        <div style={{ marginTop: 24, opacity: subOp }}><Stars frame={frame - 44} size={54} gap={12} /></div>
      )}

      {chipValue != null ? (
        <div style={{
          marginTop: 28, opacity: subOp, transform: `scale(${chipScale})`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontFamily: NEWS, fontStyle: 'italic', fontSize: 44, color: C.slate }}>{sub}</span>
          <span style={{
            fontFamily: SCH, fontSize: 56, fontWeight: 900, color: C.amber, letterSpacing: '-0.03em',
            backgroundColor: C.amberLight, padding: '8px 26px', borderRadius: 20,
          }}>{chip} {chipUnit}</span>
        </div>
      ) : (
        <p style={{
          margin: '26px 0 0', fontFamily: NEWS, fontStyle: 'italic', fontSize: 44, color: C.slate,
          textAlign: 'center', opacity: subOp, maxWidth: 820,
        }}>{sub}</p>
      )}
    </AbsoluteFill>
  )
}

// ═════════════════════════════════════════════════════════════
// RECAP
// ═════════════════════════════════════════════════════════════
// accents éclaircis : lisibles sur fond pine sombre
const RECAP_ROWS = [
  { value: 409, prefix: '',  label: 'visites sur le site',            accent: '#8FBEDF' },
  { value: 99,  prefix: '',  label: 'réservations · 310 couverts',   accent: '#79D9AE' },
  { value: 18,  prefix: '+', label: 'avis Google',                    accent: C.amberBright },
]

function Recap() {
  const frame = useCurrentFrame()
  const { len } = T.recap
  const inOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const outOp = interpolate(frame, [len - 12, len], [1, 0], { extrapolateLeft: 'clamp' })
  const op = Math.min(inOp, outOp)

  const titleOp = interpolate(frame, [4, 16], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [4, 18], [24, 0], { extrapolateRight: 'clamp', easing: easeOut })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.pineDark} 0%, ${C.pine} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: op, padding: 80,
    }}>
      <DriftGlow color={`${C.amber}26`} size={880} y="20%" op={1} />

      <p style={{
        margin: '0 0 56px', fontFamily: HAN, fontSize: 34, fontWeight: 700, letterSpacing: '0.16em',
        color: C.amberBright, opacity: titleOp, transform: `translateY(${titleY}px)`,
      }}>UN SEUL MOIS · JUILLET</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, width: '100%', maxWidth: 860 }}>
        {RECAP_ROWS.map((r, i) => {
          const d = 14 + i * 14
          const rowOp = interpolate(frame, [d, d + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const rowX = interpolate(frame, [d, d + 16], [-40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
          const n = countUp(frame, r.value, d, 30)
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 28,
              backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 24, padding: '26px 34px',
              opacity: rowOp, transform: `translateX(${rowX}px)`,
            }}>
              <span style={{
                fontFamily: SCH, fontSize: 96, fontWeight: 900, color: r.accent, letterSpacing: '-0.04em',
                lineHeight: 1, minWidth: 240, textAlign: 'right',
              }}>{r.prefix}{n}</span>
              <span style={{ fontFamily: HAN, fontSize: 40, fontWeight: 600, color: C.paper, lineHeight: 1.15 }}>{r.label}</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ═════════════════════════════════════════════════════════════
// OUTRO
// ═════════════════════════════════════════════════════════════
function Outro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const t1Op = interpolate(frame, [6, 20], [0, 1], { extrapolateRight: 'clamp' })
  const t1Y = interpolate(frame, [6, 22], [28, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const logoScale = spring({ frame: frame - 28, fps, config: { damping: 12, stiffness: 120 } })
  const logoOp = interpolate(frame, [28, 40], [0, 1], { extrapolateRight: 'clamp' })
  const urlOp = interpolate(frame, [46, 58], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.pineDark} 0%, ${C.pine} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80,
    }}>
      <DriftGlow color={`${C.amber}24`} size={860} op={1} />

      <h1 style={{
        margin: 0, fontFamily: SCH, fontSize: 104, fontWeight: 900, color: C.paper, letterSpacing: '-0.04em',
        lineHeight: 1.0, textAlign: 'center', opacity: t1Op, transform: `translateY(${t1Y}px)`,
      }}>Et si c&apos;était<br />votre restaurant ?</h1>

      <div style={{
        marginTop: 60, opacity: logoOp, transform: `scale(${logoScale})`,
        fontFamily: SCH, fontSize: 120, fontWeight: 900, color: C.amberBright, letterSpacing: '0.02em',
      }}>RESA</div>

      <p style={{
        margin: '20px 0 0', fontFamily: HAN, fontSize: 42, fontWeight: 600, color: C.paper, opacity: urlOp, letterSpacing: '-0.01em',
      }}>resa-service.com</p>
    </AbsoluteFill>
  )
}