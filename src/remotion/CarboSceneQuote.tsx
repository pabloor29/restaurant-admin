import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, easeOut } from './colors'
import { CARBO, CARBO_F } from './CarboColors'

// ~180 frames — pink panel · deep-green text · Cormorant italic quote, RESA in Anton.
export function CarboSceneQuote() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()
  const vertical = height > width

  const bgOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const sceneOpacity = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' })

  const markSpring = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 10, stiffness: 140, mass: 0.8 } })
  const markOp = interpolate(frame, [4, 20], [0, 1], { extrapolateRight: 'clamp' })

  const line = (start: number) => ({
    op: interpolate(frame, [start, start + 18], [0, 1], { extrapolateRight: 'clamp' }),
    y:  interpolate(frame, [start, start + 18], [22, 0], { extrapolateRight: 'clamp', easing: easeOut }),
  })
  const l1 = line(18)
  const l2 = line(32)
  const l3 = line(46)
  const l4 = line(60)

  const starsBase = 80
  const stars = [0, 1, 2, 3, 4].map((i) =>
    spring({ frame: Math.max(0, frame - (starsBase + i * 6)), fps, config: { damping: 8, stiffness: 220, mass: 0.5 } })
  )

  const authorOp = interpolate(frame, [108, 124], [0, 1], { extrapolateRight: 'clamp' })
  const authorY  = interpolate(frame, [108, 124], [16, 0], { extrapolateRight: 'clamp', easing: easeOut })

  return (
    <AbsoluteFill style={{
      backgroundColor: CARBO.pink,
      padding: vertical ? '60px 40px' : '48px 80px',
      opacity: bgOp * sceneOpacity,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: -160, right: -160,
        width: 520, height: 520,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${CARBO.inkGreen}1A 0%, ${CARBO.inkGreen}00 65%)`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -180, left: -180,
        width: 560, height: 560,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.amber}1F 0%, ${C.amber}00 70%)`,
      }} />

      {/* Opening curly quote */}
      <div style={{
        fontFamily: CARBO_F.display,
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: vertical ? 300 : 220,
        color: CARBO.inkGreen,
        lineHeight: 0.7,
        opacity: markOp * 0.4,
        transform: `scale(${markSpring})`,
        transformOrigin: 'left top',
        marginBottom: vertical ? -40 : -20,
      }}>“</div>

      <div style={{
        fontFamily: CARBO_F.display,
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: vertical ? 60 : 44,
        color: CARBO.inkGreen,
        lineHeight: 1.25,
        letterSpacing: '-0.005em',
        marginLeft: vertical ? 0 : 20,
        maxWidth: vertical ? '100%' : 980,
      }}>
        <div style={{ opacity: l1.op, transform: `translateY(${l1.y}px)` }}>
          Avant <span style={{ color: CARBO.inkGreen, fontStyle: 'normal', fontFamily: CARBO_F.anton, fontWeight: 400, fontSize: vertical ? 58 : 42, letterSpacing: '0.04em' }}>RESA</span>, on perdait des réservations
        </div>
        <div style={{ opacity: l2.op, transform: `translateY(${l2.y}px)` }}>
          chaque semaine — appels manqués, mails oubliés.
        </div>
        <div style={{ opacity: l3.op, transform: `translateY(${l3.y}px)`, marginTop: vertical ? 18 : 12 }}>
          Maintenant tout est automatique, propre, fiable.
        </div>
        <div style={{
          opacity: l4.op,
          transform: `translateY(${l4.y}px)`,
          fontFamily: CARBO_F.script,
          fontStyle: 'normal',
          fontSize: vertical ? 72 : 56,
          marginTop: vertical ? 16 : 10,
        }}>
          On le recommande sans hésiter.
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: vertical ? 14 : 10,
        marginTop: vertical ? 50 : 36,
        marginLeft: vertical ? 0 : 20,
      }}>
        {stars.map((s, i) => (
          <span key={i} style={{
            fontSize: vertical ? 48 : 36,
            color: CARBO.inkGreen,
            transform: `scale(${s})`,
            display: 'inline-block',
            lineHeight: 1,
          }}>★</span>
        ))}
      </div>

      {/* Author block */}
      <div style={{
        marginTop: vertical ? 50 : 32,
        marginLeft: vertical ? 0 : 20,
        opacity: authorOp,
        transform: `translateY(${authorY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: vertical ? 22 : 16,
      }}>
        <div style={{
          width: vertical ? 92 : 62,
          height: vertical ? 92 : 62,
          borderRadius: '50%',
          backgroundColor: CARBO.inkGreen,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${CARBO.inkGreen}`,
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        }}>
          <span style={{
            fontFamily: CARBO_F.anton,
            fontSize: vertical ? 48 : 32,
            color: CARBO.pink,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}>C</span>
        </div>
        <div>
          <p style={{
            fontFamily: CARBO_F.anton,
            fontSize: vertical ? 30 : 22,
            color: CARBO.inkGreen,
            margin: 0,
            letterSpacing: '0.04em',
          }}>L&apos;ÉQUIPE CARBO</p>
          <p style={{
            fontFamily: CARBO_F.script,
            fontSize: vertical ? 26 : 18,
            color: `${CARBO.inkGreen}cc`,
            margin: '2px 0 0',
            lineHeight: 1,
          }}>Restaurant italien · Carcassonne</p>
        </div>
      </div>
    </AbsoluteFill>
  )
}
