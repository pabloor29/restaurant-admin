import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'

const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
const BARS = [
  { h: 0.35 }, { h: 0.52 }, { h: 0.61 },
  { h: 0.78 }, { h: 0.68 }, { h: 0.90 },
  { h: 1.00 }, { h: 0.95 }, { h: 0.82 },
  { h: 0.72 }, { h: 0.58 }, { h: 0.63 },
]

function CountUp({ target, frame, startFrame, duration }: { target: number; frame: number; startFrame: number; duration: number }) {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 2.5),
  })
  return <>{Math.round(progress * target).toLocaleString('fr-FR')}</>
}

export function SceneStats() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width
  const k = vertical ? 1.85 : 1
  const vs = (v: number) => v * k

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [0, 18], [-16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // Stats counters
  const statsOp = interpolate(frame, [12, 32], [0, 1], { extrapolateRight: 'clamp' })
  const statsY = interpolate(frame, [12, 32], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // Toggle bar
  const toggleOp = interpolate(frame, [28, 46], [0, 1], { extrapolateRight: 'clamp' })

  // Bars
  const barsSpring = spring({ frame: Math.max(0, frame - 38), fps, config: { damping: 20, stiffness: 80, mass: 1.2 } })

  // Toggle highlighter slides Mois → 3 mois → Année with smooth frame-driven glide
  const toggleIdx = frame < 80 ? 1 : frame < 110 ? 2 : 3
  // Per-tab stride in pixels (matches rendered tab width)
  const tabStride = vertical ? 116 : 62
  const tabSlots = [0, tabStride, tabStride * 2, tabStride * 3]
  // Glide between positions: dwell, then ease into next
  const togglePos = interpolate(
    frame,
    [0, 78, 92, 108, 122],
    [tabSlots[1], tabSlots[1], tabSlots[2], tabSlots[2], tabSlots[3]],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut },
  )

  // bar pattern changes - shift depending on toggle
  const barHeights = BARS.map((b, i) => {
    const baseH = b.h
    const shift = toggleIdx === 1 ? 0 : toggleIdx === 2 ? Math.sin(i * 0.6) * 0.06 : Math.cos(i * 0.4) * 0.04
    return Math.max(0.15, Math.min(1, baseH + shift))
  })

  const cardW = vertical ? '100%' : 220
  const maxBarH = vertical ? 200 : 130
  const barW = vertical ? 56 : 36
  const barGap = vertical ? 14 : 8

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: vertical ? '40px 32px' : '20px 64px',
      opacity: bgOp * sceneOpacity,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: vs(24), opacity: titleOp, transform: `translateY(${titleY}px)` }}>
        <p style={{
          fontFamily: F.secondary, fontSize: vs(12), fontWeight: 600,
          letterSpacing: '0.18em', color: C.amber,
          textTransform: 'uppercase', margin: `0 0 ${vs(10)}px`,
        }}>Statistiques en temps réel</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: vertical ? 64 : 40,
          fontWeight: 800, color: C.ink,
          margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05,
        }}>Mesurez votre croissance.</h2>
      </div>

      {/* Stat counters */}
      <div style={{
        display: 'flex',
        gap: vs(16),
        marginBottom: vs(22),
        opacity: statsOp,
        transform: `translateY(${statsY}px)`,
        flexDirection: vertical ? 'column' : 'row',
        width: vertical ? '100%' : 'auto',
        maxWidth: vertical ? 700 : 'none',
      }}>
        <div style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: vs(13),
          padding: `${vs(18)}px ${vs(26)}px`,
          minWidth: cardW,
        }}>
          <p style={{
            fontFamily: F.secondary, fontSize: vs(12), fontWeight: 600,
            color: C.muted, letterSpacing: '0.1em',
            margin: `0 0 ${vs(6)}px`, textTransform: 'uppercase',
          }}>Total réservations</p>
          <p style={{
            fontFamily: F.primary, fontSize: vs(46), fontWeight: 800,
            color: C.pine, margin: 0, letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            <CountUp target={847} frame={frame} startFrame={20} duration={48} />
          </p>
        </div>
        <div style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: vs(13),
          padding: `${vs(18)}px ${vs(26)}px`,
          minWidth: cardW,
        }}>
          <p style={{
            fontFamily: F.secondary, fontSize: vs(12), fontWeight: 600,
            color: C.muted, letterSpacing: '0.1em',
            margin: `0 0 ${vs(6)}px`, textTransform: 'uppercase',
          }}>Total couverts</p>
          <p style={{
            fontFamily: F.primary, fontSize: vs(46), fontWeight: 800,
            color: C.amber, margin: 0, letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            <CountUp target={2341} frame={frame} startFrame={20} duration={52} />
          </p>
        </div>
      </div>

      {/* Toggle row */}
      <div style={{ display: 'flex', gap: vs(10), marginBottom: vs(16), opacity: toggleOp, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{
          position: 'relative',
          display: 'flex', gap: vs(2),
          padding: vs(5),
          borderRadius: vs(10),
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
        }}>
          {/* Sliding highlight */}
          <div style={{
            position: 'absolute',
            top: vs(5), bottom: vs(5),
            left: vs(5) + togglePos,
            width: tabStride - vs(6),
            backgroundColor: C.pineLight,
            borderRadius: vs(7),
            boxShadow: `inset 0 0 0 1px rgba(19,80,59,0.12)`,
          }} />
          {['Semaine', 'Mois', '3 mois', 'Année'].map((label, i) => {
            // Active color based on highlight proximity (smooth color flip)
            const slotCenter = tabSlots[i] + tabStride / 2
            const currentCenter = togglePos + tabStride / 2
            const dist = Math.abs(slotCenter - currentCenter) / tabStride
            const isActive = dist < 0.5
            return (
              <div key={label} style={{
                position: 'relative', zIndex: 1,
                padding: `${vs(7)}px 0`,
                width: tabStride,
                borderRadius: vs(7),
                fontFamily: F.secondary, fontSize: vs(13),
                fontWeight: isActive ? 600 : 400,
                color: isActive ? C.pine : C.slate,
                textAlign: 'center',
              }}>{label}</div>
            )
          })}
        </div>
        <div style={{
          display: 'flex', gap: vs(2),
          padding: vs(5),
          borderRadius: vs(10),
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
        }}>
          {['Réservations', 'Couverts'].map((label, i) => (
            <div key={label} style={{
              padding: `${vs(7)}px ${vs(14)}px`,
              borderRadius: vs(7),
              fontFamily: F.secondary, fontSize: vs(13),
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? C.pine : C.slate,
              backgroundColor: i === 0 ? C.pineLight : 'transparent',
            }}>{label}</div>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <div style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: vs(15),
        padding: `${vs(20)}px ${vs(20)}px ${vs(12)}px`,
        opacity: toggleOp,
        width: vertical ? '100%' : 'auto',
        maxWidth: vertical ? 920 : 580,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: barGap,
          height: maxBarH + vs(28),
          justifyContent: 'center',
        }}>
          {BARS.map((_, i) => {
            const barH = barHeights[i] * maxBarH * barsSpring
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vs(6) }}>
                <div style={{
                  width: barW,
                  height: barH,
                  borderRadius: `${vs(5)}px ${vs(5)}px 0 0`,
                  backgroundColor: C.pine,
                  opacity: 0.85,
                }} />
                <p style={{
                  fontFamily: F.secondary,
                  fontSize: vs(11),
                  color: C.muted,
                  margin: 0,
                }}>{MONTHS_SHORT[i]}</p>
              </div>
            )
          })}
        </div>
      </div>
    </AbsoluteFill>
  )
}
