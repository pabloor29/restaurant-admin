import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F } from './colors'

const FEATURES = [
  {
    icon: '📅',
    title: 'Réservations automatisées',
    desc: 'Chaque demande reçue par email, traitée en un clic.',
    color: C.pineLight,
    accent: C.pine,
  },
  {
    icon: '📋',
    title: 'Planning journalier',
    desc: 'Visualisez votre salle en temps réel, jour par jour.',
    color: C.amberLight,
    accent: C.amber,
  },
  {
    icon: '📈',
    title: 'Statistiques & suivi',
    desc: 'Réservations, couverts, tendances — tout en un tableau de bord.',
    color: C.pineLight,
    accent: C.pine,
  },
]

function FeatureCard({ icon, title, desc, color, accent, delay, frame, fps }: {
  icon: string; title: string; desc: string; color: string; accent: string
  delay: number; frame: number; fps: number
}) {
  const localFrame = Math.max(0, frame - delay)
  const s = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 130, mass: 0.8 } })
  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(s, [0, 1], [60, 0])

  return (
    <div style={{
      backgroundColor: C.white,
      border: `1.5px solid ${C.border}`,
      borderRadius: 20,
      padding: '32px 28px',
      flex: 1,
      opacity,
      transform: `translateY(${translateY}px)`,
      boxShadow: '0 4px 24px rgba(22,32,27,0.06)',
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        marginBottom: 18,
      }}>{icon}</div>
      <p style={{
        fontFamily: F.primary,
        fontSize: 20,
        fontWeight: 700,
        color: C.ink,
        margin: '0 0 10px',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>{title}</p>
      <p style={{
        fontFamily: F.secondary,
        fontSize: 14,
        color: C.slate,
        margin: 0,
        lineHeight: 1.6,
      }}>{desc}</p>
      <div style={{
        marginTop: 20,
        height: 3,
        width: 40,
        backgroundColor: accent,
        borderRadius: 2,
        opacity: 0.7,
      }} />
    </div>
  )
}

export function SceneFeatures() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [0, 20], [-20, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 64px',
      opacity: sceneOpacity * bgOpacity,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52, opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <p style={{
          fontFamily: F.secondary,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: C.amber,
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>Une solution complète</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: 48,
          fontWeight: 800,
          color: C.ink,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>Tout ce dont votre<br />restaurant a besoin.</h2>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 1000 }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} delay={i * 20 + 10} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  )
}
