"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

export default function FermeturesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [closedDays, setClosedDays] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    supabase
      .from('closed_days')
      .select('days')
      .eq('restaurant_id', restaurantId)
      .single()
      .then(({ data }) => { if (data?.days) setClosedDays(data.days) })
  }, [restaurantId])

  const saveClosedDays = async (days: string[]) => {
    await supabase.from('closed_days').upsert(
      { restaurant_id: restaurantId, days, updated_at: new Date().toISOString() },
      { onConflict: 'restaurant_id' }
    )
  }

  const toggleDay = async (date: string) => {
    const updated = closedDays.includes(date) ? closedDays.filter(d => d !== date) : [...closedDays, date]
    setClosedDays(updated)
    await saveClosedDays(updated)
    setSelectedDate(null)
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
    return days
  }

  const fmt = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const fmtDisplay = (str: string) => {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const changeMonth = (offset: number) => {
    const n = new Date(currentMonth)
    n.setMonth(n.getMonth() + offset)
    setCurrentMonth(n)
  }

  const days = getDaysInMonth()
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const isDateClosed = selectedDate ? closedDays.includes(selectedDate) : false
  const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <div>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        JOURS DE FERMETURE
      </h2>

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-4" style={{ maxWidth: 380 }}>
        <button
          onClick={() => changeMonth(-1)}
          className="font-secondary cursor-pointer transition-all"
          style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: '0.875rem', color: 'var(--ink)' }}
        >
          ←
        </button>
        <p className="font-secondary capitalize" style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
        <button
          onClick={() => changeMonth(1)}
          className="font-secondary cursor-pointer transition-all"
          style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: '0.875rem', color: 'var(--ink)' }}
        >
          →
        </button>
      </div>

      {/* Calendrier */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', maxWidth: 380 }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center font-secondary py-1" style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500 }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((date, idx) => {
            if (!date) return <div key={`e-${idx}`} />
            const dateStr = fmt(date)
            const isClosed = closedDays.includes(dateStr)
            const isSelected = selectedDate === dateStr
            const isPast = date < today
            const isToday = date.toDateString() === today.toDateString()

            return (
              <button
                key={dateStr}
                onClick={() => !isPast && setSelectedDate(dateStr)}
                disabled={isPast}
                className="aspect-square rounded-lg flex items-center justify-center font-secondary transition-all"
                style={{
                  fontSize: '0.8rem',
                  backgroundColor: isClosed && !isPast ? 'var(--pine)' : isPast ? 'transparent' : isSelected ? 'var(--pine-light)' : 'var(--surface-alt)',
                  color: isClosed && !isPast ? 'var(--paper)' : isPast ? 'var(--muted)' : 'var(--ink)',
                  border: isSelected && !isClosed ? '2px solid var(--pine)' : isToday && !isPast ? '2px solid var(--border)' : '2px solid transparent',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  fontWeight: isToday ? 700 : 400,
                  opacity: isPast ? 0.35 : 1,
                }}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Action */}
      {selectedDate && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', maxWidth: 380 }}>
          <p className="font-secondary mb-4" style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>
            {fmtDisplay(selectedDate)}
          </p>
          <button
            onClick={() => toggleDay(selectedDate)}
            className="font-secondary cursor-pointer transition-all"
            style={{
              backgroundColor: isDateClosed ? 'var(--pine-light)' : 'var(--pine)',
              color: isDateClosed ? 'var(--pine)' : 'var(--paper)',
              border: isDateClosed ? '1.5px solid rgba(19,80,59,0.3)' : 'none',
              borderRadius: 10, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            {isDateClosed ? '✓ Réactiver les réservations' : 'Désactiver les réservations ce jour'}
          </button>
        </div>
      )}

      {/* Légende */}
      <div className="flex flex-wrap gap-4">
        {[
          { color: 'var(--pine)', label: 'Réservations désactivées' },
          { color: 'var(--surface-alt)', label: 'Disponible' },
          { color: 'transparent', label: 'Jour passé', border: '1px solid var(--border)' },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-2">
            <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color, border: border ?? '1px solid var(--border)' }} />
            <span className="font-secondary" style={{ fontSize: '0.78rem', color: 'var(--slate)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
