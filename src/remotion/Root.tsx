import { Composition } from 'remotion'
import { ResaVSL, FPS, DURATION } from './ResaVSL'

export const RemotionRoot = () => (
  <Composition
    id="ResaVSL"
    component={ResaVSL}
    durationInFrames={DURATION}
    fps={FPS}
    width={1280}
    height={720}
  />
)
