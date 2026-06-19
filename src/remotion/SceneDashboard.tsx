import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F } from './colors'

const CARDS = [
  { name: 'Marie Dupont',    time: '19:30', covers: 4, status: 'accepted', statusLabel: 'Acceptée',   statusText: C.okText,   statusBg: C.okBg },
  { name: 'Thomas Bernard',  time: '20:00', covers: 2, status: 'pending',  statusLabel: 'En attente', statusText: C.warnText, statusBg: C.warnBg },
  { name: 'Julie Martin',    time: '20:30', covers: 6, status: 'pending',  statusLabel: 'En attente', statusText: C.warnText, statusBg: C.warnBg },
  { name: 'Pierre Leclerc',  time: '21:00', covers: 3, status: 'arrived',  statusLabel: 'Arrivée',    statusText: C.infoText, statusBg: C.infoBg },
]

function ReservCard({ name, time, covers, statusLabel, statusText, statusBg, delay, frame, fps }: {
  name: string; time: string; covers: number; statusLabel: string
  statusText: string; statusBg: string; delay: number; frame: number; fps: number
}) {
  const localFrame = Math.max(0, frame - delay)
  const s = spring({ frame: localFrame, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } })
  const opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const translateX = interpolate(s, [0, 1], [80, 0])

  return (
    <div style={{
      backgroundColor: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      opacity,
      transform: `translateX(${translateX}px)`,
      boxShadow: '0 2px 12px rgba(22,32,27,0.06)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: C.pineLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.primary, fontSize: 16, fontWeight: 700, color: C.pine, flexShrink: 0,
      }}>
        {name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.primary, fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 3px', letterSpacing: '-0.01em' }}>{name}</p>
        <p style={{ fontFamily: F.secondary, fontSize: 12, color: C.slate, margin: 0 }}>
          {time} · {covers} couvert{covers > 1 ? 's' : ''}
        </p>
      </div>
      <span style={{
        fontFamily: F.secondary, fontSize: 11, fontWeight: 600,
        color: statusText, backgroundColor: statusBg,
        padding: '4px 10px', borderRadius: 99, flexShrink: 0,
      }}>{statusLabel}</span>
    </div>
  )
}

export function SceneDashboard() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const bgOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const headerOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' })
  const headerY = interpolate(frame, [5, 22], [-16, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const badgeScale = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 9, stiffness: 200, mass: 0.6 } })

  // "accept" animation: card 2 changes from pending → accepted around frame 100
  const acceptProgress = interpolate(frame, [95, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const card2StatusText = acceptProgress > 0.5 ? C.okText : C.warnText
  const card2StatusBg = acceptProgress > 0.5 ? C.okBg : C.warnBg
  const card2StatusLabel = acceptProgress > 0.5 ? 'Acceptée' : 'En attente'

  const acceptPulse = spring({ frame: Math.max(0, frame - 95), fps, config: { damping: 8, stiffness: 250, mass: 0.5 } })
  const acceptPulseScale = acceptProgress > 0 ? interpolate(acceptPulse, [0, 1], [1.1, 1]) : 1

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: bgOpacity * sceneOpacity,
      padding: '0 64px',
    }}>
      {/* App window */}
      <div style={{
        width: '100%',
        maxWidth: 720,
        backgroundColor: C.white,
        borderRadius: 24,
        overflow: 'hidden',
        border: `1px solid ${C.border}`,
        boxShadow: '0 24px 80px rgba(22,32,27,0.14)',
      }}>
        {/* App header / topbar */}
        <div style={{
          backgroundColor: C.pineDark,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            backgroundColor: C.amber,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: F.primary, fontSize: 17, fontWeight: 800, color: C.paper, lineHeight: 1 }}>R</span>
          </div>
          <span style={{ fontFamily: F.primary, fontSize: 18, fontWeight: 700, color: C.paper, letterSpacing: '-0.02em' }}>
            Le Petit Bistrot
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              transform: `scale(${badgeScale})`,
              backgroundColor: C.warnBg,
              border: `1px solid rgba(185,125,43,0.3)`,
              borderRadius: 99,
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ fontFamily: F.secondary, fontSize: 13, fontWeight: 700, color: C.warnText }}>3</span>
              <span style={{ fontFamily: F.secondary, fontSize: 12, color: C.warnText }}>en attente</span>
            </div>
          </div>
        </div>

        {/* Subheader */}
        <div style={{
          backgroundColor: C.paper,
          padding: '12px 24px',
          borderBottom: `1px solid ${C.border}`,
          opacity: headerOpacity,
        }}>
          <p style={{ fontFamily: F.secondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, margin: 0 }}>
            DEMANDES EN ATTENTE
          </p>
        </div>

        {/* Cards */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CARDS.map((card, i) => {
            if (i === 1) {
              return (
                <div key={i} style={{ transform: `scale(${acceptPulseScale})` }}>
                  <ReservCard
                    {...card}
                    statusText={card2StatusText}
                    statusBg={card2StatusBg}
                    statusLabel={card2StatusLabel}
                    delay={i * 18 + 10}
                    frame={frame}
                    fps={fps}
                  />
                </div>
              )
            }
            return <ReservCard key={i} {...card} delay={i * 18 + 10} frame={frame} fps={fps} />
          })}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${C.border}`,
          opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: C.pineLight,
        }}>
          <span style={{ fontFamily: F.secondary, fontSize: 12, color: C.pine }}>
            ✓ Confirmation automatique par email envoyée au client
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
