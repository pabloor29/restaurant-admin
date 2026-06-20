import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'

function FeatureCard({
  title, lines, icon, accent, frame, fps, delay, vs,
}: {
  title: string
  lines: { left: string; right: string }[]
  icon: React.ReactNode
  accent: string
  frame: number
  fps: number
  delay: number
  vs: (n: number) => number
}) {
  const localFrame = Math.max(0, frame - delay)
  const s = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } })
  const op = interpolate(localFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const y = interpolate(s, [0, 1], [40, 0])

  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: vs(14),
      padding: vs(20),
      opacity: op,
      transform: `translateY(${y}px)`,
      boxShadow: '0 8px 28px rgba(22,32,27,0.06)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: vs(11), marginBottom: vs(14) }}>
        <div style={{
          width: vs(36), height: vs(36), borderRadius: vs(9),
          backgroundColor: C.pineLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        <p style={{
          fontFamily: F.primary, fontSize: vs(17), fontWeight: 700,
          color: C.ink, margin: 0, letterSpacing: '-0.01em',
        }}>{title}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: vs(7) }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${vs(8)}px ${vs(12)}px`,
            borderRadius: vs(8),
            backgroundColor: C.surfaceAlt,
            border: `1px solid ${C.borderSoft}`,
          }}>
            <span style={{ fontFamily: F.secondary, fontSize: vs(13), color: C.ink, fontWeight: 500 }}>{l.left}</span>
            <span style={{ fontFamily: F.secondary, fontSize: vs(13), color: accent, fontWeight: 500 }}>{l.right}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SceneFeatures() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width
  const k = vertical ? 1.85 : 1
  const vs = (v: number) => v * k

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [0, 18], [-16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  const ICON_PROPS = { width: vs(20), height: vs(20), stroke: C.pine, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      padding: vertical ? '60px 36px' : '20px 64px',
      opacity: bgOp * sceneOpacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: vs(28), opacity: titleOp, transform: `translateY(${titleY}px)` }}>
        <p style={{
          fontFamily: F.secondary, fontSize: vs(12), fontWeight: 600,
          letterSpacing: '0.18em', color: C.amber,
          textTransform: 'uppercase', margin: `0 0 ${vs(10)}px`,
        }}>Et bien plus encore</p>
        <h2 style={{
          fontFamily: F.primary, fontSize: vertical ? 64 : 38,
          fontWeight: 800, color: C.ink,
          margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05,
        }}>Tout gérer en un clic.</h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: vertical ? '1fr 1fr' : '1fr 1fr',
        gap: vs(16),
        width: '100%',
        maxWidth: vertical ? 980 : 820,
      }}>
        <FeatureCard
          title="Horaires"
          accent={C.pine}
          frame={frame} fps={fps} delay={14} vs={vs}
          icon={<svg viewBox="0 0 24 24" {...ICON_PROPS}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>}
          lines={[
            { left: 'Lundi',    right: '12-14h · 19h30-22h' },
            { left: 'Mardi',    right: '12-14h · 19h30-22h' },
            { left: 'Mercredi', right: 'Soir uniquement' },
          ]}
        />
        <FeatureCard
          title="Menus"
          accent={C.amber}
          frame={frame} fps={fps} delay={22} vs={vs}
          icon={<svg viewBox="0 0 24 24" {...ICON_PROPS}><path d="M7 2v8a3 3 0 0 0 6 0V2M10 10v12M17 2c-1.5 2-2 4-2 6s.5 4 2 6v8" /></svg>}
          lines={[
            { left: 'Carte Été 2026',  right: 'PDF · 4 pages' },
            { left: 'Menu Midi',       right: '24€' },
            { left: 'Carte des vins',  right: '12 réf.' },
          ]}
        />
        <FeatureCard
          title="Fermetures"
          accent={C.errText}
          frame={frame} fps={fps} delay={30} vs={vs}
          icon={<svg viewBox="0 0 24 24" {...ICON_PROPS}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>}
          lines={[
            { left: 'Lundi 1 juillet', right: 'Bloqué' },
            { left: 'Mardi 2 juillet', right: 'Bloqué' },
            { left: '15 août',         right: 'Férié' },
          ]}
        />
        <FeatureCard
          title="Évènements"
          accent={C.amber}
          frame={frame} fps={fps} delay={38} vs={vs}
          icon={<svg viewBox="0 0 24 24" {...ICON_PROPS}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" /></svg>}
          lines={[
            { left: 'Soirée Jazz',     right: '28 juin · 21h' },
            { left: 'Brunch dominical',right: 'Chaque dim.' },
            { left: 'Menu St-Jean',    right: '24 juin' },
          ]}
        />
      </div>
    </AbsoluteFill>
  )
}
