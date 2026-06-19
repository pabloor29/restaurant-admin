import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F } from './colors'

export function SceneIntro() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const logoScale = spring({ frame, fps, config: { damping: 10, stiffness: 120, mass: 0.9 } })
  const logoOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  const resaOpacity = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const resaX = interpolate(frame, [12, 28], [-24, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const taglineOpacity = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const taglineY = interpolate(frame, [30, 48], [20, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const lineW = interpolate(frame, [42, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const sceneOpacity = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.pineDark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 0,
      opacity: sceneOpacity,
    }}>
      {/* Logo row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        opacity: logoOpacity,
        transform: `scale(${logoScale})`,
        marginBottom: 28,
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          backgroundColor: C.amber,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 48px rgba(199,126,58,0.35)',
        }}>
          <span style={{ fontFamily: F.primary, fontSize: 44, fontWeight: 800, color: C.paper, lineHeight: 1 }}>R</span>
        </div>
        <span style={{
          fontFamily: F.primary,
          fontSize: 88,
          fontWeight: 800,
          color: C.paper,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          opacity: resaOpacity,
          transform: `translateX(${resaX}px)`,
          display: 'inline-block',
        }}>RESA</span>
      </div>

      {/* Underline */}
      <div style={{
        width: 420,
        height: 2,
        backgroundColor: C.amber,
        transform: `scaleX(${lineW})`,
        transformOrigin: 'left',
        marginBottom: 28,
        borderRadius: 2,
        opacity: 0.6,
      }} />

      {/* Tagline */}
      <p style={{
        fontFamily: F.secondary,
        fontSize: 18,
        fontWeight: 500,
        color: C.muted,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        margin: 0,
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
        textAlign: 'center',
      }}>
        L&apos;espace admin qui pilote votre restaurant
      </p>
    </AbsoluteFill>
  )
}
