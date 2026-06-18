"use client"

import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-4 mb-12">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--pine)' }}
        >
          <span className="font-primary" style={{ fontSize: '1.7rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>R</span>
        </div>
        <span className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          RESA<span style={{ color: 'var(--amber)' }}>.</span>
        </span>
      </div>

      <div
        className="w-full text-center"
        style={{ maxWidth: 380, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '36px 28px' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: 'var(--pine-light)' }}
        >
          <span style={{ fontSize: '1.4rem' }}>⏳</span>
        </div>
        <h2 className="font-primary mb-2" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' }}>
          Compte en attente
        </h2>
        <p className="font-secondary mb-1" style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>
          Votre compte est en cours de configuration.
        </p>
        <p className="font-secondary mb-8" style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>
          Contactez l&apos;administrateur pour finaliser votre accès.
        </p>

        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          className="font-secondary cursor-pointer"
          style={{ color: 'var(--muted)', background: 'none', border: 'none', fontSize: '0.85rem' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
