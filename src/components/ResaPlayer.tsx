'use client'

import { Player } from '@remotion/player'
import { ResaVSL, FPS, DURATION } from '../remotion/ResaVSL'

export function ResaPlayer() {
  return (
    <Player
      component={ResaVSL}
      durationInFrames={DURATION}
      fps={FPS}
      compositionWidth={1280}
      compositionHeight={720}
      style={{ width: '100%', borderRadius: 20, overflow: 'hidden' }}
      autoPlay
      loop
      controls={false}
      clickToPlay={false}
    />
  )
}
