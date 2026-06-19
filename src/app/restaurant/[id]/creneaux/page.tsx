"use client"

import { use, useEffect, useState } from 'react'
import { Sun, Moon, Timer } from 'lucide-react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

// ── Types ──────────────────────────────────────────────────────────
type ServiceSchedule = {
  active: boolean
  debut: string
  fin: string
}

type Schedule = {
  midi: ServiceSchedule
  soir: ServiceSchedule
  interval: number
}

const DEFAULT: Schedule = {
  midi: { active: true, debut: '12:00', fin: '14:00' },
  soir: { active: true, debut: '19:00', fin: '22:30' },
  interval: 30,
}

const INTERVALS = [
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1 h 30' },
  { value: 120, label: '2 heures' },
]

// ── Styles partagés ────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  border: '1.5px solid var(--border)',
  borderRadius: 8,
  padding: '8px 11px',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
  fontFamily: 'var(--font-secondary)',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
}

const inputDisabledStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.4,
  cursor: 'not-allowed',
  backgroundColor: 'var(--surface-alt)',
}

// ── Composant ServiceCard ──────────────────────────────────────────
type ServiceCardProps = {
  title: string
  Icon: React.ElementType
  service: ServiceSchedule
  onChange: (next: Partial<ServiceSchedule>) => void
}

function ServiceCard({ title, Icon, service, onChange }: ServiceCardProps) {
  const { active, debut, fin } = service

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'opacity 0.2s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: active ? '1px solid var(--border-soft)' : 'none',
          backgroundColor: active ? 'var(--surface)' : 'var(--surface-alt)',
          transition: 'background-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon
            size={16}
            strokeWidth={1.8}
            style={{ color: active ? 'var(--pine)' : 'var(--muted)', flexShrink: 0 }}
          />
          <span
            className="font-secondary"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: active ? 'var(--ink)' : 'var(--muted)',
            }}
          >
            {title}
          </span>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onChange({ active: !active })}
          aria-label={active ? 'Désactiver ce service' : 'Activer ce service'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <span
            className="font-secondary"
            style={{ fontSize: '0.75rem', color: active ? 'var(--pine)' : 'var(--muted)', fontWeight: 500 }}
          >
            {active ? 'Actif' : 'Inactif'}
          </span>
          <span
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 34,
              height: 18,
              borderRadius: 99,
              backgroundColor: active ? 'var(--pine)' : 'var(--border)',
              transition: 'background-color 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: active ? 16 : 3,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                transition: 'left 0.2s cubic-bezier(.25,.46,.45,.94)',
              }}
            />
          </span>
        </button>
      </div>

      {/* Body — masqué quand inactif */}
      {active && (
        <div
          style={{
            padding: '16px 18px 18px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
          }}
        >
          <div>
            <label
              className="font-secondary"
              style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}
            >
              Début
            </label>
            <input
              type="time"
              value={debut}
              onChange={e => onChange({ debut: e.target.value })}
              style={active ? inputStyle : inputDisabledStyle}
              disabled={!active}
            />
          </div>
          <div>
            <label
              className="font-secondary"
              style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}
            >
              Fin
            </label>
            <input
              type="time"
              value={fin}
              onChange={e => onChange({ fin: e.target.value })}
              style={active ? inputStyle : inputDisabledStyle}
              disabled={!active}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────
export default function CreneauxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    supabase
      .from('reservation_schedule')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single()
      .then(({ data }) => {
        if (!data) return
        setSchedule({
          midi: {
            active: data.midi_active ?? true,
            debut: data.midi_debut ?? '12:00',
            fin:   data.midi_fin   ?? '14:00',
          },
          soir: {
            active: data.soir_active ?? true,
            debut: data.soir_debut ?? '19:00',
            fin:   data.soir_fin   ?? '22:30',
          },
          interval: data.interval_minutes ?? 30,
        })
      })
  }, [restaurantId])

  const update = (service: 'midi' | 'soir', patch: Partial<ServiceSchedule>) =>
    setSchedule(s => ({ ...s, [service]: { ...s[service], ...patch } }))

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from('reservation_schedule')
      .upsert(
        {
          restaurant_id:    restaurantId,
          midi_active:      schedule.midi.active,
          midi_debut:       schedule.midi.debut || null,
          midi_fin:         schedule.midi.fin   || null,
          soir_active:      schedule.soir.active,
          soir_debut:       schedule.soir.debut || null,
          soir_fin:         schedule.soir.fin   || null,
          interval_minutes: schedule.interval,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'restaurant_id' }
      )
    setMessage(error
      ? { text: "Erreur lors de l'enregistrement.", ok: false }
      : { text: 'Créneaux enregistrés !', ok: true }
    )
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Titre */}
      <h2
        className="font-secondary"
        style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600, marginBottom: 20, textTransform: 'uppercase' }}
      >
        Horaires de réservation
      </h2>

      {/* Services */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
        <ServiceCard
          title="Service du midi"
          Icon={Sun}
          service={schedule.midi}
          onChange={patch => update('midi', patch)}
        />
        <ServiceCard
          title="Service du soir"
          Icon={Moon}
          service={schedule.soir}
          onChange={patch => update('soir', patch)}
        />
      </div>

      {/* Intervalle */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '14px 18px 18px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <Timer size={16} strokeWidth={1.8} style={{ color: 'var(--pine)', flexShrink: 0 }} />
          <span
            className="font-secondary"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}
          >
            Intervalle entre réservations
          </span>
        </div>

        <select
          value={schedule.interval}
          onChange={e => setSchedule(s => ({ ...s, interval: Number(e.target.value) }))}
          className="font-secondary"
          style={{
            ...inputStyle,
            width: 'auto',
            minWidth: 180,
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A9587' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: 32,
          }}
        >
          {INTERVALS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <p
          className="font-secondary"
          style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}
        >
          Durée minimum entre deux créneaux — s&apos;applique aux deux services.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <p
          className="font-secondary"
          style={{
            fontSize: '0.82rem',
            color: message.ok ? 'var(--status-ok-text)' : 'var(--status-err-text)',
            backgroundColor: message.ok ? 'var(--status-ok-bg)' : 'var(--status-err-bg)',
            borderRadius: 8,
            padding: '8px 13px',
            display: 'inline-block',
            marginBottom: 16,
          }}
        >
          {message.text}
        </p>
      )}

      {/* Bouton */}
      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-secondary cursor-pointer transition-all"
          style={{
            backgroundColor: 'var(--pine)',
            color: 'var(--paper)',
            borderRadius: 10,
            padding: '11px 24px',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
