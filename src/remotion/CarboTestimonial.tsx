import { AbsoluteFill, Sequence } from 'remotion'
import { C } from './colors'
import { CarboSceneOpen } from './CarboSceneOpen'
import { CarboSceneTrust } from './CarboSceneTrust'
import { CarboSceneReservation } from './CarboSceneReservation'
import { CarboSceneQuote } from './CarboSceneQuote'
import { CarboSceneOutro } from './CarboSceneOutro'

// 30fps · 704 frames ≈ 23.5s
// Crossfade overlap ≈ 14 frames between scenes (each scene fades in/out internally).
export const CARBO_FPS = 30
export const CARBO_DURATION = 704

const T = {
  open:        { from: 0,   len: 90  },  // 0–3s          Carbo brand opener
  trust:       { from: 76,  len: 140 },  // ~2.5–7.2s     Carbo + RESA handshake
  reservation: { from: 202, len: 200 },  // ~6.7–13.4s    Booking widget in action
  quote:       { from: 388, len: 180 },  // ~13–18.9s     Testimonial quote
  outro:       { from: 554, len: 150 },  // ~18.5–23.5s   Recommendation card
}

export function CarboTestimonial() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Sequence from={T.open.from} durationInFrames={T.open.len}>
        <CarboSceneOpen />
      </Sequence>
      <Sequence from={T.trust.from} durationInFrames={T.trust.len}>
        <CarboSceneTrust />
      </Sequence>
      <Sequence from={T.reservation.from} durationInFrames={T.reservation.len}>
        <CarboSceneReservation />
      </Sequence>
      <Sequence from={T.quote.from} durationInFrames={T.quote.len}>
        <CarboSceneQuote />
      </Sequence>
      <Sequence from={T.outro.from} durationInFrames={T.outro.len}>
        <CarboSceneOutro />
      </Sequence>
    </AbsoluteFill>
  )
}
