import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut, easeOutQuint } from './colors'
import { CARBO, CARBO_F } from './CarboColors'

// ~140 frames · Carbo (pink panel · deep-green text · Anton wordmark · Caveat tagline)
// + RESA card. Line draws between them, badge pulses in.
export function CarboSceneTrust() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const bgOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const headOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: 'clamp' })
  const headY  = interpolate(frame, [4, 22], [18, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const carboSpring = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 14, stiffness: 110, mass: 0.9 } })
  const carboX = interpolate(carboSpring, [0, 1], [vertical ? 0 : -180, 0])
  const carboY = vertical ? interpolate(carboSpring, [0, 1], [-60, 0]) : 0
  const carboOp = interpolate(frame, [14, 30], [0, 1], { extrapolateRight: 'clamp' })

  const resaSpring = spring({ frame: Math.max(0, frame - 26), fps, config: { damping: 14, stiffness: 110, mass: 0.9 } })
  const resaX = interpolate(resaSpring, [0, 1], [vertical ? 0 : 180, 0])
  const resaY = vertical ? interpolate(resaSpring, [0, 1], [60, 0]) : 0
  const resaOp = interpolate(frame, [26, 44], [0, 1], { extrapolateRight: 'clamp' })

  const lineDraw = interpolate(frame, [46, 76], [0, 1], { extrapolateRight: 'clamp', easing: easeOutQuint })

  const badgeSpring = spring({ frame: Math.max(0, frame - 70), fps, config: { damping: 9, stiffness: 180, mass: 0.7 } })
  const badgeOp = interpolate(frame, [70, 86], [0, 1], { extrapolateRight: 'clamp' })

  const subOp = interpolate(frame, [82, 100], [0, 1], { extrapolateRight: 'clamp' })
  const subY  = interpolate(frame, [82, 100], [12, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const cardW = vertical ? 520 : 320
  const cardH = vertical ? 340 : 230

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      padding: vertical ? '40px 32px' : '36px 64px',
      opacity: bgOp * sceneOpacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: vertical ? 40 : 26, opacity: headOp, transform: `translateY(${headY}px)` }}>
        <p style={{
          fontFamily: F.secondary,
          fontSize: vertical ? 20 : 12,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: C.amber,
          margin: '0 0 10px',
        }}>Étude de cas</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: vertical ? 56 : 36,
          fontWeight: 800,
          color: C.ink,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}>Ils nous font confiance.</h2>
      </div>

      <div style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: vertical ? 'column' : 'row',
        gap: vertical ? 80 : 140,
      }}>
        {/* CARBO card — PINK panel, deep green text, Anton wordmark, script tagline */}
        <div style={{
          width: cardW,
          height: cardH,
          backgroundColor: CARBO.pink,
          borderRadius: 22,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          boxShadow: '0 24px 60px rgba(2,60,24,0.20)',
          opacity: carboOp,
          transform: `translate(${carboX}px, ${carboY}px)`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            bottom: -100, right: -80,
            width: 280, height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${CARBO.inkGreen}14 0%, ${CARBO.inkGreen}00 70%)`,
          }} />
          <p style={{
            fontFamily: CARBO_F.script,
            fontSize: vertical ? 30 : 22,
            color: CARBO.inkGreen,
            margin: 0,
            transform: 'rotate(-2deg)',
            lineHeight: 1,
          }}>le client</p>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{
              fontFamily: CARBO_F.anton,
              fontSize: vertical ? 160 : 102,
              fontWeight: 400,
              color: CARBO.inkGreen,
              lineHeight: 0.9,
              letterSpacing: '0.03em',
            }}>CARBO</span>
          </div>
          <p style={{
            fontFamily: CARBO_F.display,
            fontStyle: 'italic',
            fontSize: vertical ? 18 : 13,
            color: `${CARBO.inkGreen}cc`,
            letterSpacing: '0.04em',
            margin: 0,
          }}>restaurant-carbo.fr · Carcassonne</p>
        </div>

        {/* Connecting line + center badge */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: vertical ? 4 : 220,
          height: vertical ? 120 : 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: C.amber,
            transform: vertical ? `scaleY(${lineDraw})` : `scaleX(${lineDraw})`,
            transformOrigin: vertical ? 'top' : 'left',
            borderRadius: 2,
            opacity: 0.55,
          }} />
          <div style={{
            position: 'absolute',
            width: vertical ? 84 : 64,
            height: vertical ? 84 : 64,
            borderRadius: '50%',
            backgroundColor: C.amber,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: badgeOp,
            transform: `scale(${badgeSpring})`,
            boxShadow: '0 8px 28px rgba(199,126,58,0.45)',
            border: `4px solid ${C.paper}`,
          }}>
            <span style={{
              fontFamily: F.primary,
              fontSize: vertical ? 42 : 32,
              fontWeight: 800,
              color: C.paper,
              lineHeight: 1,
            }}>✓</span>
          </div>
        </div>

        {/* RESA card */}
        <div style={{
          width: cardW,
          height: cardH,
          backgroundColor: C.surface,
          borderRadius: 22,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          border: `1px solid ${C.border}`,
          boxShadow: '0 24px 60px rgba(22,32,27,0.12)',
          opacity: resaOp,
          transform: `translate(${resaX}px, ${resaY}px)`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: -60, left: -60,
            width: 220, height: 220,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${C.amber}22 0%, ${C.amber}00 70%)`,
          }} />
          <p style={{
            fontFamily: F.secondary,
            fontSize: vertical ? 16 : 11,
            color: C.amber,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            margin: 0,
            fontWeight: 600,
          }}>La solution</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: vertical ? 18 : 12 }}>
            <div style={{
              width: vertical ? 90 : 64,
              height: vertical ? 90 : 64,
              borderRadius: vertical ? 22 : 16,
              backgroundColor: C.pine,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 28px rgba(19,80,59,0.30)',
            }}>
              <span style={{ fontFamily: F.primary, fontSize: vertical ? 54 : 38, fontWeight: 800, color: C.paper, lineHeight: 1, letterSpacing: '-0.03em' }}>R</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{
                fontFamily: F.primary,
                fontSize: vertical ? 96 : 64,
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}>RESA</span>
              <span style={{
                fontFamily: F.primary,
                fontSize: vertical ? 96 : 64,
                fontWeight: 800,
                color: C.amber,
                lineHeight: 1,
              }}>.</span>
            </div>
          </div>
          <p style={{
            fontFamily: F.secondary,
            fontSize: vertical ? 14 : 10,
            color: C.muted,
            letterSpacing: '0.18em',
            margin: 0,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>resa-service.com</p>
        </div>
      </div>

      <p style={{
        fontFamily: F.accent,
        fontStyle: 'italic',
        fontSize: vertical ? 30 : 21,
        color: C.slate,
        margin: vertical ? '40px 0 0' : '28px 0 0',
        textAlign: 'center',
        opacity: subOp,
        transform: `translateY(${subY}px)`,
        letterSpacing: '0.01em',
      }}>
        Le restaurant <span style={{ color: CARBO.inkGreen, fontWeight: 700, fontStyle: 'normal', fontFamily: CARBO_F.anton, letterSpacing: '0.03em', fontSize: vertical ? 28 : 20 }}>CARBO</span> fait confiance à <span style={{ color: C.amber, fontWeight: 600, fontStyle: 'normal', fontFamily: F.primary }}>RESA.</span>
      </p>
    </AbsoluteFill>
  )
}
