import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut, easeOutQuint } from './colors'
import { CARBO, CARBO_F } from './CarboColors'

// ~200 frames — Carbo-branded booking widget (pink panel · deep-green text · Anton header)
// fills, button pulses, envelope flies, confirmation card appears.
export function CarboSceneReservation() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width
  const k = vertical ? 1.8 : 1
  const vs = (v: number) => v * k

  const bgOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const headOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })

  const widgetOp = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: 'clamp' })
  const widgetY  = interpolate(frame, [6, 24], [30, 0], { extrapolateRight: 'clamp', easing: easeOut })

  const f = (start: number) => interpolate(frame, [start, start + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const date = f(18)
  const time = f(28)
  const cov  = f(38)

  const btnPulse = spring({ frame: Math.max(0, frame - 56), fps, config: { damping: 7, stiffness: 240, mass: 0.5 } })
  const btnScale = frame > 56 && frame < 76 ? interpolate(btnPulse, [0, 1], [1.08, 1]) : 1
  const btnGlow  = interpolate(frame, [54, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const widgetFade = interpolate(frame, [80, 100], [1, 0.18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const envOp = interpolate(frame, [78, 92], [0, 1], { extrapolateRight: 'clamp' })
  const envProg = interpolate(frame, [86, 118], [0, 1], { extrapolateRight: 'clamp', easing: easeOutQuint })
  const envExit = interpolate(frame, [114, 128], [1, 0], { extrapolateRight: 'clamp' })

  const confSpring = spring({ frame: Math.max(0, frame - 110), fps, config: { damping: 10, stiffness: 160, mass: 0.7 } })
  const confOp = interpolate(frame, [110, 128], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      padding: vertical ? '40px 32px' : '36px 64px',
      opacity: bgOp * sceneOpacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: vertical ? 36 : 22, opacity: headOp }}>
        <p style={{
          fontFamily: F.secondary,
          fontSize: vertical ? 20 : 12,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: C.amber,
          margin: '0 0 10px',
        }}>Système de réservation</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: vertical ? 58 : 38,
          fontWeight: 800,
          color: C.ink,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}>Une table en 3 clics.<br />Confirmée par mail.</h2>
      </div>

      <div style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        maxWidth: vertical ? 1000 : 980,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Booking widget — Carbo branded PINK panel */}
        <div style={{
          position: 'absolute',
          left: vertical ? '50%' : '6%',
          top: '50%',
          transform: vertical
            ? `translate(-50%, calc(-50% + ${widgetY}px))`
            : `translate(0, calc(-50% + ${widgetY}px))`,
          opacity: widgetOp * widgetFade,
          width: vertical ? 760 : 380,
          backgroundColor: CARBO.pink,
          borderRadius: vs(18),
          padding: vs(24),
          boxShadow: '0 24px 64px rgba(2,60,24,0.22)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: -80, right: -80,
            width: 240, height: 240,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${CARBO.inkGreen}14 0%, ${CARBO.inkGreen}00 70%)`,
          }} />

          <p style={{
            fontFamily: CARBO_F.script,
            fontSize: vs(22),
            color: CARBO.inkGreen,
            margin: 0,
            transform: 'rotate(-2deg)',
            lineHeight: 1,
          }}>réservation</p>

          <div style={{ display: 'flex', alignItems: 'baseline', margin: `${vs(2)}px 0 ${vs(18)}px` }}>
            <span style={{
              fontFamily: CARBO_F.anton,
              fontSize: vs(44),
              fontWeight: 400,
              color: CARBO.inkGreen,
              letterSpacing: '0.03em',
              lineHeight: 1,
            }}>CARBO</span>
          </div>

          {[
            { label: 'Date',     val: 'Vendredi 26 juin',    op: date },
            { label: 'Heure',    val: '20:30',               op: time },
            { label: 'Couverts', val: '2 personnes',         op: cov },
          ].map((row, i) => (
            <div key={i} style={{
              opacity: row.op,
              backgroundColor: CARBO.cream,
              border: `1px solid ${CARBO.inkGreen}1A`,
              borderRadius: vs(10),
              padding: `${vs(11)}px ${vs(14)}px`,
              marginBottom: vs(10),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: CARBO_F.script,
                fontSize: vs(18),
                color: CARBO.inkGreen,
                lineHeight: 1,
              }}>{row.label}</span>
              <span style={{
                fontFamily: CARBO_F.display,
                fontStyle: 'italic',
                fontSize: vs(18),
                color: CARBO.inkGreen,
                fontWeight: 500,
              }}>{row.val}</span>
            </div>
          ))}

          <div style={{
            marginTop: vs(16),
            backgroundColor: CARBO.inkGreen,
            color: CARBO.pink,
            borderRadius: vs(12),
            padding: `${vs(14)}px ${vs(18)}px`,
            textAlign: 'center',
            fontFamily: CARBO_F.anton,
            fontSize: vs(17),
            fontWeight: 400,
            letterSpacing: '0.18em',
            transform: `scale(${btnScale})`,
            boxShadow: btnGlow > 0 ? `0 0 0 ${vs(8)}px ${CARBO.inkGreen}33` : 'none',
          }}>
            RÉSERVER →
          </div>

          <div style={{
            marginTop: vs(14),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: vs(7),
            opacity: 0.7,
          }}>
            <span style={{
              fontFamily: CARBO_F.display,
              fontStyle: 'italic',
              fontSize: vs(12),
              color: `${CARBO.inkGreen}cc`,
            }}>propulsé par</span>
            <span style={{
              fontFamily: F.primary,
              fontSize: vs(12),
              fontWeight: 800,
              color: CARBO.inkGreen,
              letterSpacing: '-0.02em',
            }}>RESA<span style={{ color: C.amber }}>.</span></span>
          </div>
        </div>

        {/* Flying envelope */}
        {frame > 78 && frame < 132 && (
          <div style={{
            position: 'absolute',
            left: vertical ? '50%' : 'calc(6% + 220px)',
            top: '50%',
            transform: `translate(-50%, -50%)`,
            opacity: envOp * envExit,
            pointerEvents: 'none',
          }}>
            <div style={{
              transform: `translate(${interpolate(envProg, [0, 1], [0, vertical ? 0 : 320])}px, ${interpolate(envProg, [0, 1], [0, vertical ? 200 : -10])}px) rotate(${envProg * 16}deg)`,
              width: vs(54),
              height: vs(40),
              backgroundColor: C.surface,
              border: `2.4px solid ${C.okText}`,
              borderRadius: vs(7),
              position: 'relative',
              boxShadow: '0 10px 26px rgba(30,122,82,0.30)',
            }}>
              <svg viewBox="0 0 100 60" width="100%" height="60%" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path d="M2 4 L50 38 L98 4" stroke={C.okText} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Confirmed card */}
        {frame > 108 && (
          <div style={{
            position: 'absolute',
            right: vertical ? '50%' : '6%',
            top: vertical ? '76%' : '50%',
            transform: vertical
              ? `translate(50%, -50%) scale(${confSpring})`
              : `translate(0, -50%) scale(${confSpring})`,
            opacity: confOp,
            width: vertical ? 760 : 380,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: vs(16),
            boxShadow: '0 24px 60px rgba(30,122,82,0.22)',
            overflow: 'hidden',
          }}>
            <div style={{
              backgroundColor: C.okBg,
              padding: `${vs(13)}px ${vs(16)}px`,
              borderBottom: `1px solid rgba(30,122,82,0.18)`,
            }}>
              <p style={{ fontFamily: F.secondary, fontSize: vs(10), color: C.okText, fontWeight: 600, margin: 0 }}>
                À : client@email.com
              </p>
              <p style={{ fontFamily: F.primary, fontSize: vs(14), fontWeight: 700, color: C.ink, margin: `${vs(3)}px 0 0`, letterSpacing: '-0.01em' }}>
                Votre table chez CARBO est confirmée
              </p>
            </div>
            <div style={{ padding: `${vs(18)}px ${vs(20)}px`, textAlign: 'center' }}>
              <div style={{
                backgroundColor: C.okBg,
                border: `1px solid rgba(30,122,82,0.22)`,
                borderRadius: vs(10),
                padding: `${vs(16)}px ${vs(18)}px`,
              }}>
                <p style={{ fontFamily: F.secondary, fontSize: vs(18), fontWeight: 700, color: C.okText, margin: `0 0 ${vs(6)}px` }}>
                  ✓ Réservation confirmée
                </p>
                <p style={{ fontFamily: F.secondary, fontSize: vs(13), color: C.slate, margin: 0 }}>
                  Vendredi 26 juin · 20:30 · 2 couverts
                </p>
              </div>
              <p style={{
                fontFamily: F.secondary,
                fontSize: vs(11),
                color: C.muted,
                margin: `${vs(12)}px 0 0`,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                Géré automatiquement par RESA.
              </p>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}
