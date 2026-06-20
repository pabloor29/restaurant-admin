import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'

export function SceneIntro() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const logoScale = spring({ frame, fps, config: { damping: 11, stiffness: 130, mass: 0.9 } })
  const logoOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  const resaOpacity = interpolate(frame, [14, 30], [0, 1], { extrapolateRight: 'clamp' })
  const resaX = interpolate(frame, [14, 30], [-26, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const dotScale = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 7, stiffness: 200, mass: 0.5 } })

  const taglineOpacity = interpolate(frame, [34, 52], [0, 1], { extrapolateRight: 'clamp' })
  const taglineY = interpolate(frame, [34, 52], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  const lineW = interpolate(frame, [46, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const logoSize = vertical ? 180 : 90
  const wordSize = vertical ? 180 : 96
  const lineLen = vertical ? 620 : 460
  const tagSize = vertical ? 32 : 19

  return (
    <AbsoluteFill style={{
      backgroundColor: C.pineDark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      opacity: sceneOpacity,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        opacity: logoOpacity,
        transform: `scale(${logoScale})`,
        marginBottom: 32,
      }}>
        <div style={{
          width: logoSize,
          height: logoSize,
          borderRadius: 24,
          backgroundColor: C.amber,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 18px 56px rgba(199,126,58,0.4)',
        }}>
          <span style={{ fontFamily: F.primary, fontSize: logoSize * 0.55, fontWeight: 800, color: C.paper, lineHeight: 1, letterSpacing: '-0.03em' }}>R</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          opacity: resaOpacity,
          transform: `translateX(${resaX}px)`,
        }}>
          <span style={{
            fontFamily: F.primary,
            fontSize: wordSize,
            fontWeight: 800,
            color: C.paper,
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}>RESA</span>
          <span style={{
            fontFamily: F.primary,
            fontSize: wordSize,
            fontWeight: 800,
            color: C.amber,
            lineHeight: 1,
            display: 'inline-block',
            transform: `scale(${dotScale})`,
            transformOrigin: 'bottom left',
          }}>.</span>
        </div>
      </div>

      <div style={{
        width: lineLen,
        height: 2,
        backgroundColor: C.amber,
        transform: `scaleX(${lineW})`,
        transformOrigin: 'left',
        marginBottom: 28,
        borderRadius: 2,
        opacity: 0.55,
      }} />

      <p style={{
        fontFamily: F.secondary,
        fontSize: tagSize,
        fontWeight: 500,
        color: 'rgba(245,241,233,0.55)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        margin: 0,
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
        textAlign: 'center',
        padding: '0 32px',
      }}>
        L&apos;espace admin qui pilote{vertical ? <br /> : ' '}votre restaurant
      </p>
    </AbsoluteFill>
  )
}
