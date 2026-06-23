import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'
import { CARBO, CARBO_F } from './CarboColors'

// ~120 frames — closing card: RESA wordmark + "Recommandé par Carbo" badge + URL
export function CarboSceneOutro() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })

  // Recommendation badge (top)
  const badgeSpring = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 11, stiffness: 140, mass: 0.8 } })
  const badgeOp = interpolate(frame, [4, 20], [0, 1], { extrapolateRight: 'clamp' })

  // RESA logo
  const logoOp = interpolate(frame, [22, 40], [0, 1], { extrapolateRight: 'clamp' })
  const logoScale = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 12, stiffness: 120, mass: 0.9 } })
  const dot = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 7, stiffness: 220, mass: 0.5 } })

  // Tagline
  const tagOp = interpolate(frame, [46, 64], [0, 1], { extrapolateRight: 'clamp' })
  const tagY  = interpolate(frame, [46, 64], [16, 0], { extrapolateRight: 'clamp', easing: easeOut })

  // Line
  const lineW = interpolate(frame, [58, 84], [0, 1], { extrapolateRight: 'clamp' })

  // URL pill
  const urlOp = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: 'clamp' })
  const urlY  = interpolate(frame, [70, 90], [14, 0], { extrapolateRight: 'clamp', easing: easeOut })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.pineDark,
      padding: vertical ? '60px 40px' : '40px 80px',
      opacity: bgOp,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* warm amber glow */}
      <div style={{
        position: 'absolute',
        width: vertical ? 900 : 800,
        height: vertical ? 900 : 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amber}1F 0%, ${C.amber}00 60%)`,
      }} />

      {/* Recommendation badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        backgroundColor: `${CARBO.pink}22`,
        border: `1px solid ${CARBO.pink}55`,
        borderRadius: 999,
        padding: vertical ? '14px 28px' : '10px 22px',
        opacity: badgeOp,
        transform: `scale(${badgeSpring})`,
        marginBottom: vertical ? 60 : 38,
      }}>
        <span style={{ fontSize: vertical ? 22 : 16, color: CARBO.pink, lineHeight: 1 }}>★</span>
        <span style={{
          fontFamily: F.secondary,
          fontSize: vertical ? 18 : 12,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: CARBO.pink,
        }}>Recommandé par <span style={{ fontFamily: CARBO_F.anton, fontWeight: 400, letterSpacing: '0.05em', fontSize: vertical ? 22 : 14 }}>CARBO</span></span>
      </div>

      {/* RESA wordmark */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: vertical ? 26 : 18,
        opacity: logoOp,
        transform: `scale(${logoScale})`,
        zIndex: 1,
      }}>
        <div style={{
          width: vertical ? 140 : 96,
          height: vertical ? 140 : 96,
          borderRadius: vertical ? 28 : 20,
          backgroundColor: C.amber,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 56px rgba(199,126,58,0.45)',
        }}>
          <span style={{ fontFamily: F.primary, fontSize: vertical ? 92 : 58, fontWeight: 800, color: C.paper, lineHeight: 1, letterSpacing: '-0.03em' }}>R</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: F.primary,
            fontSize: vertical ? 180 : 110,
            fontWeight: 800,
            color: C.paper,
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}>RESA</span>
          <span style={{
            fontFamily: F.primary,
            fontSize: vertical ? 180 : 110,
            fontWeight: 800,
            color: C.amber,
            lineHeight: 1,
            display: 'inline-block',
            transform: `scale(${dot})`,
            transformOrigin: 'bottom left',
          }}>.</span>
        </div>
      </div>

      {/* Line */}
      <div style={{
        width: vertical ? 520 : 360,
        height: 1.5,
        backgroundColor: C.amber,
        transform: `scaleX(${lineW})`,
        transformOrigin: 'left',
        marginTop: vertical ? 38 : 26,
        marginBottom: vertical ? 28 : 18,
        opacity: 0.6,
      }} />

      <p style={{
        fontFamily: F.secondary,
        fontSize: vertical ? 22 : 14,
        fontWeight: 500,
        color: 'rgba(245,241,233,0.6)',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        margin: 0,
        opacity: tagOp,
        transform: `translateY(${tagY}px)`,
        textAlign: 'center',
      }}>
        Le système de réservation{vertical ? <br /> : ' '}qui fait grandir votre restaurant
      </p>

      {/* URL pill */}
      <div style={{
        marginTop: vertical ? 48 : 32,
        opacity: urlOp,
        transform: `translateY(${urlY}px)`,
        backgroundColor: C.paper,
        color: C.pineDark,
        borderRadius: 999,
        padding: vertical ? '16px 32px' : '11px 22px',
        fontFamily: F.primary,
        fontSize: vertical ? 22 : 15,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        boxShadow: '0 14px 38px rgba(0,0,0,0.32)',
      }}>
        resa-service.com →
      </div>
    </AbsoluteFill>
  )
}
