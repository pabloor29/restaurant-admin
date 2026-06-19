"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import {
  CalendarDays, Clock, CalendarClock, Ban, CalendarX, LayoutList,
  UtensilsCrossed, Sparkles, Settings2,
  LogOut, ShieldCheck, Menu as MenuIcon, X,
} from 'lucide-react'

const supabase = createClient()

const ALL_SECTIONS = [
  { path: '/reservations', label: 'Réservations', key: 'reservations', Icon: CalendarDays },
  { path: '/horaires',     label: 'Horaires',     key: 'horaires',     Icon: Clock },
  { path: '/creneaux',     label: 'Créneaux',     key: 'creneaux',     Icon: CalendarClock },
  { path: '/fermetures',   label: 'Fermetures',   key: 'fermetures',   Icon: Ban },
  { path: '/conges',       label: 'Congés',       key: 'conges',       Icon: CalendarX },
  { path: '/formules',     label: 'Formules',     key: 'formules',     Icon: LayoutList },
  { path: '/menus',        label: 'Menus',        key: 'menus',        Icon: UtensilsCrossed },
  { path: '/evenements',   label: 'Évènements',   key: 'evenements',   Icon: Sparkles },
]

const STATIC_SECTIONS = [
  { path: '/infos', label: 'Infos restaurant', Icon: Settings2 },
]

// ── Module-level: évite les remounts à chaque rendu du parent ──
type NavItemProps = {
  href: string
  label: string
  Icon: React.ElementType
  isActive: boolean
  isDisabled: boolean
  hasToggle: boolean
  isOn: boolean
  onToggle?: () => void
  onNavigate: () => void
}

function NavItem({ href, label, Icon, isActive, isDisabled, hasToggle, isOn, onToggle, onNavigate }: NavItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 1,
        opacity: isDisabled ? 0.42 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <Link
        href={href}
        onClick={onNavigate}
        className="sb-link"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: hasToggle ? '8px 4px 8px 10px' : '8px 10px',
          borderRadius: hasToggle ? '8px 0 0 8px' : '8px',
          textDecoration: 'none',
          backgroundColor: isActive ? 'var(--pine-light)' : undefined,
          minWidth: 0,
        }}
      >
        <Icon
          size={15}
          strokeWidth={1.8}
          style={{ color: isActive ? 'var(--pine)' : 'var(--slate)', flexShrink: 0 }}
        />
        <span
          className="font-secondary"
          style={{
            fontSize: '0.82rem',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? 'var(--pine)' : 'var(--slate)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </span>
      </Link>

      {hasToggle && (
        <button
          onClick={onToggle}
          title={isOn ? 'Désactiver' : 'Activer'}
          style={{
            padding: '8px 8px 8px 4px',
            borderRadius: '0 8px 8px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Toggle pill */}
          <span
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 28,
              height: 15,
              borderRadius: 99,
              backgroundColor: isOn ? 'var(--pine)' : 'var(--border)',
              transition: 'background-color 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2.5,
                left: isOn ? 13 : 2.5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                transition: 'left 0.2s cubic-bezier(.25,.46,.45,.94)',
              }}
            />
          </span>
        </button>
      )}
    </div>
  )
}

// ── Composant principal ──
export default function RestaurantNav({
  restaurantId,
  restaurantName,
  isAdmin,
  initialEnabled,
}: {
  restaurantId: string
  restaurantName: string
  isAdmin: boolean
  initialEnabled: Record<string, boolean>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = async (key: string) => {
    const newVal = !enabled[key]
    setEnabled(prev => ({ ...prev, [key]: newVal }))
    await supabase.from('restaurant_sections').upsert(
      { restaurant_id: restaurantId, section: key, enabled: newVal },
      { onConflict: 'restaurant_id,section' }
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const visibleSections = isAdmin
    ? ALL_SECTIONS
    : ALL_SECTIONS.filter(s => enabled[s.key] !== false)

  const closeMobile = () => setMobileOpen(false)

  // Contenu de la sidebar (partagé mobile/desktop via appel de fonction)
  const renderSidebar = () => (
    <>
      {/* Logo */}
      <div
        style={{
          padding: '15px 14px',
          borderBottom: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'var(--pine)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            className="font-primary"
            style={{ fontSize: '1rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
          >
            R
          </span>
        </div>
        <span
          className="font-primary"
          style={{
            fontSize: '0.9rem', fontWeight: 700,
            color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {restaurantName || 'RESA'}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {isAdmin && (
          <p
            className="font-secondary"
            style={{
              padding: '4px 10px 6px',
              fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Sections
          </p>
        )}

        {visibleSections.map(({ path, label, key, Icon }) => {
          const href = `/restaurant/${restaurantId}${path}`
          return (
            <NavItem
              key={key}
              href={href}
              label={label}
              Icon={Icon}
              isActive={pathname.startsWith(href)}
              isDisabled={isAdmin && !enabled[key]}
              hasToggle={isAdmin}
              isOn={enabled[key] !== false}
              onToggle={() => toggle(key)}
              onNavigate={closeMobile}
            />
          )
        })}

        <div style={{ height: 1, backgroundColor: 'var(--border-soft)', margin: '8px 4px' }} />

        {STATIC_SECTIONS.map(({ path, label, Icon }) => {
          const href = `/restaurant/${restaurantId}${path}`
          return (
            <NavItem
              key={path}
              href={href}
              label={label}
              Icon={Icon}
              isActive={pathname.startsWith(href)}
              isDisabled={false}
              hasToggle={false}
              isOn={true}
              onNavigate={closeMobile}
            />
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border-soft)', padding: '8px 8px', flexShrink: 0 }}>
        {isAdmin && (
          <Link
            href="/admin"
            className="sb-footer-item"
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', marginBottom: 1,
              textDecoration: 'none',
            }}
          >
            <ShieldCheck size={15} strokeWidth={1.8} style={{ color: 'var(--slate)', flexShrink: 0 }} />
            <span className="font-secondary" style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>
              Panel admin
            </span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="sb-footer-item"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <LogOut size={15} strokeWidth={1.8} style={{ color: 'var(--slate)', flexShrink: 0 }} />
          <span className="font-secondary" style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>
            Déconnexion
          </span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/*
       * ── Mobile : top bar ──
       * IMPORTANT : ne pas mettre display dans le style inline,
       * sinon il surpasse `lg:hidden`. Le display est géré par Tailwind.
       */}
      <div
        className="flex items-center lg:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 30, height: 56,
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 16px', gap: 12,
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <MenuIcon size={17} strokeWidth={1.8} style={{ color: 'var(--ink)' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26, height: 26, borderRadius: 7,
              backgroundColor: 'var(--pine)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="font-primary" style={{ fontSize: '0.82rem', color: 'var(--paper)', fontWeight: 800 }}>
              R
            </span>
          </div>
          <span className="font-primary" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            {restaurantName || 'RESA'}
          </span>
        </div>
      </div>

      {/* ── Mobile : overlay ── */}
      <div
        className="lg:hidden"
        onClick={closeMobile}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          backgroundColor: 'rgba(22,32,27,0.3)',
          backdropFilter: 'blur(2px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* ── Mobile : sidebar slide-in ── */}
      <aside
        className="flex flex-col lg:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 50,
          width: 'min(240px, 85vw)',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.16,1,.3,1)',
          boxShadow: mobileOpen ? '8px 0 32px rgba(22,32,27,0.12)' : 'none',
          overflowY: 'auto',
        }}
      >
        {/* Bouton fermer dans le header de la sidebar */}
        <div
          style={{
            padding: '10px 10px 0',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <button
            onClick={closeMobile}
            aria-label="Fermer le menu"
            style={{
              width: 32, height: 32, borderRadius: 7,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} strokeWidth={2} style={{ color: 'var(--slate)' }} />
          </button>
        </div>
        {renderSidebar()}
      </aside>

      {/* ── Desktop : sidebar sticky ── */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 220, minWidth: 220, flexShrink: 0,
          flexDirection: 'column',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          position: 'sticky', top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {renderSidebar()}
      </aside>
    </>
  )
}
