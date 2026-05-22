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
      <h2 className="font-secondary text-neutral mb-6" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        JOURS DE FERMETURE
      </h2>

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="font-secondary text-sm px-4 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.12)', color: 'var(--neutral)' }}
        >
          ←
        </button>
        <p className="font-secondary text-sm" style={{ color: 'var(--neutral)' }}>
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
        <button
          onClick={() => changeMonth(1)}
          className="font-secondary text-sm px-4 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.12)', color: 'var(--neutral)' }}
        >
          →
        </button>
      </div>

      {/* Calendrier */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(252,238,239,0.03)', border: '1px solid rgba(252,238,239,0.1)' }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center font-secondary text-xs py-1" style={{ color: 'rgba(252,238,239,0.35)' }}>{d}</div>
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
                className="aspect-square rounded-lg flex items-center justify-center font-secondary text-sm transition-all"
                style={{
                  backgroundColor: isClosed && !isPast ? 'var(--primary)' : isPast ? 'rgba(252,238,239,0.03)' : 'rgba(252,238,239,0.07)',
                  color: isClosed && !isPast ? 'var(--neutral)' : isPast ? 'rgba(252,238,239,0.2)' : 'var(--neutral)',
                  border: isSelected ? '2px solid var(--neutral)' : isToday && !isPast ? '2px solid rgba(252,238,239,0.4)' : '2px solid transparent',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  fontWeight: isToday ? 700 : 400,
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
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
          <p className="font-secondary text-sm mb-4" style={{ color: 'rgba(252,238,239,0.7)' }}>
            {fmtDisplay(selectedDate)}
          </p>
          <button
            onClick={() => toggleDay(selectedDate)}
            className="font-secondary text-sm py-2.5 px-5 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
            style={{ backgroundColor: isDateClosed ? 'rgba(50,180,100,0.2)' : 'var(--primary)', color: 'var(--neutral)', border: isDateClosed ? '1px solid rgba(50,180,100,0.4)' : 'none' }}
          >
            {isDateClosed ? '✓ Réactiver les réservations' : 'Marquer complet ce jour'}
          </button>
        </div>
      )}

      {/* Légende */}
      <div className="flex gap-5">
        {[
          { color: 'var(--primary)', label: 'Restaurant complet' },
          { color: 'rgba(252,238,239,0.07)', label: 'Disponible' },
          { color: 'rgba(252,238,239,0.03)', label: 'Jour passé' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color, border: '1px solid rgba(252,238,239,0.15)' }} />
            <span className="font-secondary text-xs" style={{ color: 'rgba(252,238,239,0.4)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
