import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { easeOut } from './colors'
import { CARBO, CARBO_F } from './CarboColors'

// ~90 frames · Carbo brand opener — navy hero gradient (matches HeroBanner),
// huge ANTON wordmark "CARBO" in cream, Caveat script tagline.
export function CarboSceneOpen() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const labelOp  = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const labelY   = interpolate(frame, [0, 18], [16, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const wordOp   = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  const wordY    = interpolate(frame, [10, 32], [40, 0], { extrapolateRight: 'clamp', easing: easeOut })
  const wordScale = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 12, stiffness: 110, mass: 0.9 } })

  // Pink underline draws under the wordmark
  const lineW    = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' })

  const subOp    = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' })
  const subY     = interpolate(frame, [50, 70], [22, 0], { extrapolateRight: 'clamp', easing: easeOut })
  const subRot   = interpolate(frame, [50, 70], [-2, -1.5], { extrapolateRight: 'clamp', easing: easeOut })

  const sceneOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const wordSize  = vertical ? 260 : 160
  const labelSize = vertical ? 22 : 13
  const subSize   = vertical ? 78 : 50
  const lineLen   = vertical ? 580 : 420

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(to bottom, ${CARBO.night1}, ${CARBO.night2})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: sceneOpacity,
      overflow: 'hidden',
    }}>
      {/* dark vignette overlay like the hero (60% black overlay on image) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.55) 90%)',
      }} />

      {/* soft pink glow behind wordmark */}
      <div style={{
        position: 'absolute',
        width: vertical ? 900 : 700,
        height: vertical ? 900 : 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${CARBO.pink}33 0%, ${CARBO.pink}00 60%)`,
        filter: 'blur(20px)',
        opacity: wordOp,
      }} />

      <p style={{
        fontFamily: CARBO_F.script,
        fontSize: labelSize * 1.6,
        color: CARBO.pink,
        margin: 0,
        opacity: labelOp,
        transform: `translateY(${labelY}px) rotate(-1.5deg)`,
        marginBottom: vertical ? 10 : 4,
      }}>
        Bienvenue chez
      </p>

      {/* Huge Anton wordmark */}
      <div style={{
        opacity: wordOp,
        transform: `translateY(${wordY}px) scale(${wordScale})`,
        zIndex: 1,
        display: 'flex',
        alignItems: 'baseline',
      }}>
        <span style={{
          fontFamily: CARBO_F.anton,
          fontSize: wordSize,
          fontWeight: 400,
          color: CARBO.cream,
          letterSpacing: vertical ? '0.04em' : '0.03em',
          lineHeight: 0.9,
          textShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}>CARBO</span>
      </div>

      {/* Pink underline */}
      <div style={{
        width: lineLen,
        height: 2,
        backgroundColor: CARBO.pink,
        transform: `scaleX(${lineW})`,
        transformOrigin: 'left',
        marginTop: vertical ? 30 : 18,
        marginBottom: vertical ? 28 : 14,
        opacity: 0.75,
        borderRadius: 2,
      }} />

      {/* Schoolbell-style script tagline */}
      <p style={{
        fontFamily: CARBO_F.script,
        fontSize: subSize,
        color: CARBO.cream,
        margin: 0,
        opacity: subOp,
        transform: `translateY(${subY}px) rotate(${subRot}deg)`,
        textAlign: 'center',
        padding: '0 32px',
        lineHeight: 1.05,
      }}>
        Cuisine italienne · Carcassonne
      </p>
    </AbsoluteFill>
  )
}
