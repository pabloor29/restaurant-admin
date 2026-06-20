import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut, easeOutQuint } from './colors'

// Phase frames within scene (~244 total)
// 0–40   : client form fills
// 30–70  : submit button click
// 60–110 : envelopes fly out (split: to client + to restaurant)
// 100–150: restaurant inbox preview
// 140–180: dashboard accept click
// 170–220: confirmation email to client
// 215–244: fade out

function MonoLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, verticalAlign: 'middle' }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.3,
        backgroundColor: C.pine,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: F.primary, fontSize: size * 0.5, fontWeight: 800, color: C.paper, lineHeight: 1, letterSpacing: '-0.03em' }}>R</span>
      </div>
      <span style={{ fontFamily: F.primary, fontSize: size * 0.55, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>
        RESA<span style={{ color: C.amber }}>.</span>
      </span>
    </div>
  )
}

function Envelope({ color = C.amber, size = 44 }: { color?: string; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size * 0.72,
      backgroundColor: C.surface,
      border: `2px solid ${color}`,
      borderRadius: 6,
      position: 'relative',
      boxShadow: '0 6px 18px rgba(22,32,27,0.16)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '60%',
        borderBottom: `2px solid ${color}`,
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        background: color,
        opacity: 0.18,
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '60%',
      }}>
        <svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="none">
          <path d="M2 4 L50 38 L98 4" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export function SceneReservationFlow() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width
  const k = vertical ? 1.9 : 1   // scale multiplier
  const vs = (v: number) => v * k

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  // Title fade
  const titleOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })

  // ──── PHASE 1 : Client form ────
  const formOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: 'clamp' })
  const formY = interpolate(frame, [4, 22], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  const field = (start: number) => interpolate(frame, [start, start + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const f1 = field(14)
  const f2 = field(22)
  const f3 = field(30)
  const f4 = field(38)

  // Submit click pulse
  const submitPulse = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 7, stiffness: 240, mass: 0.5 } })
  const submitScale = frame > 50 && frame < 70 ? interpolate(submitPulse, [0, 1], [1.08, 1]) : 1
  const submitHighlight = interpolate(frame, [48, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Form fades out as emails fly
  const formFade = interpolate(frame, [70, 90], [1, 0.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ──── PHASE 2 : Envelopes fly ────
  const envOp = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const env1Progress = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint })
  const env2Progress = interpolate(frame, [78, 118], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint })
  // env1 → restaurant (right side), env2 → client (left)
  const env1X = interpolate(env1Progress, [0, 1], [-60, 240])
  const env1Y = interpolate(env1Progress, [0, 1], [0, -180])
  const env2X = interpolate(env2Progress, [0, 1], [-60, -260])
  const env2Y = interpolate(env2Progress, [0, 1], [0, -180])
  const envExit = interpolate(frame, [108, 122], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ──── PHASE 3 : Restaurant inbox ────
  const inboxOp = interpolate(frame, [100, 122], [0, 1], { extrapolateRight: 'clamp' })
  const inboxY = interpolate(frame, [100, 122], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const inboxFade = interpolate(frame, [148, 164], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Client inbox (pending) appears alongside
  const clientPendingOp = interpolate(frame, [104, 126], [0, 1], { extrapolateRight: 'clamp' })
  const clientPendingY = interpolate(frame, [104, 126], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const clientPendingFade = interpolate(frame, [148, 164], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ──── PHASE 4 : Restaurant accepts in dashboard ────
  const dashOp = interpolate(frame, [158, 176], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const acceptHighlight = interpolate(frame, [180, 192], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const acceptPulse = spring({ frame: Math.max(0, frame - 180), fps, config: { damping: 7, stiffness: 240, mass: 0.5 } })
  const acceptScale = frame > 180 && frame < 200 ? interpolate(acceptPulse, [0, 1], [1.12, 1]) : 1
  const dashFade = interpolate(frame, [200, 216], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Confirmation email flies down to client mailbox
  const confEnvelopeOp = interpolate(frame, [196, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const confExitOp = interpolate(frame, [225, 240], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Final confirmation: client gets green badge "Réservation confirmée"
  const confirmedOp = interpolate(frame, [210, 228], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const confirmedScale = spring({ frame: Math.max(0, frame - 208), fps, config: { damping: 9, stiffness: 180, mass: 0.7 } })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      padding: vertical ? '40px 32px' : '36px 64px',
      opacity: bgOp * sceneOpacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Header label */}
      <div style={{ textAlign: 'center', marginBottom: vertical ? 36 : 22, opacity: titleOp }}>
        <p style={{
          fontFamily: F.secondary,
          fontSize: vertical ? 20 : 12, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: C.amber,
          margin: '0 0 12px',
        }}>Réservations automatisées</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: vertical ? 58 : 38,
          fontWeight: 800,
          color: C.ink,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}>Du formulaire au mail.<br />Sans rien faire.</h2>
      </div>

      {/* Stage area */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: vertical ? 1000 : 980,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* ── Phase 1 + 2: Client form on left ── */}
        <div style={{
          position: 'absolute',
          left: vertical ? '50%' : '4%',
          top: '50%',
          transform: vertical
            ? `translate(-50%, calc(-50% + ${formY}px))`
            : `translate(0, calc(-50% + ${formY}px))`,
          opacity: formOp * formFade,
          width: vertical ? 760 : 320,
        }}>
          {/* Browser chrome */}
          <div style={{
            backgroundColor: C.paper,
            borderTopLeftRadius: vs(12), borderTopRightRadius: vs(12),
            padding: `${vs(8)}px ${vs(12)}px`,
            display: 'flex', alignItems: 'center', gap: vs(8),
            border: `1px solid ${C.border}`,
            borderBottom: 'none',
          }}>
            <div style={{ display: 'flex', gap: vs(4) }}>
              <div style={{ width: vs(8), height: vs(8), borderRadius: vs(4), backgroundColor: '#F08080' }} />
              <div style={{ width: vs(8), height: vs(8), borderRadius: vs(4), backgroundColor: '#FFB347' }} />
              <div style={{ width: vs(8), height: vs(8), borderRadius: vs(4), backgroundColor: '#90D4A3' }} />
            </div>
            <div style={{
              flex: 1, backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: vs(5), padding: `${vs(2)}px ${vs(8)}px`,
              fontFamily: F.secondary, fontSize: vs(9), color: C.muted,
            }}>
              restaurant-carbo.fr/reserver
            </div>
          </div>
          {/* Form body */}
          <div style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: `0 0 ${vs(12)}px ${vs(12)}px`,
            padding: vs(18),
            boxShadow: '0 10px 32px rgba(22,32,27,0.10)',
          }}>
            <p style={{ fontFamily: F.primary, fontSize: vs(15), fontWeight: 700, color: C.ink, margin: `0 0 ${vs(12)}px`, letterSpacing: '-0.01em' }}>
              Réserver une table
            </p>

            {[
              { label: 'NOM',         val: 'Marie Dupont',          op: f1 },
              { label: 'DATE',        val: '20 juin 2026',          op: f2 },
              { label: 'HEURE',       val: '20:00',                 op: f3 },
              { label: 'COUVERTS',    val: '4 personnes',           op: f4 },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: vs(10), opacity: f.op }}>
                <p style={{ fontFamily: F.secondary, fontSize: vs(9), fontWeight: 700, letterSpacing: '0.1em', color: C.muted, margin: `0 0 ${vs(4)}px` }}>{f.label}</p>
                <div style={{
                  border: `1.2px solid ${C.border}`,
                  borderRadius: vs(7),
                  padding: `${vs(7)}px ${vs(10)}px`,
                  fontFamily: F.secondary, fontSize: vs(13), fontWeight: 500, color: C.ink,
                  backgroundColor: C.surfaceAlt,
                }}>{f.val}</div>
              </div>
            ))}

            <div style={{
              marginTop: vs(14),
              backgroundColor: C.pine,
              color: C.paper,
              borderRadius: vs(10),
              padding: `${vs(11)}px ${vs(14)}px`,
              textAlign: 'center',
              fontFamily: F.secondary, fontSize: vs(13), fontWeight: 600,
              transform: `scale(${submitScale})`,
              boxShadow: submitHighlight > 0 ? `0 0 0 6px rgba(199,126,58,${0.25 * submitHighlight})` : 'none',
            }}>
              Envoyer la demande
            </div>
          </div>
        </div>

        {/* ── Phase 2: Envelopes flying ── */}
        <div style={{
          position: 'absolute',
          left: vertical ? '50%' : 'calc(4% + 160px)',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: envOp * envExit,
          pointerEvents: 'none',
          width: 0, height: 0,
        }}>
          <div style={{
            position: 'absolute',
            transform: `translate(${env1X}px, ${env1Y}px) rotate(${env1Progress * 12}deg)`,
          }}>
            <Envelope color={C.amber} size={vs(42)} />
          </div>
          <div style={{
            position: 'absolute',
            transform: `translate(${env2X}px, ${env2Y}px) rotate(${-env2Progress * 12}deg)`,
          }}>
            <Envelope color={C.pine} size={vs(42)} />
          </div>
        </div>

        {/* ── Phase 3: Restaurant inbox preview (right) ── */}
        {(frame > 96 && frame < 168) && (
          <div style={{
            position: 'absolute',
            right: vertical ? '50%' : '4%',
            top: vertical ? '14%' : '50%',
            transform: vertical
              ? `translate(50%, ${inboxY}px)`
              : `translate(0, calc(-50% + ${inboxY}px))`,
            opacity: inboxOp * inboxFade,
            width: vertical ? 760 : 340,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: vs(14),
            boxShadow: '0 16px 48px rgba(22,32,27,0.12)',
            overflow: 'hidden',
          }}>
            {/* email header */}
            <div style={{
              backgroundColor: C.warnBg,
              padding: `${vs(10)}px ${vs(14)}px`,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: vs(8),
            }}>
              <div style={{
                width: vs(22), height: vs(22), borderRadius: vs(6),
                backgroundColor: C.warnText,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: C.warnBg, fontFamily: F.secondary, fontSize: vs(11), fontWeight: 800 }}>!</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: F.secondary, fontSize: vs(10), color: C.warnText, fontWeight: 600, margin: 0, letterSpacing: '0.04em' }}>
                  À : restaurant.carbo11@gmail.com
                </p>
                <p style={{ fontFamily: F.primary, fontSize: vs(13), fontWeight: 700, color: C.ink, margin: `${vs(2)}px 0 0`, letterSpacing: '-0.01em' }}>
                  Nouvelle réservation — Marie Dupont
                </p>
              </div>
            </div>
            <div style={{ padding: `${vs(14)}px ${vs(16)}px` }}>
              <div style={{ marginBottom: vs(8) }}><MonoLogo size={vs(22)} /></div>
              <div style={{
                backgroundColor: C.warnBg,
                border: `1px solid rgba(185,125,43,0.25)`,
                borderRadius: vs(8), padding: `${vs(9)}px ${vs(12)}px`,
                marginBottom: vs(12),
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: F.secondary, fontSize: vs(12), fontWeight: 700, color: C.warnText, margin: 0 }}>
                  Nouvelle demande · En attente
                </p>
              </div>
              {[
                ['Nom', 'Marie Dupont'],
                ['Date', '20 juin · 20:00'],
                ['Couverts', '4 personnes'],
              ].map(([k, v], i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: `${vs(5)}px 0`,
                  borderBottom: i < 2 ? `1px solid ${C.borderSoft}` : 'none',
                }}>
                  <span style={{ fontFamily: F.secondary, fontSize: vs(11), color: C.muted }}>{k}</span>
                  <span style={{ fontFamily: F.secondary, fontSize: vs(12), color: C.ink, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{
                marginTop: vs(12),
                backgroundColor: C.amber,
                color: C.paper,
                borderRadius: vs(8),
                padding: `${vs(9)}px ${vs(14)}px`,
                textAlign: 'center',
                fontFamily: F.secondary, fontSize: vs(11), fontWeight: 600,
              }}>
                Gérer dans RESA
              </div>
            </div>
          </div>
        )}

        {/* ── Client pending inbox (left when emails arrive) ── */}
        {(frame > 100 && frame < 168) && (
          <div style={{
            position: 'absolute',
            left: vertical ? '50%' : '4%',
            top: vertical ? '64%' : '50%',
            transform: vertical
              ? `translate(-50%, ${clientPendingY}px)`
              : `translate(0, calc(-50% + ${clientPendingY}px))`,
            opacity: clientPendingOp * clientPendingFade,
            width: vertical ? 760 : 320,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: vs(14),
            boxShadow: '0 16px 48px rgba(22,32,27,0.12)',
            overflow: 'hidden',
          }}>
            <div style={{
              backgroundColor: C.warnBg,
              padding: `${vs(10)}px ${vs(14)}px`,
              borderBottom: `1px solid ${C.border}`,
            }}>
              <p style={{ fontFamily: F.secondary, fontSize: vs(10), color: C.warnText, fontWeight: 600, margin: 0 }}>
                À : marie.dupont@gmail.com
              </p>
              <p style={{ fontFamily: F.primary, fontSize: vs(13), fontWeight: 700, color: C.ink, margin: `${vs(2)}px 0 0`, letterSpacing: '-0.01em' }}>
                Confirmation de votre demande — CARBO
              </p>
            </div>
            <div style={{ padding: `${vs(16)}px ${vs(18)}px`, textAlign: 'center' }}>
              <div style={{ marginBottom: vs(12) }}><MonoLogo size={vs(24)} /></div>
              <div style={{
                backgroundColor: C.warnBg,
                border: `1px solid rgba(185,125,43,0.25)`,
                borderRadius: vs(8), padding: `${vs(12)}px ${vs(14)}px`,
              }}>
                <p style={{ fontFamily: F.secondary, fontSize: vs(14), fontWeight: 700, color: C.warnText, margin: `0 0 ${vs(3)}px` }}>
                  Demande reçue · En attente
                </p>
                <p style={{ fontFamily: F.secondary, fontSize: vs(11), color: C.slate, margin: 0 }}>
                  Vous serez notifié dès validation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 4: Dashboard accept ── */}
        {(frame > 156 && frame < 220) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: dashOp * dashFade,
          }}>
            <div style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: vs(16),
              padding: vs(22),
              width: vertical ? 820 : 460,
              boxShadow: '0 20px 60px rgba(22,32,27,0.15)',
              borderLeft: `${vs(4)}px solid ${C.warnText}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: vs(12), marginBottom: vs(10), flexWrap: 'wrap' }}>
                <p style={{ fontFamily: F.primary, fontSize: vs(18), fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.01em' }}>
                  Marie Dupont
                </p>
                <span style={{
                  fontFamily: F.secondary, fontSize: vs(11), fontWeight: 600,
                  color: C.warnText, backgroundColor: C.warnBg,
                  padding: `${vs(4)}px ${vs(10)}px`, borderRadius: 99,
                }}>En attente</span>
              </div>
              <p style={{ fontFamily: F.secondary, fontSize: vs(14), color: C.slate, margin: `0 0 ${vs(16)}px` }}>
                20 juin · 20:00 · 4 couverts · marie.dupont@gmail.com
              </p>
              <div style={{ display: 'flex', gap: vs(10) }}>
                <div style={{
                  transform: `scale(${acceptScale})`,
                  backgroundColor: C.okBg,
                  border: `1px solid rgba(30,122,82,0.3)`,
                  borderRadius: vs(9),
                  padding: `${vs(10)}px ${vs(20)}px`,
                  fontFamily: F.secondary, fontSize: vs(14), fontWeight: 600,
                  color: C.okText,
                  boxShadow: acceptHighlight > 0 ? `0 0 0 ${vs(6)}px rgba(30,122,82,${0.22 * acceptHighlight})` : 'none',
                }}>✓ Accepter</div>
                <div style={{
                  backgroundColor: C.errBg,
                  border: `1px solid rgba(168,71,58,0.25)`,
                  borderRadius: vs(9),
                  padding: `${vs(10)}px ${vs(20)}px`,
                  fontFamily: F.secondary, fontSize: vs(14), fontWeight: 600,
                  color: C.errText,
                }}>✕ Refuser</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 5: Confirmation envelope flies + final confirmed email ── */}
        {(frame > 200) && (
          <>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: confEnvelopeOp * confExitOp,
              pointerEvents: 'none',
            }}>
              <div style={{
                transform: `translate(${interpolate(frame, [200, 222], [0, 130], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint })}px, ${interpolate(frame, [200, 222], [0, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutQuint })}px) rotate(${interpolate(frame, [200, 222], [0, 18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}deg)`,
              }}>
                <Envelope color={C.okText} size={vs(48)} />
              </div>
            </div>

            <div style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: `translate(-50%, -50%) scale(${confirmedScale})`,
              opacity: confirmedOp,
              width: vertical ? 780 : 380,
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: vs(14),
              boxShadow: '0 24px 70px rgba(30,122,82,0.20)',
              overflow: 'hidden',
            }}>
              <div style={{
                backgroundColor: C.okBg,
                padding: `${vs(13)}px ${vs(15)}px`,
                borderBottom: `1px solid rgba(30,122,82,0.18)`,
              }}>
                <p style={{ fontFamily: F.secondary, fontSize: vs(10), color: C.okText, fontWeight: 600, margin: 0 }}>
                  À : marie.dupont@gmail.com
                </p>
                <p style={{ fontFamily: F.primary, fontSize: vs(13), fontWeight: 700, color: C.ink, margin: `${vs(3)}px 0 0`, letterSpacing: '-0.01em' }}>
                  Votre réservation chez CARBO est CONFIRMÉE
                </p>
              </div>
              <div style={{ padding: `${vs(18)}px ${vs(20)}px`, textAlign: 'center' }}>
                <div style={{ marginBottom: vs(14) }}><MonoLogo size={vs(26)} /></div>
                <div style={{
                  backgroundColor: C.okBg,
                  border: `1px solid rgba(30,122,82,0.22)`,
                  borderRadius: vs(9),
                  padding: `${vs(16)}px ${vs(18)}px`,
                }}>
                  <p style={{ fontFamily: F.secondary, fontSize: vs(16), fontWeight: 700, color: C.okText, margin: `0 0 ${vs(5)}px` }}>
                    ✓ Réservation confirmée
                  </p>
                  <p style={{ fontFamily: F.secondary, fontSize: vs(12), color: C.slate, margin: 0 }}>
                    Votre table est réservée pour le 20 juin à 20:00.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  )
}
