import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F } from './colors'

const INCLUDED = [
  'Site web sur-mesure',
  'Réservations automatisées',
  'Espace d\'administration',
  'Hébergement & maintenance',
  'Référencement (SEO)',
  'Support dédié',
]

export function SceneCTA() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const bgOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })

  const priceScale = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 10, stiffness: 130, mass: 0.9 } })
  const priceOpacity = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: 'clamp' })

  const subtitleOpacity = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: 'clamp' })
  const subtitleY = interpolate(frame, [22, 38], [16, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const dividerW = interpolate(frame, [34, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const logoOpacity = interpolate(frame, [70, 88], [0, 1], { extrapolateRight: 'clamp' })
  const logoY = interpolate(frame, [70, 88], [12, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.pine,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      opacity: bgOpacity,
      padding: '0 64px',
    }}>
      {/* Price badge */}
      <div style={{
        transform: `scale(${priceScale})`,
        opacity: priceOpacity,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontFamily: F.secondary, fontSize: 28, fontWeight: 600, color: 'rgba(245,241,233,0.6)', marginTop: 12 }}>à partir de</span>
          <span style={{ fontFamily: F.primary, fontSize: 100, fontWeight: 800, color: C.amber, letterSpacing: '-0.06em', lineHeight: 1 }}>67€</span>
          <span style={{ fontFamily: F.secondary, fontSize: 22, fontWeight: 600, color: 'rgba(245,241,233,0.6)', marginTop: 18 }}>/mois</span>
        </div>
      </div>

      {/* Subtitle */}
      <p style={{
        fontFamily: F.secondary,
        fontSize: 20,
        color: 'rgba(245,241,233,0.8)',
        margin: '0 0 32px',
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
        textAlign: 'center',
      }}>Tout inclus. Sans surprise.</p>

      {/* Divider */}
      <div style={{
        width: 320,
        height: 1,
        backgroundColor: 'rgba(245,241,233,0.15)',
        transform: `scaleX(${dividerW})`,
        marginBottom: 28,
        borderRadius: 1,
      }} />

      {/* Features grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px 32px',
        marginBottom: 40,
      }}>
        {INCLUDED.map((item, i) => {
          const opacity = interpolate(frame, [44 + i * 8, 58 + i * 8], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          })
          const x = interpolate(frame, [44 + i * 8, 58 + i * 8], [-16, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity, transform: `translateX(${x}px)` }}>
              <span style={{ color: C.amber, fontSize: 14, fontWeight: 700 }}>✓</span>
              <span style={{ fontFamily: F.secondary, fontSize: 13, color: 'rgba(245,241,233,0.85)', fontWeight: 500 }}>{item}</span>
            </div>
          )
        })}
      </div>

      {/* RESA logo */}
      <div style={{ opacity: logoOpacity, transform: `translateY(${logoY}px)`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: C.amber,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: F.primary, fontSize: 19, fontWeight: 800, color: C.paper, lineHeight: 1 }}>R</span>
        </div>
        <span style={{ fontFamily: F.primary, fontSize: 26, fontWeight: 800, color: C.paper, letterSpacing: '-0.04em' }}>RESA</span>
      </div>
    </AbsoluteFill>
  )
}
