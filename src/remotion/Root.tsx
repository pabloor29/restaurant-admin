import { Composition } from 'remotion'
import { ResaVSL, FPS, DURATION } from './ResaVSL'

export const RemotionRoot = () => (
  <>
    {/* 16:9 Web — embed on landing page */}
    <Composition
      id="ResaVSL"
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      width={1280}
      height={720}
    />

    {/* 1:1 Square — LinkedIn / Instagram feed */}
    <Composition
      id="ResaVSL-Square"
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1080}
    />

    {/* 9:16 Vertical — Reels / Stories / TikTok */}
    <Composition
      id="ResaVSL-Vertical"
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
)
