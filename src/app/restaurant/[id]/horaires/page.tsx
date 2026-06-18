"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

type TimeSlot = { midi: { debut: string; fin: string }; soir: { debut: string; fin: string } }
type ClosedState = { closedLunch: boolean; closedDiner: boolean; closedDay: boolean }

const defaultTimes: TimeSlot[] = DAYS.map(() => ({ midi: { debut: '', fin: '' }, soir: { debut: '', fin: '' } }))
const defaultClosed: ClosedState[] = DAYS.map(() => ({ closedLunch: false, closedDiner: false, closedDay: false }))

const inputCls = "font-secondary outline-none transition-all"
const inputStyle = {
  border: '1.5px solid var(--border)',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: '0.8rem',
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
  width: '7rem',
}

export default function HorairesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [times, setTimes] = useState<TimeSlot[]>(defaultTimes)
  const [closed, setClosed] = useState<ClosedState[]>(defaultClosed)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('opening_hours')
      .select('hours')
      .eq('restaurant_id', restaurantId)
      .single()
      .then(({ data }) => {
        if (data?.hours) {
          setTimes(data.hours.map((h: TimeSlot & ClosedState) => ({ midi: h.midi || { debut: '', fin: '' }, soir: h.soir || { debut: '', fin: '' } })))
          setClosed(data.hours.map((h: TimeSlot & ClosedState) => ({ closedLunch: !!h.closedLunch, closedDiner: !!h.closedDiner, closedDay: !!h.closedDay })))
        }
      })
  }, [restaurantId])

  const handleTime = (i: number, period: 'midi' | 'soir', field: 'debut' | 'fin', val: string) => {
    const u = [...times]; u[i][period][field] = val; setTimes(u)
  }

  const handleClosed = (i: number, field: keyof ClosedState) => {
    const u = [...closed]; u[i][field] = !u[i][field]; setClosed(u)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const payload = DAYS.map((_, i) => ({ midi: times[i].midi, soir: times[i].soir, ...closed[i] }))
    const { error } = await supabase
      .from('opening_hours')
      .upsert({ restaurant_id: restaurantId, hours: payload, updated_at: new Date().toISOString() }, { onConflict: 'restaurant_id' })
    setMessage(error ? "Erreur lors de l'enregistrement." : 'Horaires enregistrés !')
    setSaving(false)
  }

  return (
    <div>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        HORAIRES D&apos;OUVERTURE
      </h2>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto mb-6 rounded-xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <table className="w-full table-auto" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <th className="px-4 py-3 text-left font-secondary" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}> </th>
              <th colSpan={2} className="px-4 py-3 text-center font-secondary" style={{ fontSize: '0.72rem', color: 'var(--slate)', letterSpacing: '0.08em' }}>MIDI</th>
              <th colSpan={2} className="px-4 py-3 text-center font-secondary" style={{ fontSize: '0.72rem', color: 'var(--slate)', letterSpacing: '0.08em' }}>SOIR</th>
              <th colSpan={3} className="px-4 py-3 text-center font-secondary" style={{ fontSize: '0.72rem', color: 'var(--slate)', letterSpacing: '0.08em' }}>FERMETURES</th>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <th className="px-4 py-2" />
              {['Début', 'Fin', 'Début', 'Fin'].map((h, i) => (
                <th key={i} className="px-3 py-2 font-secondary text-center" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{h}</th>
              ))}
              {['Midi', 'Soir', 'Jour'].map(h => (
                <th key={h} className="px-3 py-2 font-secondary text-center" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => (
              <tr key={day} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <td className="px-4 py-2.5 font-secondary" style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>{day}</td>
                {(['midi', 'soir'] as const).flatMap(p =>
                  (['debut', 'fin'] as const).map(f => (
                    <td key={`${p}-${f}`} className="px-2 py-1.5">
                      <input type="time" value={times[i][p][f]} onChange={e => handleTime(i, p, f, e.target.value)} className={inputCls} style={inputStyle} />
                    </td>
                  ))
                )}
                {(['closedLunch', 'closedDiner', 'closedDay'] as const).map(f => (
                  <td key={f} className="px-2 py-1.5 text-center">
                    <input type="checkbox" checked={closed[i][f]} onChange={() => handleClosed(i, f)} style={{ accentColor: 'var(--pine)', width: 16, height: 16, cursor: 'pointer' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3 mb-6">
        {DAYS.map((day, i) => (
          <div key={day} className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-secondary mb-3" style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 600 }}>{day}</p>
            <div className="space-y-2">
              {(['midi', 'soir'] as const).map(p => (
                <div key={p} className="flex items-center gap-3">
                  <span className="font-secondary w-10 flex-shrink-0 uppercase" style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>{p}</span>
                  <input type="time" value={times[i][p].debut} onChange={e => handleTime(i, p, 'debut', e.target.value)} className={inputCls + ' flex-1'} style={{ ...inputStyle, width: 'auto' }} />
                  <input type="time" value={times[i][p].fin} onChange={e => handleTime(i, p, 'fin', e.target.value)} className={inputCls + ' flex-1'} style={{ ...inputStyle, width: 'auto' }} />
                </div>
              ))}
              <div className="flex gap-4 pt-1">
                {([['closedLunch', 'Midi'], ['closedDiner', 'Soir'], ['closedDay', 'Jour']] as const).map(([f, label]) => (
                  <label key={f} className="flex items-center gap-1.5 font-secondary cursor-pointer" style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
                    <input type="checkbox" checked={closed[i][f]} onChange={() => handleClosed(i, f)} style={{ accentColor: 'var(--pine)' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <p className="font-secondary text-sm mb-4" style={{
          color: message.includes('Erreur') ? 'var(--status-err-text)' : 'var(--status-ok-text)',
          backgroundColor: message.includes('Erreur') ? 'var(--status-err-bg)' : 'var(--status-ok-bg)',
          borderRadius: 8, padding: '8px 12px', display: 'inline-block',
        }}>
          {message}
        </p>
      )}

      <div className="mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-secondary cursor-pointer transition-all"
          style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 10, padding: '11px 24px', fontSize: '0.875rem', fontWeight: 600, border: 'none', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? '...' : 'Enregistrer les horaires'}
        </button>
      </div>
    </div>
  )
}
