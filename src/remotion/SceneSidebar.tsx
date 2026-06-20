import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'

const SECTIONS = [
  { label: 'Réservations',     icon: 'calendar',  highlight: true  },
  { label: 'Horaires',         icon: 'clock',     highlight: false },
  { label: 'Créneaux',         icon: 'cclock',    highlight: false },
  { label: 'Fermetures',       icon: 'ban',       highlight: false },
  { label: 'Congés',           icon: 'cx',        highlight: false },
  { label: 'Formules',         icon: 'list',      highlight: false },
  { label: 'Menus',            icon: 'fork',      highlight: false },
  { label: 'Évènements',       icon: 'spark',     highlight: false },
]

function IconGlyph({ name, color, size = 16 }: { name: string; color: string; size?: number }) {
  const s = { width: size, height: size, stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'calendar': return (
      <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
    )
    case 'clock': return (
      <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
    )
    case 'cclock': return (
      <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 14h3M8 17h2" /></svg>
    )
    case 'ban': return (
      <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
    )
    case 'cx': return (
      <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4M9 14l6 6M15 14l-6 6" /></svg>
    )
    case 'list': return (
      <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h10M7 17h6" /></svg>
    )
    case 'fork': return (
      <svg viewBox="0 0 24 24" {...s}><path d="M7 2v8a3 3 0 0 0 6 0V2M10 10v12M17 2c-1.5 2-2 4-2 6s.5 4 2 6v8" /></svg>
    )
    case 'spark': return (
      <svg viewBox="0 0 24 24" {...s}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" /></svg>
    )
    default: return null
  }
}

export function SceneSidebar() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const sidebarX = interpolate(spring({ frame, fps, config: { damping: 18, stiffness: 110, mass: 1 } }), [0, 1], [-260, 0])
  const sidebarOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })

  const titleOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [30, 50], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

  // Smooth glide selector: dwell on each then glide to next
  const HIGHLIGHT_START = 50
  const HIGHLIGHT_STEP = 11
  const segments = Math.max(0, (frame - HIGHLIGHT_START) / HIGHLIGHT_STEP)
  const segIdx = Math.floor(segments)
  const segLocal = segments - segIdx
  const dwellRatio = 0.6   // 60% dwell, 40% glide
  const glide = Math.max(0, (segLocal - dwellRatio) / (1 - dwellRatio))
  const easedGlide = 1 - Math.pow(1 - glide, 3)
  const floatIdx = Math.min(SECTIONS.length - 1, Math.max(0, segIdx + easedGlide))
  const activeIdx = Math.round(floatIdx)

  const sidebarW = vertical ? 360 : 240
  const sectionFont = vertical ? 26 : 13
  const sectionIconSize = vertical ? 24 : 16
  const logoBoxSize = vertical ? 54 : 32
  const logoFontSize = vertical ? 28 : 17
  const brandFontSize = vertical ? 26 : 15
  const eyebrowSize = vertical ? 18 : 12
  const headingSize = vertical ? 64 : 48
  const subSize = vertical ? 26 : 16

  // Item box geometry (must match the rendered item below)
  const ITEM_H = vertical ? 64 : 36
  const ITEM_GAP = vertical ? 6 : 3
  const ITEM_STRIDE = ITEM_H + ITEM_GAP
  const ITEM_RADIUS = vertical ? 12 : 8

  // Selector entrance: scales in once at start
  const selectorIntro = spring({ frame: Math.max(0, frame - (HIGHLIGHT_START - 8)), fps, config: { damping: 12, stiffness: 160, mass: 0.7 } })
  const selectorOp = interpolate(frame, [HIGHLIGHT_START - 8, HIGHLIGHT_START + 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      backgroundColor: C.paper,
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      opacity: bgOp * sceneOpacity,
    }}>
      {/* Sidebar */}
      <div style={{
        width: vertical ? '100%' : sidebarW,
        height: vertical ? '50%' : '100%',
        backgroundColor: C.surface,
        borderRight: vertical ? 'none' : `1px solid ${C.border}`,
        borderBottom: vertical ? `1px solid ${C.border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        opacity: sidebarOp,
        transform: vertical ? 'none' : `translateX(${sidebarX}px)`,
        boxShadow: '8px 0 32px rgba(22,32,27,0.04)',
      }}>
        {/* Logo header */}
        <div style={{
          padding: vertical ? '28px 24px' : '20px 18px',
          borderBottom: `1px solid ${C.borderSoft}`,
          display: 'flex',
          alignItems: 'center',
          gap: vertical ? 16 : 11,
        }}>
          <div style={{
            width: logoBoxSize, height: logoBoxSize, borderRadius: vertical ? 14 : 9,
            backgroundColor: C.pine,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: F.primary, fontSize: logoFontSize, fontWeight: 800, color: C.paper, lineHeight: 1, letterSpacing: '-0.03em' }}>R</span>
          </div>
          <span style={{ fontFamily: F.primary, fontSize: brandFontSize, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>
            Restaurant CARBO
          </span>
        </div>

        {/* Section list */}
        <div style={{ padding: vertical ? '20px 16px' : '14px 10px', flex: 1, overflow: 'hidden' }}>
          <p style={{
            fontFamily: F.secondary,
            fontSize: vertical ? 14 : 10, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: C.muted, margin: vertical ? '4px 16px 14px' : '4px 12px 8px',
          }}>Sections</p>

          {/* Items container with absolutely-positioned gliding highlight */}
          <div style={{ position: 'relative' }}>
            {/* Sliding selector */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: floatIdx * ITEM_STRIDE,
              height: ITEM_H,
              backgroundColor: C.pineLight,
              borderRadius: ITEM_RADIUS,
              opacity: selectorOp,
              transform: `scale(${interpolate(selectorIntro, [0, 1], [0.92, 1])})`,
              transformOrigin: 'left center',
              boxShadow: `inset 3px 0 0 ${C.pine}`,
            }} />

            {SECTIONS.map((s, i) => {
              const distance = Math.abs(floatIdx - i)
              const proximity = Math.max(0, 1 - distance)   // 1 at item, 0 away
              const itemOp = interpolate(frame, [20 + i * 4, 35 + i * 4], [0, 1], { extrapolateRight: 'clamp' })
              const itemX = interpolate(frame, [20 + i * 4, 35 + i * 4], [-16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })

              // Lerp colors via opacity overlay technique: use proximity > 0.5 for active text
              const activeMix = proximity
              const textColor = activeMix > 0.5 ? C.pine : C.slate

              return (
                <div key={s.label} style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: vertical ? 18 : 11,
                  padding: vertical ? '0 18px' : '0 12px',
                  height: ITEM_H,
                  marginBottom: ITEM_GAP,
                  opacity: itemOp,
                  transform: `translateX(${itemX}px)`,
                }}>
                  <IconGlyph name={s.icon} color={textColor} size={sectionIconSize} />
                  <span style={{
                    fontFamily: F.secondary,
                    fontSize: sectionFont,
                    fontWeight: activeMix > 0.5 ? 600 : 400,
                    color: textColor,
                  }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right content - title */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: vertical ? '40px 40px' : '0 64px',
        opacity: titleOp,
        transform: `translateY(${titleY}px)`,
      }}>
        <p style={{
          fontFamily: F.secondary,
          fontSize: eyebrowSize, fontWeight: 600,
          letterSpacing: '0.18em',
          color: C.amber,
          textTransform: 'uppercase',
          margin: '0 0 14px',
        }}>Espace d&apos;administration</p>
        <h2 style={{
          fontFamily: F.primary,
          fontSize: headingSize,
          fontWeight: 800,
          color: C.ink,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          textAlign: 'center',
        }}>
          Tout votre<br />restaurant.<br />
          <span style={{ color: C.pine }}>Un seul endroit.</span>
        </h2>
        <p style={{
          fontFamily: F.secondary,
          fontSize: subSize,
          color: C.slate,
          marginTop: vertical ? 28 : 18,
          lineHeight: 1.5,
          textAlign: 'center',
          maxWidth: vertical ? 600 : 360,
        }}>
          Réservations, horaires, menus, fermetures,<br />congés, formules, évènements.
        </p>
      </div>
    </AbsoluteFill>
  )
}
