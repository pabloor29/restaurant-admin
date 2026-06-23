import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont as loadSchibsted } from '@remotion/google-fonts/SchibstedGrotesk'
import { loadFont as loadHanken } from '@remotion/google-fonts/HankenGrotesk'
import { loadFont as loadNewsreader } from '@remotion/google-fonts/Newsreader'
import { C, easeOut, easeOutQuint } from './colors'

const { fontFamily: SCHIBSTED } = loadSchibsted()
const { fontFamily: HANKEN } = loadHanken()
const { fontFamily: NEWS } = loadNewsreader()

export const RESA_LI_FPS = 30
// 6.5s total — fits LinkedIn autoplay attention window
export const RESA_LI_DURATION = 195

const T = {
  hook:    { from: 0,   len: 60  },  // 0–2s     "4 restaurants."
  clients: { from: 50,  len: 75  },  // ~1.7–4.2s logos list
  outil:   { from: 115, len: 50  },  // ~3.8–5.5s "1 outil. Zéro résa perdue."
  cta:     { from: 155, len: 40  },  // ~5.2–6.5s price + URL
}

export function ResaLinkedInPost() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Sequence from={T.hook.from} durationInFrames={T.hook.len}>
        <SceneHook />
      </Sequence>
      <Sequence from={T.clients.from} durationInFrames={T.clients.len}>
        <SceneClients />
      </Sequence>
      <Sequence from={T.outil.from} durationInFrames={T.outil.len}>
        <SceneOutil />
      </Sequence>
      <Sequence from={T.cta.from} durationInFrames={T.cta.len}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  )
}

// ── Scene 1 — Hook: "4 restaurants." ─────────────────────────
function SceneHook() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const numScale = spring({ frame, fps, config: { damping: 9, stiffness: 110, mass: 0.7 } })
  const numOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  const labelOp = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' })
  const labelY = interpolate(frame, [20, 38], [22, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const lineW = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp', easing: easeOutQuint })

  const sceneOp = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const numSize = vertical ? 520 : 380
  const labelSize = vertical ? 72 : 56

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.paper} 0%, ${C.surfaceAlt} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: sceneOp,
    }}>
      {/* Amber accent blob */}
      <div style={{
        position: 'absolute',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amberLight} 0%, transparent 65%)`,
        opacity: 0.65,
        filter: 'blur(30px)',
        top: '15%',
      }} />

      <div style={{
        fontFamily: SCHIBSTED,
        fontSize: numSize,
        fontWeight: 900,
        color: C.pine,
        lineHeight: 0.9,
        opacity: numOp,
        transform: `scale(${numScale})`,
        textShadow: `0 12px 40px ${C.pine}22`,
        letterSpacing: '-0.04em',
      }}>4</div>

      <div style={{
        width: 320,
        height: 3,
        backgroundColor: C.amber,
        transform: `scaleX(${lineW})`,
        transformOrigin: 'center',
        margin: '24px 0 28px',
        borderRadius: 2,
      }} />

      <div style={{
        fontFamily: HANKEN,
        fontSize: labelSize,
        fontWeight: 600,
        color: C.ink,
        opacity: labelOp,
        transform: `translateY(${labelY}px)`,
        letterSpacing: '-0.02em',
      }}>restaurants nous font confiance.</div>
    </AbsoluteFill>
  )
}

// ── Scene 2 — Clients list ──────────────────────────────────
const CLIENTS = [
  { name: 'Bocante', tag: "L'Isle-sur-la-Sorgue" },
  { name: 'Restaurant Carbo', tag: 'Carcassonne' },
  { name: 'Floridablanca', tag: 'Carcassonne' },
  { name: "L'Atelier de l'Écharpe", tag: 'Toulouse' },
]

function SceneClients() {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const titleOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [0, 14], [-12, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const sceneOp = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: C.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      opacity: sceneOp,
    }}>
      <p style={{
        fontFamily: NEWS,
        fontStyle: 'italic',
        fontSize: 48,
        color: C.slate,
        margin: 0,
        opacity: titleOp,
        transform: `translateY(${titleY}px)`,
        marginBottom: 50,
      }}>Ils nous font confiance</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, width: '100%', maxWidth: 820 }}>
        {CLIENTS.map((c, i) => {
          const start = 10 + i * 12
          const op = interpolate(frame, [start, start + 16], [0, 1], { extrapolateRight: 'clamp' })
          const x = interpolate(frame, [start, start + 20], [-40, 0], { extrapolateRight: 'clamp', easing: easeOut })
          return (
            <div key={c.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              backgroundColor: C.surface,
              padding: '22px 32px',
              borderRadius: 14,
              border: `1px solid ${C.border}`,
              boxShadow: `0 4px 16px ${C.ink}08`,
              opacity: op,
              transform: `translateX(${x}px)`,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                backgroundColor: C.amber,
                flexShrink: 0,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: SCHIBSTED,
                  fontWeight: 700,
                  fontSize: 38,
                  color: C.ink,
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}>{c.name}</span>
                <span style={{
                  fontFamily: HANKEN,
                  fontSize: 22,
                  color: C.slate,
                  marginTop: 4,
                }}>{c.tag}</span>
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 3 — "1 outil. Zéro résa perdue." ─────────────────
function SceneOutil() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const oneScale = spring({ frame, fps, config: { damping: 10, stiffness: 130 } })
  const oneOp = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  const outilOp = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: 'clamp' })
  const outilY = interpolate(frame, [10, 24], [20, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const zeroOp = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: 'clamp' })
  const zeroY = interpolate(frame, [22, 38], [22, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const sceneOp = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${C.pineDark} 0%, ${C.pine} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: sceneOp,
    }}>
      <div style={{
        position: 'absolute',
        width: 800, height: 800, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amber}22 0%, transparent 60%)`,
        filter: 'blur(40px)',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 32,
        opacity: oneOp,
        transform: `scale(${oneScale})`,
      }}>
        <span style={{
          fontFamily: SCHIBSTED,
          fontSize: 380,
          fontWeight: 900,
          color: C.amberBright,
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
        }}>1</span>
        <span style={{
          fontFamily: HANKEN,
          fontSize: 90,
          fontWeight: 600,
          color: C.paper,
          opacity: outilOp,
          transform: `translateY(${outilY}px)`,
          letterSpacing: '-0.02em',
        }}>outil.</span>
      </div>

      <p style={{
        fontFamily: NEWS,
        fontStyle: 'italic',
        fontSize: 56,
        color: C.amberLight,
        margin: 0,
        marginTop: 30,
        opacity: zeroOp,
        transform: `translateY(${zeroY}px)`,
      }}>Zéro réservation perdue.</p>
    </AbsoluteFill>
  )
}

// ── Scene 4 — CTA: price + URL ──────────────────────────────
function SceneCTA() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } })
  const cardOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  const priceOp = interpolate(frame, [8, 22], [0, 1], { extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [18, 30], [0, 1], { extrapolateRight: 'clamp' })
  const urlOp = interpolate(frame, [24, 36], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: C.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 60,
    }}>
      <div style={{
        backgroundColor: C.surface,
        borderRadius: 28,
        padding: '60px 70px',
        border: `2px solid ${C.amber}`,
        boxShadow: `0 24px 60px ${C.ink}18`,
        opacity: cardOp,
        transform: `scale(${cardScale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}>
        <span style={{
          fontFamily: HANKEN,
          fontSize: 28,
          color: C.slate,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          fontWeight: 600,
        }}>Tout inclus</span>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          opacity: priceOp,
        }}>
          <span style={{
            fontFamily: SCHIBSTED,
            fontSize: 200,
            fontWeight: 900,
            color: C.pine,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
          }}>67€</span>
          <span style={{
            fontFamily: HANKEN,
            fontSize: 44,
            fontWeight: 500,
            color: C.slate,
          }}>/mois</span>
        </div>

        <p style={{
          fontFamily: NEWS,
          fontStyle: 'italic',
          fontSize: 32,
          color: C.slate,
          margin: 0,
          opacity: subOp,
        }}>Site · Réservations · SEO · Hébergement</p>
      </div>

      <div style={{
        marginTop: 50,
        opacity: urlOp,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          fontFamily: SCHIBSTED,
          fontSize: 46,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: '-0.01em',
        }}>resa-service.com</span>
      </div>
    </AbsoluteFill>
  )
}
