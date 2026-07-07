import { ReactNode } from 'react'
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont as loadSchibsted } from '@remotion/google-fonts/SchibstedGrotesk'
import { loadFont as loadHanken } from '@remotion/google-fonts/HankenGrotesk'
import { loadFont as loadNewsreader } from '@remotion/google-fonts/Newsreader'
import { C, easeOut, easeOutQuint } from './colors'

const { fontFamily: SCH } = loadSchibsted()
const { fontFamily: HAN } = loadHanken()
const { fontFamily: NEWS } = loadNewsreader()

export const AVIS_FPS = 30
export const AVIS_DURATION = 520 // ~17.3s

const GOLD = '#F0A93B'

// ── Timeline (frames @30fps) ─────────────────────────────────
const T = {
  intro: { from: 0,   len: 74  }, // 0–2.5s
  stage: { from: 64,  len: 366 }, // 2.1–14.3s  phone + 3 screens
  outro: { from: 420, len: 100 }, // 14–17.3s
}

// Phone geometry
const PHONE_W = 600
const PHONE_H = 1180
const BEZEL = 16
const SW = PHONE_W - BEZEL * 2 // screen width 568

// visibility window helper: 0→1→1→0
function vis(f: number, inF: number, outF: number, fade = 12) {
  return interpolate(f, [inF, inF + fade, outF - fade, outF], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

export function ResaAvisGoogle() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Sequence from={T.intro.from} durationInFrames={T.intro.len}>
        <Intro />
      </Sequence>
      <Sequence from={T.stage.from} durationInFrames={T.stage.len}>
        <PhoneStage />
      </Sequence>
      <Sequence from={T.outro.from} durationInFrames={T.outro.len}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  )
}

// ─────────────────────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────────────────────
function Star({ size, fill, delay, frame }: { size: number; fill: number; delay: number; frame: number }) {
  const p = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const scale = interpolate(frame, [delay, delay + 6, delay + 12], [0.3, 1.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <span style={{
      fontSize: size,
      lineHeight: 1,
      color: p * fill > 0.5 ? GOLD : 'rgba(0,0,0,0.12)',
      opacity: interpolate(p, [0, 1], [0, 1]),
      transform: `scale(${scale})`,
      display: 'inline-block',
    }}>★</span>
  )
}

function Stars({ frame, size = 40, gap = 6, start = 0 }: { frame: number; size?: number; gap?: number; start?: number }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {[0, 1, 2, 3, 4].map(i => (
        <Star key={i} size={size} fill={1} delay={start + i * 5} frame={frame} />
      ))}
    </div>
  )
}

// ── Phone shell (dark frame + notch + clipped screen) ────────
function PhoneShell({ children, y, op }: { children: ReactNode; y: number; op: number }) {
  const { width } = useVideoConfig()
  return (
    <div style={{
      position: 'absolute',
      left: (width - PHONE_W) / 2,
      top: 340,
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 56,
      background: 'linear-gradient(160deg,#20241f 0%,#0c0f0b 100%)',
      padding: BEZEL,
      boxShadow: `0 40px 90px ${C.ink}40, 0 8px 24px ${C.ink}22, inset 0 0 0 2px rgba(255,255,255,0.06)`,
      transform: `translateY(${y}px)`,
      opacity: op,
    }}>
      <div style={{
        position: 'relative',
        width: SW,
        height: PHONE_H - BEZEL * 2,
        borderRadius: 42,
        overflow: 'hidden',
        backgroundColor: C.paper,
      }}>
        {children}
        {/* dynamic island */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 116,
          height: 30,
          borderRadius: 20,
          backgroundColor: '#070906',
          zIndex: 40,
        }} />
      </div>
    </div>
  )
}

// small status bar inside app screen
function AppHeader({ title }: { title: string }) {
  return (
    <div style={{
      paddingTop: 58,
      paddingBottom: 16,
      paddingLeft: 26,
      paddingRight: 26,
      borderBottom: `1px solid ${C.border}`,
      backgroundColor: C.surface,
    }}>
      <p style={{ margin: 0, fontFamily: SCH, fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{title}</p>
    </div>
  )
}

// caption above the phone
function Caption({ chip, title, sub, op }: { chip: string; title: string; sub: string; op: number }) {
  const frame = useCurrentFrame()
  const y = interpolate(op, [0, 1], [16, 0])
  return (
    <div style={{
      position: 'absolute',
      top: 96,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity: op,
      transform: `translateY(${y}px)`,
      padding: '0 60px',
      textAlign: 'center',
    }}>
      <span style={{
        fontFamily: HAN,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: '0.14em',
        color: C.amber,
        backgroundColor: C.amberLight,
        padding: '9px 20px',
        borderRadius: 99,
        marginBottom: 18,
      }}>{chip}</span>
      <p style={{ margin: 0, fontFamily: SCH, fontSize: 62, fontWeight: 900, color: C.pine, letterSpacing: '-0.03em', lineHeight: 1.02 }}>{title}</p>
      <p style={{ margin: '10px 0 0', fontFamily: NEWS, fontStyle: 'italic', fontSize: 34, color: C.slate }}>{sub}</p>
      {/* keep frame referenced to avoid lint noise on unused */}
      <span style={{ display: 'none' }}>{frame}</span>
    </div>
  )
}

// tap ripple + pointer
function Tap({ frame, at, x, y }: { frame: number; at: number; x: number; y: number }) {
  const t = frame - at
  if (t < 0 || t > 26) return null
  const r = interpolate(t, [0, 22], [10, 72], { extrapolateRight: 'clamp', easing: easeOut })
  const op = interpolate(t, [0, 4, 22], [0, 0.5, 0], { extrapolateRight: 'clamp' })
  const dot = interpolate(t, [0, 6, 16], [1, 0.85, 1], { extrapolateRight: 'clamp' })
  return (
    <>
      <div style={{
        position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2,
        borderRadius: '50%', border: `4px solid ${C.pine}`, opacity: op, zIndex: 30,
      }} />
      <div style={{
        position: 'absolute', left: x - 15, top: y - 15, width: 30, height: 30,
        borderRadius: '50%', backgroundColor: C.pine, opacity: 0.9, transform: `scale(${dot})`, zIndex: 31,
        boxShadow: `0 4px 12px ${C.pine}80`,
      }} />
    </>
  )
}

// ── Toggle switch (matches app: 40×22, pine when on) ─────────
function Toggle({ on }: { on: number }) {
  const w = 66, h = 36, knob = 28
  return (
    <span style={{
      position: 'relative', display: 'inline-block', width: w, height: h, borderRadius: 99,
      backgroundColor: interpolateColor(on, C.border, C.pine), flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 4, left: interpolate(on, [0, 1], [4, w - knob - 4]),
        width: knob, height: knob, borderRadius: '50%', backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </span>
  )
}

// crude hex lerp for toggle bg
function interpolateColor(t: number, a: string, b: string) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)]
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)]
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

// ═════════════════════════════════════════════════════════════
// SCENE — INTRO
// ═════════════════════════════════════════════════════════════
function Intro() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const badgeOp = interpolate(frame, [4, 16], [0, 1], { extrapolateRight: 'clamp' })
  const badgeScale = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 130 } })

  const t1Op = interpolate(frame, [16, 28], [0, 1], { extrapolateRight: 'clamp' })
  const t1Y = interpolate(frame, [16, 30], [30, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const subOp = interpolate(frame, [30, 44], [0, 1], { extrapolateRight: 'clamp' })
  const subY = interpolate(frame, [30, 46], [22, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const sceneOp = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.pineDark} 0%, ${C.pine} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sceneOp, padding: 70,
    }}>
      <div style={{
        position: 'absolute', width: 900, height: 900, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amber}26 0%, transparent 60%)`, filter: 'blur(50px)', top: '12%',
      }} />

      <div style={{
        opacity: badgeOp, transform: `scale(${badgeScale})`,
        fontFamily: HAN, fontSize: 30, fontWeight: 700, letterSpacing: '0.16em',
        color: C.pineDark, backgroundColor: C.amberBright, padding: '12px 26px', borderRadius: 99, marginBottom: 46,
      }}>NOUVELLE FONCTIONNALITÉ</div>

      <div style={{ marginBottom: 34, opacity: t1Op }}>
        <Stars frame={frame - 20} size={70} gap={12} start={0} />
      </div>

      <h1 style={{
        margin: 0, fontFamily: SCH, fontSize: 118, fontWeight: 900, color: C.paper,
        letterSpacing: '-0.04em', lineHeight: 0.98, textAlign: 'center',
        opacity: t1Op, transform: `translateY(${t1Y}px)`,
      }}>Vos avis<br />Google</h1>

      <p style={{
        margin: '30px 0 0', fontFamily: NEWS, fontStyle: 'italic', fontSize: 52, color: C.amberLight,
        textAlign: 'center', opacity: subOp, transform: `translateY(${subY}px)`,
      }}>en automatique — ou en un clic.</p>
    </AbsoluteFill>
  )
}

// ═════════════════════════════════════════════════════════════
// SCENE — PHONE STAGE (3 inner screens)
// ═════════════════════════════════════════════════════════════
function PhoneStage() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // phone slide in / out
  const inSpring = spring({ frame, fps, config: { damping: 15, stiffness: 90 }, durationInFrames: 28 })
  const yIn = interpolate(inSpring, [0, 1], [140, 0])
  const opIn = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })
  const opOut = interpolate(frame, [T.stage.len - 16, T.stage.len], [1, 0], { extrapolateLeft: 'clamp' })
  const yOut = interpolate(frame, [T.stage.len - 16, T.stage.len], [0, 80], { extrapolateLeft: 'clamp', easing: easeOut })

  // inner screen windows (local frames)
  const A = { in: 6,   out: 150 }
  const B = { in: 150, out: 260 }
  const D = { in: 260, out: 366 }

  const vA = vis(frame, A.in, A.out)
  const vB = vis(frame, B.in, B.out)
  const vD = vis(frame, D.in, D.out)

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.paper} 0%, ${C.surfaceAlt} 100%)` }}>
      {/* soft amber glow behind phone */}
      <div style={{
        position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)',
        width: 760, height: 760, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amberLight} 0%, transparent 62%)`, filter: 'blur(30px)', opacity: 0.7,
      }} />

      {/* captions */}
      <Caption chip="1 — AUTOMATIQUE" title="Un mail envoyé tout seul" sub="quelques heures après la réservation." op={vA} />
      <Caption chip="LE MAIL REÇU" title="Vos clients reçoivent ça" sub="un clic pour laisser un avis Google." op={vB} />
      <Caption chip="2 — MANUEL" title="Ou en un clic" sub="choisissez qui vous sollicitez." op={vD} />

      <PhoneShell y={yIn + yOut} op={Math.min(opIn, opOut)}>
        <div style={{ position: 'absolute', inset: 0, opacity: vA }}><ScreenAuto frame={frame - A.in} /></div>
        <div style={{ position: 'absolute', inset: 0, opacity: vB }}><ScreenEmail frame={frame - B.in} /></div>
        <div style={{ position: 'absolute', inset: 0, opacity: vD }}><ScreenManual frame={frame - D.in} /></div>
      </PhoneShell>
    </AbsoluteFill>
  )
}

// ── Screen A — Infos: Envoi automatique toggle ──────────────
function ScreenAuto({ frame }: { frame: number }) {
  const cardOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cardY = interpolate(frame, [8, 24], [26, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // toggle flips on ~frame 40
  const on = interpolate(frame, [40, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const savedOp = interpolate(frame, [58, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AppHeader title="Infos restaurant" />
      <div style={{ padding: '26px 22px' }}>
        <p style={{ margin: '0 0 14px', fontFamily: HAN, fontSize: 17, fontWeight: 600, letterSpacing: '0.12em', color: C.muted }}>
          DEMANDES D&apos;AVIS
        </p>

        <div style={{
          backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24,
          opacity: cardOp, transform: `translateY(${cardY}px)`, boxShadow: `0 10px 30px ${C.ink}0d`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: HAN, fontSize: 24, fontWeight: 700, color: C.ink }}>Envoi automatique</p>
              <p style={{ margin: '8px 0 0', fontFamily: HAN, fontSize: 17, lineHeight: 1.45, color: C.muted }}>
                Envoie un mail au client quelques heures après sa réservation pour lui demander un avis Google.
              </p>
            </div>
            <div style={{ paddingTop: 4 }}><Toggle on={on} /></div>
          </div>

          <div style={{ marginTop: 22 }}>
            <p style={{ margin: '0 0 8px', fontFamily: HAN, fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', color: C.muted }}>LIEN GOOGLE AVIS</p>
            <div style={{
              border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', backgroundColor: C.surfaceAlt,
              fontFamily: HAN, fontSize: 18, color: C.slate,
            }}>https://g.page/r/…/review</div>
          </div>

          <div style={{
            marginTop: 22, backgroundColor: C.pine, color: C.paper, borderRadius: 12,
            padding: '15px 26px', fontFamily: HAN, fontSize: 19, fontWeight: 600, textAlign: 'center', width: 'fit-content',
          }}>Enregistrer</div>
        </div>

        {/* saved confirmation pill */}
        <div style={{
          marginTop: 20, display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: C.okBg, border: `1px solid ${C.okText}33`, borderRadius: 12, padding: '14px 18px',
          opacity: savedOp,
        }}>
          <span style={{ fontSize: 22, color: C.okText }}>✓</span>
          <span style={{ fontFamily: HAN, fontSize: 19, fontWeight: 600, color: C.okText }}>Envoi automatique activé</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Screen B — the review request email ─────────────────────
function ScreenEmail({ frame }: { frame: number }) {
  const slide = interpolate(frame, [6, 24], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint })
  const op = interpolate(frame, [6, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const btnPulse = interpolate(frame % 60, [0, 30, 60], [1, 1.05, 1])
  const btnGlow = interpolate(frame % 60, [0, 30, 60], [0.25, 0.5, 0.25])

  return (
    <AbsoluteFill style={{ backgroundColor: C.surfaceAlt }}>
      {/* mail app header */}
      <div style={{
        paddingTop: 58, paddingBottom: 16, paddingLeft: 26, paddingRight: 26,
        borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>✉️</span>
        <div>
          <p style={{ margin: 0, fontFamily: HAN, fontSize: 20, fontWeight: 700, color: C.ink }}>Votre avis sur Le Floridablanca ?</p>
          <p style={{ margin: '2px 0 0', fontFamily: HAN, fontSize: 14, color: C.muted }}>Le Floridablanca · maintenant</p>
        </div>
      </div>

      {/* email body — replica of sendReviewEmail */}
      <div style={{ padding: 20, transform: `translateY(${slide}px)`, opacity: op }}>
        <div style={{ backgroundColor: C.paper, borderRadius: 20, padding: '28px 22px' }}>
          <p style={{ margin: '0 0 24px', textAlign: 'center', fontFamily: SCH, fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
            Le Floridablanca
          </p>

          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '26px 20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Stars frame={frame - 22} size={38} gap={5} start={0} />
            </div>
            <p style={{ margin: '0 0 10px', fontFamily: HAN, fontSize: 24, fontWeight: 700, color: C.ink }}>Merci de votre visite !</p>
            <p style={{ margin: '0 0 18px', fontFamily: HAN, fontSize: 18, lineHeight: 1.5, color: C.slate }}>
              Nous espérons que vous avez passé un agréable moment chez nous.
            </p>
            <p style={{ margin: '0 0 22px', fontFamily: HAN, fontSize: 18, lineHeight: 1.5, color: C.slate }}>
              Votre avis nous aiderait beaucoup. Prendriez-vous une minute pour le partager sur Google ?
            </p>
            <div style={{
              display: 'inline-block', backgroundColor: C.pine, color: C.white, fontFamily: HAN, fontSize: 20, fontWeight: 600,
              padding: '15px 34px', borderRadius: 12, transform: `scale(${btnPulse})`,
              boxShadow: `0 8px 24px rgba(19,80,59,${btnGlow})`,
            }}>Laisser un avis</div>
          </div>

          <p style={{ margin: '22px 0 0', textAlign: 'center', fontFamily: HAN, fontSize: 14, color: C.muted }}>
            Réservations gérées avec <strong style={{ color: C.pine }}>RESA</strong>
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Screen D — Reservations list, manual "Demander un avis" ──
const RESA_ROWS = [
  { name: 'Camille Roux',   time: '20:30', covers: 2, status: 'accepted' as const, tapAt: 30 },
  { name: 'Julien Mercier', time: '21:00', covers: 4, status: 'arrived'  as const, tapAt: 64 },
  { name: 'Sofia Nardini',  time: '19:45', covers: 2, status: 'accepted' as const, tapAt: -1 },
]

function ScreenManual({ frame }: { frame: number }) {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AppHeader title="Réservations" />
      <div style={{ padding: '22px 20px' }}>
        <p style={{ margin: '0 0 16px', fontFamily: HAN, fontSize: 16, fontWeight: 600, letterSpacing: '0.12em', color: C.muted }}>
          PLANNING DU JOUR
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
          {RESA_ROWS.map((r, i) => {
            const op = interpolate(frame, [8 + i * 8, 22 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const y = interpolate(frame, [8 + i * 8, 24 + i * 8], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
            const sent = r.tapAt >= 0 && frame > r.tapAt + 6
            return (
              <div key={r.name} style={{ opacity: op, transform: `translateY(${y}px)` }}>
                <ResaRow r={r} sent={sent} />
              </div>
            )
          })}

          {/* tap indicators */}
          {RESA_ROWS.map((r, i) =>
            r.tapAt >= 0 ? <Tap key={i} frame={frame} at={r.tapAt} x={SW - 120} y={92 + i * 132} /> : null,
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function ResaRow({ r, sent }: { r: { name: string; time: string; covers: number; status: 'accepted' | 'arrived' }; sent: boolean }) {
  const statusColor = r.status === 'accepted'
    ? { text: C.okText, bg: C.okBg, label: 'Confirmée', bar: C.okText }
    : { text: C.infoText, bg: C.infoBg, label: 'Arrivée', bar: C.infoText }
  return (
    <div style={{
      backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `4px solid ${statusColor.bar}`,
      borderRadius: 14, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <p style={{ margin: 0, fontFamily: SCH, fontSize: 21, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>{r.name}</p>
        <span style={{ fontFamily: HAN, fontSize: 14, fontWeight: 600, color: statusColor.text, backgroundColor: statusColor.bg, padding: '3px 11px', borderRadius: 99 }}>
          {statusColor.label}
        </span>
      </div>
      <p style={{ margin: '0 0 12px', fontFamily: HAN, fontSize: 16, color: C.slate }}>
        {r.time} · {r.covers} couverts · client@email.fr
      </p>
      {sent ? (
        <span style={{
          fontFamily: HAN, fontSize: 16, color: C.muted, backgroundColor: C.surfaceAlt,
          border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 16px', display: 'inline-block',
        }}>✓ Avis envoyé</span>
      ) : (
        <span style={{
          fontFamily: HAN, fontSize: 16, fontWeight: 600, color: C.pine, backgroundColor: C.pineLight,
          border: `1px solid ${C.pine}`, borderRadius: 10, padding: '9px 16px', display: 'inline-block',
        }}>★ Demander un avis</span>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// SCENE — OUTRO
// ═════════════════════════════════════════════════════════════
function Outro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const starsOp = interpolate(frame, [4, 16], [0, 1], { extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [14, 28], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [14, 30], [26, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const logoScale = spring({ frame: frame - 34, fps, config: { damping: 12, stiffness: 120 } })
  const logoOp = interpolate(frame, [34, 46], [0, 1], { extrapolateRight: 'clamp' })
  const urlOp = interpolate(frame, [48, 60], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.pineDark} 0%, ${C.pine} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 70,
    }}>
      <div style={{
        position: 'absolute', width: 880, height: 880, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amber}22 0%, transparent 60%)`, filter: 'blur(46px)',
      }} />

      <div style={{ marginBottom: 40, opacity: starsOp }}>
        <Stars frame={frame - 4} size={72} gap={14} start={0} />
      </div>

      <h1 style={{
        margin: 0, fontFamily: SCH, fontSize: 92, fontWeight: 900, color: C.paper, letterSpacing: '-0.03em',
        lineHeight: 1.0, textAlign: 'center', opacity: titleOp, transform: `translateY(${titleY}px)`,
      }}>Plus d&apos;avis.<br />Plus de visibilité.</h1>

      <div style={{
        marginTop: 56, opacity: logoOp, transform: `scale(${logoScale})`,
        fontFamily: SCH, fontSize: 108, fontWeight: 900, color: C.amberBright, letterSpacing: '0.02em',
      }}>RESA</div>

      <p style={{
        margin: '18px 0 0', fontFamily: HAN, fontSize: 40, fontWeight: 600, color: C.paper, opacity: urlOp, letterSpacing: '-0.01em',
      }}>resa-service.com</p>
    </AbsoluteFill>
  )
}
