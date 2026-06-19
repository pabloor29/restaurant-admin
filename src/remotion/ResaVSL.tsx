import { AbsoluteFill, Sequence } from 'remotion'
import { SceneIntro } from './SceneIntro'
import { SceneFeatures } from './SceneFeatures'
import { SceneDashboard } from './SceneDashboard'
import { SceneStats } from './SceneStats'
import { SceneCTA } from './SceneCTA'
import { C } from './colors'

// 30fps · 540 frames = 18 secondes
export const FPS = 30
export const DURATION = 540

// Timings (with 14-frame crossfade overlap between scenes)
const T = {
  intro:     { from: 0,   len: 90  },   // 0–3s
  features:  { from: 76,  len: 150 },   // 2.53–7.53s
  dashboard: { from: 212, len: 180 },   // 7.07–13.07s
  stats:     { from: 378, len: 100 },   // 12.6–15.93s
  cta:       { from: 464, len: 90  },   // 15.47–18.47s (capped at 540)
}

export function ResaVSL() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Sequence from={T.intro.from} durationInFrames={T.intro.len}>
        <SceneIntro />
      </Sequence>
      <Sequence from={T.features.from} durationInFrames={T.features.len}>
        <SceneFeatures />
      </Sequence>
      <Sequence from={T.dashboard.from} durationInFrames={T.dashboard.len}>
        <SceneDashboard />
      </Sequence>
      <Sequence from={T.stats.from} durationInFrames={T.stats.len}>
        <SceneStats />
      </Sequence>
      <Sequence from={T.cta.from} durationInFrames={T.cta.len}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  )
}
