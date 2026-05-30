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
      className="font-secondary text-sm cursor-pointer"
      style={{ color: 'rgba(252,238,239,0.35)' }}
    >
      Déconnexion
    </button>
  )
}
