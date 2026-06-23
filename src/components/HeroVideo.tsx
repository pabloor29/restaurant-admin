'use client'

import { useEffect, useRef } from 'react'

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    const tryPlay = () => {
      const p = v.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }
    tryPlay()
    const onCanPlay = () => tryPlay()
    v.addEventListener('canplay', onCanPlay)
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [])

  return (
    <video
      ref={ref}
      src="/motion-design/resa-vsl-vertical.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      controls={false}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )
}
