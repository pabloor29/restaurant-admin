import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'

type Card = {
  name: string
  date: string
  time: string
  covers: number
  status: 'pending' | 'accepted' | 'arrived'
}

const CARDS: Card[] = [
  { name: 'Marie Dupont',    date: 'vendredi 20 juin', time: '20:00', covers: 4, status: 'pending'  },
  { name: 'Thomas Bernard',  date: 'samedi 21 juin',   time: '19:30', covers: 2, status: 'pending'  },
  { name: 'Julie Martin',    date: 'samedi 21 juin',   time: '20:30', covers: 6, status: 'pending'  },
]

const STATUS_MAP = {
  pending:  { label: 'En attente', text: C.warnText, bg: C.warnBg,  border: C.warnText },
  accepted: { label: 'Acceptée',   text: C.okText,   bg: C.okBg,    border: C.okText   },
  arrived:  { label: 'Arrivée',    text: C.infoText, bg: C.infoBg,  border: C.infoText },
}

function ReservCard({ card, frame, fps, delay, statusOverride, vs }: {
  card: Card; frame: number; fps: number; delay: number
  statusOverride?: { label: string; text: string; bg: string; border: string; scale?: number }
  vs: (n: number) => number
}) {
  const localFrame = Math.max(0, frame - delay)
  const s = spring({ frame: localFrame, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } })
  const opacity = interpolate(localFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const translateX = interpolate(s, [0, 1], [60, 0])
  const status = statusOverride ?? STATUS_MAP[card.status]
  const scale = statusOverride?.scale ?? 1

  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderLeft: `${vs(3)}px solid ${status.border}`,
      borderRadius: vs(12),
      padding: `${vs(14)}px ${vs(18)}px`,
      opacity,
      transform: `translateX(${translateX}px) scale(${scale})`,
      boxShadow: '0 2px 12px rgba(22,32,27,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: vs(11), marginBottom: vs(6), flexWrap: 'wrap' }}>
        <p style={{
          fontFamily: F.primary, fontSize: vs(17), fontWeight: 700,
          color: C.ink, margin: 0, letterSpacing: '-0.01em',
        }}>{card.name}</p>
        <span style={{
          fontFamily: F.secondary, fontSize: vs(11), fontWeight: 600,
          color: status.text, backgroundColor: status.bg,
          padding: `${vs(3)}px ${vs(10)}px`, borderRadius: 99,
        }}>{status.label}</span>
      </div>
      <p style={{
        fontFamily: F.secondary, fontSize: vs(13), color: C.slate, margin: 0,
        textTransform: 'capitalize',
      }}>
        {card.date} · {card.time} · {card.covers} couverts
      </p>
    </div>
  )
}

export function SceneDashboard() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width
  const k = vertical ? 1.85 : 1
  const vs = (v: number) => v * k

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  // Browser chrome appears first
  const chromeOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const chromeY = interpolate(frame, [0, 18], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // Pending count banner
  const bannerScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 10, stiffness: 160, mass: 0.7 } })
  const bannerOp = interpolate(frame, [10, 26], [0, 1], { extrapolateRight: 'clamp' })

  // count up 0→3
  const countProgress = interpolate(frame, [16, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const pendingCount = Math.round(countProgress * 3)

  // Accept first card around frame 90
  const acceptProgress = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pulsing = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 7, stiffness: 240, mass: 0.5 } })
  const acceptPulseScale = acceptProgress > 0 ? interpolate(pulsing, [0, 1], [1.10, 1]) : 1
  const accepted = acceptProgress > 0.5

  // Footer confirm hint
  const footerOp = interpolate(frame, [108, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // After accept, banner count goes 3 → 2
  const finalPending = accepted ? 2 : pendingCount

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: bgOp * sceneOpacity,
      padding: vertical ? '32px 28px' : '20px 64px',
    }}>
      {/* Window */}
      <div style={{
        width: '100%',
        maxWidth: vertical ? 980 : 780,
        backgroundColor: C.surface,
        borderRadius: vs(18),
        overflow: 'hidden',
        border: `1px solid ${C.border}`,
        boxShadow: '0 24px 80px rgba(22,32,27,0.14)',
      }}>
        {/* Browser chrome */}
        <div style={{
          backgroundColor: C.paper,
          borderBottom: `1px solid ${C.border}`,
          padding: `${vs(11)}px ${vs(18)}px`,
          display: 'flex',
          alignItems: 'center',
          gap: vs(12),
          opacity: chromeOp,
          transform: `translateY(${chromeY}px)`,
        }}>
          <div style={{ display: 'flex', gap: vs(6) }}>
            <div style={{ width: vs(10), height: vs(10), borderRadius: vs(5), backgroundColor: '#F08080' }} />
            <div style={{ width: vs(10), height: vs(10), borderRadius: vs(5), backgroundColor: '#FFB347' }} />
            <div style={{ width: vs(10), height: vs(10), borderRadius: vs(5), backgroundColor: '#90D4A3' }} />
          </div>
          <div style={{
            flex: 1,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: vs(6),
            padding: `${vs(4)}px ${vs(11)}px`,
            fontFamily: F.secondary,
            fontSize: vs(11),
            color: C.muted,
          }}>
            resa-service.com/restaurant/carbo/reservations
          </div>
        </div>

        {/* Page header */}
        <div style={{
          padding: `${vs(20)}px ${vs(26)}px 0`,
          opacity: chromeOp,
        }}>
          {/* Banner pending count */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: vs(14),
            backgroundColor: C.warnBg,
            border: `1px solid rgba(185,125,43,0.25)`,
            borderRadius: vs(12),
            padding: `${vs(14)}px ${vs(18)}px`,
            marginBottom: vs(20),
            opacity: bannerOp,
            transform: `scale(${bannerScale})`,
          }}>
            <span style={{
              fontFamily: F.primary, fontSize: vs(34), fontWeight: 800,
              color: C.warnText, lineHeight: 1, letterSpacing: '-0.03em',
              minWidth: vs(34),
            }}>
              {finalPending}
            </span>
            <div>
              <p style={{ fontFamily: F.secondary, fontSize: vs(15), fontWeight: 600, color: C.warnText, margin: 0 }}>
                demande{finalPending > 1 ? 's' : ''} en attente
              </p>
              <p style={{ fontFamily: F.secondary, fontSize: vs(12), color: C.warnText, opacity: 0.7, margin: 0 }}>
                À traiter ci-dessous
              </p>
            </div>
          </div>

          <p style={{
            fontFamily: F.secondary, fontSize: vs(11), fontWeight: 600,
            letterSpacing: '0.13em', color: C.muted,
            margin: `0 0 ${vs(14)}px`,
          }}>DEMANDES EN ATTENTE</p>
        </div>

        {/* Cards */}
        <div style={{ padding: `0 ${vs(26)}px ${vs(18)}px`, display: 'flex', flexDirection: 'column', gap: vs(10) }}>
          {CARDS.map((card, i) => {
            // First card: pending → accepted
            if (i === 0) {
              const override = accepted
                ? { ...STATUS_MAP.accepted, scale: acceptPulseScale }
                : { ...STATUS_MAP.pending, scale: 1 }
              return (
                <div key={i}>
                  <ReservCard card={card} frame={frame} fps={fps} delay={32 + i * 12} statusOverride={override} vs={vs} />
                  {/* Accept/Refuse buttons */}
                  {!accepted && frame > 60 && (
                    <div style={{
                      display: 'flex', gap: vs(10), marginTop: vs(10), marginLeft: vs(20),
                      opacity: interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    }}>
                      <div style={{
                        backgroundColor: C.okBg,
                        border: `1px solid rgba(30,122,82,0.3)`,
                        borderRadius: vs(8),
                        padding: `${vs(7)}px ${vs(14)}px`,
                        fontFamily: F.secondary, fontSize: vs(13), fontWeight: 600,
                        color: C.okText,
                        boxShadow: frame > 86 && frame < 102 ? `0 0 0 ${vs(5)}px rgba(30,122,82,${0.18 * interpolate(frame, [86, 96], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })})` : 'none',
                        transform: frame > 86 && frame < 96 ? `scale(${interpolate(frame, [86, 92, 96], [1, 1.06, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})` : undefined,
                      }}>✓ Accepter</div>
                      <div style={{
                        backgroundColor: C.errBg,
                        border: `1px solid rgba(168,71,58,0.25)`,
                        borderRadius: vs(8),
                        padding: `${vs(7)}px ${vs(14)}px`,
                        fontFamily: F.secondary, fontSize: vs(13), fontWeight: 600,
                        color: C.errText,
                      }}>✕ Refuser</div>
                    </div>
                  )}
                </div>
              )
            }
            return <ReservCard key={i} card={card} frame={frame} fps={fps} delay={32 + i * 12} vs={vs} />
          })}
        </div>

        {/* Footer auto email hint */}
        <div style={{
          padding: `${vs(13)}px ${vs(26)}px`,
          borderTop: `1px solid ${C.border}`,
          backgroundColor: C.pineLight,
          display: 'flex',
          alignItems: 'center',
          gap: vs(12),
          opacity: footerOp,
        }}>
          <div style={{
            width: vs(26), height: vs(26), borderRadius: vs(7),
            backgroundColor: C.pine,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={vs(14)} height={vs(11)} viewBox="0 0 13 11" fill="none">
              <path d="M1 5L4.5 8.5L12 1" stroke={C.paper} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: F.secondary, fontSize: vs(13), fontWeight: 500, color: C.pine }}>
            Mail de confirmation envoyé automatiquement à Marie Dupont
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
