"use client"

import { createClient } from '../../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="font-secondary cursor-pointer"
      style={{ color: 'var(--slate)', background: 'none', border: 'none', fontSize: '0.85rem' }}
    >
      Déconnexion
    </button>
  )
}
