"use client"

import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <h1 className="font-primary text-neutral mb-2" style={{ fontSize: '8rem', lineHeight: 1 }}>
        RESA
      </h1>
      <p className="font-secondary text-neutral mb-10" style={{ opacity: 0.4, fontSize: '0.85rem', letterSpacing: '0.15em' }}>
        GESTION DES RÉSERVATIONS
      </p>

      <div className="w-full text-center" style={{ maxWidth: '360px' }}>
        <p className="font-secondary text-neutral mb-2" style={{ fontSize: '0.95rem' }}>
          Votre compte est en attente de configuration.
        </p>
        <p className="font-secondary mb-8" style={{ color: 'rgba(252,238,239,0.4)', fontSize: '0.85rem' }}>
          Contactez l&apos;administrateur pour accéder à l&apos;application.
        </p>

        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          className="font-secondary text-sm cursor-pointer"
          style={{ color: 'rgba(252,238,239,0.3)', background: 'none', border: 'none' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
