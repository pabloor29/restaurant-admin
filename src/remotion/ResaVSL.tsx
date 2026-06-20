import { AbsoluteFill, Sequence } from 'remotion'
import { SceneIntro } from './SceneIntro'
import { SceneSidebar } from './SceneSidebar'
import { SceneReservationFlow } from './SceneReservationFlow'
import { SceneDashboard } from './SceneDashboard'
import { SceneStats } from './SceneStats'
import { SceneFeatures } from './SceneFeatures'
import { SceneCTA } from './SceneCTA'
import { C } from './colors'

// 30fps · 960 frames = 32 secondes
export const FPS = 30
export const DURATION = 960

// Timings (with ~14-frame crossfade overlap between scenes)
const T = {
  intro:        { from: 0,   len: 90  },  // 0–3s          : Logo + tagline
  sidebar:      { from: 76,  len: 144 },  // ~2.5–7.3s     : Sidebar + sections
  reservation:  { from: 206, len: 244 },  // ~6.9–15s      : Email flow (centerpiece)
  dashboard:    { from: 436, len: 164 },  // ~14.5–20s     : Real dashboard
  stats:        { from: 586, len: 154 },  // ~19.5–24.6s   : Stats + chart
  features:     { from: 726, len: 114 },  // ~24.2–28s     : Other features
  cta:          { from: 826, len: 134 },  // ~27.5–32s     : 67€ offer
}

export function ResaVSL() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Sequence from={T.intro.from} durationInFrames={T.intro.len}>
        <SceneIntro />
      </Sequence>
      <Sequence from={T.sidebar.from} durationInFrames={T.sidebar.len}>
        <SceneSidebar />
      </Sequence>
      <Sequence from={T.reservation.from} durationInFrames={T.reservation.len}>
        <SceneReservationFlow />
      </Sequence>
      <Sequence from={T.dashboard.from} durationInFrames={T.dashboard.len}>
        <SceneDashboard />
      </Sequence>
      <Sequence from={T.stats.from} durationInFrames={T.stats.len}>
        <SceneStats />
      </Sequence>
      <Sequence from={T.features.from} durationInFrames={T.features.len}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={T.cta.from} durationInFrames={T.cta.len}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  )
}
