import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F } from './colors'

const BARS = [
  { month: 'Jan', h: 0.35 }, { month: 'Fév', h: 0.52 }, { month: 'Mar', h: 0.61 },
  { month: 'Avr', h: 0.78 }, { month: 'Mai', h: 0.68 }, { month: 'Juin', h: 0.90 },
  { month: 'Juil', h: 1.00 }, { month: 'Aoû', h: 0.95 }, { month: 'Sep', h: 0.82 },
  { month: 'Oct', h: 0.72 }, { month: 'Nov', h: 0.58 }, { month: 'Déc', h: 0.63 },
]

function CountUp({ target, frame, startFrame, duration }: { target: number; frame: number; startFrame: number; duration: number }) {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 2.5),
  })
  return <>{Math.round(progress * target).toLocaleString('fr-FR')}</>
}

export function SceneStats() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const bgOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const titleOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [5, 22], [-20, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const barsProgress = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 80, mass: 1.2 } })

  const statsOpacity = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: 'clamp' })

  const maxBarH = 120

  return (
    <AbsoluteFill style={{
      backgroundColor: C.pineDark,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 64px',
      opacity: bgOpacity * sceneOpacity,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40, opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <p style={{
          fontFamily: F.secondary,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: C.amber,
          textTransform: 'uppercase',
          margin: '0 0 10px',
        }}>Statistiques en temps réel</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: 46,
          fontWeight: 800,
          color: C.paper,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>Mesurez votre croissance.</h2>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 36, opacity: statsOpacity }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 16,
          padding: '20px 32px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: F.secondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, margin: '0 0 6px', textTransform: 'uppercase' }}>Total réservations</p>
          <p style={{ fontFamily: F.primary, fontSize: 44, fontWeight: 800, color: C.pine === C.pine ? '#6ABFA0' : C.pine, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
            <CountUp target={847} frame={frame} startFrame={22} duration={50} />
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 16,
          padding: '20px 32px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: F.secondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, margin: '0 0 6px', textTransform: 'uppercase' }}>Total couverts</p>
          <p style={{ fontFamily: F.primary, fontSize: 44, fontWeight: 800, color: C.amber, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
            <CountUp target={2341} frame={frame} startFrame={22} duration={55} />
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        height: maxBarH + 28,
        opacity: statsOpacity,
      }}>
        {BARS.map((bar, i) => {
          const barDelay = i * 3
          const barProgress = interpolate(barsProgress, [0, 1], [0, 1])
          const barH = bar.h * maxBarH * barProgress

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 42,
                height: barH,
                borderRadius: '6px 6px 0 0',
                backgroundColor: C.amber,
                opacity: 0.8 + bar.h * 0.2,
                transition: 'none',
              }} />
              <p style={{
                fontFamily: F.secondary,
                fontSize: 10,
                color: C.muted,
                margin: 0,
                opacity: interpolate(frame, [barDelay + 30, barDelay + 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}>{bar.month}</p>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
