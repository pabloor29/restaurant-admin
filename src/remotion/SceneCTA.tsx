import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'

const INCLUDED = [
  'Site web sur-mesure',
  'Réservations en ligne',
  'Confirmations e-mail auto.',
  'Espace d\'administration',
  'Hébergement inclus',
  'Maintenance & mises à jour',
  'Référencement (SEO)',
  'Support dédié',
]

export function SceneCTA() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const bgOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  // Eyebrow
  const eyebrowOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })
  const eyebrowY = interpolate(frame, [0, 16], [12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // Price
  const priceScale = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 11, stiffness: 130, mass: 0.9 } })
  const priceOp = interpolate(frame, [8, 24], [0, 1], { extrapolateRight: 'clamp' })

  // Subtitle (sans engagement)
  const subOp = interpolate(frame, [24, 40], [0, 1], { extrapolateRight: 'clamp' })
  const subY = interpolate(frame, [24, 40], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // Divider
  const dividerW = interpolate(frame, [36, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // URL
  const urlOp = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: 'clamp' })
  const urlY = interpolate(frame, [70, 90], [12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.pine,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: vertical ? '60px 32px' : '0 64px',
      opacity: bgOp * sceneOpacity,
    }}>
      {/* Eyebrow */}
      <p style={{
        fontFamily: F.secondary, fontSize: vertical ? 20 : 12, fontWeight: 600,
        letterSpacing: '0.2em', color: C.amberBright,
        textTransform: 'uppercase',
        margin: 0,
        opacity: eyebrowOp,
        transform: `translateY(${eyebrowY}px)`,
      }}>L&apos;offre RESA · tout inclus</p>

      {/* Price */}
      <div style={{
        transform: `scale(${priceScale})`,
        opacity: priceOp,
        textAlign: 'center',
        margin: vertical ? '20px 0 4px' : '14px 0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6 }}>
          <span style={{
            fontFamily: F.primary, fontSize: vertical ? 200 : 130, fontWeight: 800,
            color: C.amber, letterSpacing: '-0.06em', lineHeight: 0.9,
          }}>67€</span>
          <span style={{
            fontFamily: F.secondary, fontSize: vertical ? 34 : 22, fontWeight: 600,
            color: 'rgba(245,241,233,0.55)', marginTop: vertical ? 28 : 16,
          }}>/&nbsp;mois</span>
        </div>
      </div>

      {/* Subtitle */}
      <p style={{
        fontFamily: F.accent, fontStyle: 'italic',
        fontSize: vertical ? 30 : 22,
        color: C.amberBright,
        margin: '0 0 4px',
        opacity: subOp,
        transform: `translateY(${subY}px)`,
        textAlign: 'center',
      }}>Engagement 1 an minimum.</p>
      <p style={{
        fontFamily: F.secondary, fontSize: vertical ? 22 : 16,
        color: 'rgba(245,241,233,0.65)',
        margin: '0 0 26px',
        opacity: subOp,
        transform: `translateY(${subY}px)`,
        textAlign: 'center',
      }}>Tout-en-un. Sans surprise.</p>

      {/* Divider */}
      <div style={{
        width: vertical ? 420 : 320,
        height: vertical ? 2 : 1,
        backgroundColor: 'rgba(245,241,233,0.18)',
        transform: `scaleX(${dividerW})`,
        marginBottom: vertical ? 40 : 28,
        borderRadius: 1,
      }} />

      {/* Features grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: vertical ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: vertical ? '20px 36px' : '12px 28px',
        marginBottom: vertical ? 48 : 32,
        maxWidth: vertical ? 880 : 900,
      }}>
        {INCLUDED.map((item, i) => {
          const op = interpolate(frame, [42 + i * 6, 58 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const x = interpolate(frame, [42 + i * 6, 58 + i * 6], [-14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: vertical ? 14 : 9, opacity: op, transform: `translateX(${x}px)` }}>
              <div style={{
                width: vertical ? 30 : 18, height: vertical ? 30 : 18, borderRadius: '50%',
                backgroundColor: 'rgba(245,241,233,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width={vertical ? 15 : 9} height={vertical ? 12 : 7} viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3 5.5L8 1" stroke={C.paper} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{
                fontFamily: F.secondary, fontSize: vertical ? 24 : 13,
                color: 'rgba(245,241,233,0.92)', fontWeight: 500,
                lineHeight: 1.25,
              }}>{item}</span>
            </div>
          )
        })}
      </div>

      {/* URL CTA */}
      <div style={{
        opacity: urlOp,
        transform: `translateY(${urlY}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: vertical ? 22 : 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: vertical ? 18 : 11 }}>
          <div style={{
            width: vertical ? 60 : 34, height: vertical ? 60 : 34, borderRadius: vertical ? 16 : 10,
            backgroundColor: C.amber,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: F.primary, fontSize: vertical ? 32 : 18, fontWeight: 800, color: C.paper, lineHeight: 1, letterSpacing: '-0.03em' }}>R</span>
          </div>
          <span style={{ fontFamily: F.primary, fontSize: vertical ? 42 : 24, fontWeight: 800, color: C.paper, letterSpacing: '-0.04em' }}>
            RESA<span style={{ color: C.amber }}>.</span>
          </span>
        </div>
        <div style={{
          backgroundColor: C.amber,
          padding: vertical ? '18px 42px' : '12px 28px',
          borderRadius: vertical ? 14 : 11,
          fontFamily: F.secondary, fontSize: vertical ? 24 : 14, fontWeight: 600,
          color: C.paper,
        }}>resa-service.com</div>
      </div>
    </AbsoluteFill>
  )
}
