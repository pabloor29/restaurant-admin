'use client'

import dynamic from 'next/dynamic'

const ResaPlayerLazy = dynamic(
  () => import('./ResaPlayer').then(m => m.ResaPlayer),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 20,
        backgroundColor: '#0C3528',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'sans-serif', fontSize: 14, color: 'rgba(245,241,233,0.4)' }}>
          Chargement…
        </span>
      </div>
    ),
  }
)

export function ResaPlayerWrapper() {
  return <ResaPlayerLazy />
}
