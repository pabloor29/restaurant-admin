"use client"

import { use, useEffect, useState, useCallback } from 'react'
import { createClient } from '../../../../../lib/supabase/client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const supabase = createClient()

type Mode = 'simple' | 'advanced'
type Status = 'pending' | 'accepted' | 'refused' | 'arrived' | 'no_show'
type ChartView = 'reservations' | 'couverts'
type ChartScale = '7j' | 'mois' | '3mois' | 'annee'

type Reservation = {
  id: string
  date: string
  time_slot: string
  covers: number
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  status: Status
  created_at: string
}

type ChartDay = { label: string; reservations: number; couverts: number }

const STATUS_LABEL: Record<Status, string> = {
  pending:  'En attente',
  accepted: 'Acceptée',
  refused:  'Refusée',
  arrived:  'Arrivée',
  no_show:  'Absente',
}
const STATUS_COLOR: Record<Status, { text: string; bg: string }> = {
  pending:  { text: 'var(--status-warn-text)', bg: 'var(--status-warn-bg)' },
  accepted: { text: 'var(--status-ok-text)',   bg: 'var(--status-ok-bg)' },
  refused:  { text: 'var(--status-err-text)',  bg: 'var(--status-err-bg)' },
  arrived:  { text: 'var(--status-info-text)', bg: 'var(--status-info-bg)' },
  no_show:  { text: 'var(--muted)',            bg: 'var(--surface-alt)' },
}

const SCALE_LABELS: Record<ChartScale, string> = {
  '7j': '7 jours', mois: 'Ce mois', '3mois': '3 mois', annee: 'Cette année',
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function isToday(d: Date) {
  return toISO(d) === toISO(new Date())
}

const btnStyle = (active?: boolean) => ({
  border: `1.5px solid ${active ? 'var(--pine)' : 'var(--border)'}`,
  borderRadius: 8,
  padding: '6px 14px',
  fontSize: '0.8rem',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--pine)' : 'var(--slate)',
  backgroundColor: active ? 'var(--pine-light)' : 'var(--surface)',
  cursor: 'pointer',
})

const inputStyle = {
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
  outline: 'none',
  width: '100%',
}

export default function ReservationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)

  const [mode, setMode] = useState<Mode>('simple')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  // Chart
  const [chartView, setChartView] = useState<ChartView>('reservations')
  const [chartScale, setChartScale] = useState<ChartScale>('mois')
  const [chartData, setChartData] = useState<ChartDay[]>([])
  const [totalRes, setTotalRes] = useState(0)
  const [totalCouverts, setTotalCouverts] = useState(0)

  // Add form (mode advanced)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: toISO(new Date()), name: '', email: '', phone: '', time_slot: '', covers: '2', notes: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Sync form date when navigating days
  useEffect(() => {
    setForm(f => ({ ...f, date: toISO(currentDate) }))
  }, [currentDate])

  // ── Load mode ──
  useEffect(() => {
    supabase.from('restaurants').select('reservation_mode').eq('id', restaurantId).single()
      .then(({ data }) => { if (data?.reservation_mode) setMode(data.reservation_mode as Mode) })
  }, [restaurantId])

  // ── Cleanup mode 2: delete reservations older than 7 days ──
  const cleanup = useCallback(async () => {
    const cutoff = toISO(addDays(new Date(), -7))
    await supabase.from('reservations')
      .delete()
      .eq('restaurant_id', restaurantId)
      .lt('date', cutoff)
      .in('status', ['accepted', 'arrived', 'no_show', 'refused'])
  }, [restaurantId])

  // ── Load day reservations ──
  const loadDay = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('date', toISO(currentDate))
      .order('time_slot')
    setReservations((data ?? []) as Reservation[])
    setLoading(false)
  }, [restaurantId, currentDate])

  // ── Load chart data ──
  const loadChart = useCallback(async () => {
    const today = new Date()
    let startDate: Date

    if (chartScale === '7j')    startDate = addDays(today, -6)
    else if (chartScale === 'mois')  startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    else if (chartScale === '3mois') startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    else                        startDate = new Date(today.getFullYear(), 0, 1)

    const { data } = await supabase
      .from('reservations')
      .select('date, covers, status')
      .eq('restaurant_id', restaurantId)
      .gte('date', toISO(startDate))
      .lte('date', toISO(today))
      .neq('status', 'refused')

    if (!data) return

    // Group by date
    const map: Record<string, { reservations: number; couverts: number }> = {}
    const d = new Date(startDate)
    while (d <= today) {
      map[toISO(d)] = { reservations: 0, couverts: 0 }
      d.setDate(d.getDate() + 1)
    }
    data.forEach(r => {
      if (!map[r.date]) map[r.date] = { reservations: 0, couverts: 0 }
      map[r.date].reservations += 1
      map[r.date].couverts += r.covers
    })

    const days = Object.entries(map).map(([date, v]) => {
      const d = new Date(date + 'T00:00:00')
      let label: string
      if (chartScale === '7j' || chartScale === 'mois') {
        label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      } else {
        label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      }
      return { label, ...v }
    })

    setChartData(days)
  }, [restaurantId, chartScale])

  // ── Load total counters ──
  const loadTotals = useCallback(async () => {
    const { data } = await supabase
      .from('reservations')
      .select('covers')
      .eq('restaurant_id', restaurantId)
      .neq('status', 'refused')
    if (!data) return
    setTotalRes(data.length)
    setTotalCouverts(data.reduce((s, r) => s + r.covers, 0))
  }, [restaurantId])

  useEffect(() => {
    if (mode === 'advanced') cleanup()
  }, [mode, cleanup])

  useEffect(() => { loadDay() }, [loadDay])
  useEffect(() => { loadChart() }, [loadChart])
  useEffect(() => { loadTotals() }, [loadTotals])

  // ── Actions ──
  async function handleAction(id: string, action: Status) {
    if (mode === 'simple') {
      // Simple: accept or refuse → delete immediately
      await supabase.from('reservations').delete().eq('id', id)
    } else {
      // Advanced: update status
      await supabase.from('reservations').update({ status: action }).eq('id', id)
    }
    loadDay()
    loadTotals()
    loadChart()
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const { error } = await supabase.from('reservations').insert({
      restaurant_id: restaurantId,
      date: form.date,
      time_slot: form.time_slot,
      covers: Number(form.covers),
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
      status: 'accepted',
    })
    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }
    // Navigate to the selected date if different from current
    if (form.date !== toISO(currentDate)) {
      setCurrentDate(new Date(form.date + 'T00:00:00'))
    }
    setForm(f => ({ ...f, name: '', email: '', phone: '', time_slot: '', covers: '2', notes: '' }))
    setShowForm(false)
    setSaving(false)
    loadDay()
    loadTotals()
    loadChart()
  }

  const pending = reservations.filter(r => r.status === 'pending')
  const others  = reservations.filter(r => r.status !== 'pending')

  return (
    <div>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        RÉSERVATIONS
      </h2>

      {/* ── DATE NAV ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="font-secondary cursor-pointer" style={btnStyle()}>←</button>
          <div style={{ minWidth: 220, textAlign: 'center' }}>
            <p className="font-secondary" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize' }}>
              {fmtDate(currentDate)}
            </p>
          </div>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="font-secondary cursor-pointer" style={btnStyle()}>→</button>
        </div>
        {!isToday(currentDate) && (
          <button onClick={() => setCurrentDate(new Date())} className="font-secondary cursor-pointer" style={btnStyle()}>
            Aujourd&apos;hui
          </button>
        )}
        {mode === 'advanced' && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="font-secondary cursor-pointer"
            style={{ ...btnStyle(), marginLeft: 'auto', backgroundColor: showForm ? 'var(--pine-light)' : 'var(--pine)', color: showForm ? 'var(--pine)' : 'var(--paper)', borderColor: 'var(--pine)', fontWeight: 600 }}
          >
            {showForm ? '✕ Annuler' : '+ Ajouter'}
          </button>
        )}
      </div>

      {/* ── ADD FORM (mode advanced) ── */}
      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>NOUVELLE RÉSERVATION</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>DATE *</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="font-secondary" style={inputStyle} />
            </div>
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>HEURE *</label>
              <input required type="time" value={form.time_slot} onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))} className="font-secondary" style={inputStyle} />
            </div>
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>NOM *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Marie Dupont" className="font-secondary" style={inputStyle} />
            </div>
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>COUVERTS *</label>
              <input required type="number" min={1} max={50} value={form.covers} onChange={e => setForm(f => ({ ...f, covers: e.target.value }))} className="font-secondary" style={inputStyle} />
            </div>
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>EMAIL</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="client@email.com" className="font-secondary" style={inputStyle} />
            </div>
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>TÉLÉPHONE</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="06 00 00 00 00" className="font-secondary" style={inputStyle} />
            </div>
            <div>
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>NOTES</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Allergie, chaise bébé…" className="font-secondary" style={inputStyle} />
            </div>
          </div>
          {saveError && (
            <p className="font-secondary mb-3" style={{ fontSize: '0.82rem', color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg)', borderRadius: 8, padding: '8px 12px' }}>
              Erreur : {saveError}
            </p>
          )}
          <button type="submit" disabled={saving} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? '...' : 'Enregistrer la réservation'}
          </button>
        </form>
      )}

      {/* ── RESERVATIONS LIST ── */}
      {loading ? (
        <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 32 }}>Chargement…</p>
      ) : reservations.length === 0 ? (
        <div className="rounded-xl p-8 text-center mb-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Aucune réservation ce jour.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {/* En attente en premier */}
          {pending.map(r => <ReservationCard key={r.id} r={r} mode={mode} onAction={handleAction} />)}
          {others.map(r => <ReservationCard key={r.id} r={r} mode={mode} onAction={handleAction} />)}
        </div>
      )}

      {/* ── STATISTIQUES ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
        <p className="font-secondary mb-5" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>STATISTIQUES</p>

        {/* Compteurs */}
        <div className="flex gap-4 flex-wrap mb-6">
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 24px' }}>
            <p className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 4 }}>TOTAL RÉSERVATIONS</p>
            <p className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--pine)', letterSpacing: '-0.03em', lineHeight: 1 }}>{totalRes}</p>
          </div>
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 24px' }}>
            <p className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 4 }}>TOTAL COUVERTS</p>
            <p className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber)', letterSpacing: '-0.03em', lineHeight: 1 }}>{totalCouverts}</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-2 flex-wrap mb-4">
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['7j', 'mois', '3mois', 'annee'] as ChartScale[]).map(s => (
              <button key={s} onClick={() => setChartScale(s)} className="font-secondary cursor-pointer transition-all" style={{ ...btnStyle(chartScale === s), border: 'none', borderRadius: 6, padding: '5px 12px' }}>
                {SCALE_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => setChartView('reservations')} className="font-secondary cursor-pointer" style={{ ...btnStyle(chartView === 'reservations'), border: 'none', borderRadius: 6, padding: '5px 12px' }}>Réservations</button>
            <button onClick={() => setChartView('couverts')} className="font-secondary cursor-pointer" style={{ ...btnStyle(chartView === 'couverts'), border: 'none', borderRadius: 6, padding: '5px 12px' }}>Couverts</button>
          </div>
        </div>

        {/* Chart */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 16px 8px' }}>
          {chartData.length === 0 ? (
            <p className="font-secondary text-center py-8" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune donnée pour cette période.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={chartScale === 'annee' ? 6 : chartScale === '3mois' ? 8 : 14} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: 'var(--font-secondary)', fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={chartScale === 'annee' ? 14 : chartScale === '3mois' ? 6 : 'preserveStartEnd'}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--font-secondary)', fontSize: 10, fill: 'var(--muted)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontFamily: 'var(--font-secondary)', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--surface)', color: 'var(--ink)' }}
                  cursor={{ fill: 'var(--pine-light)' }}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  formatter={(v: any) => [`${v}`, chartView === 'couverts' ? 'Couverts' : 'Réservations']}
                />
                <Bar dataKey={chartView} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={chartView === 'couverts' ? '#C77E3A' : '#13503B'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reservation Card ──
function ReservationCard({
  r,
  mode,
  onAction,
}: {
  r: Reservation
  mode: Mode
  onAction: (id: string, action: Status) => void
}) {
  const sc = STATUS_COLOR[r.status]

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--surface)', border: `1px solid ${r.status === 'pending' ? 'var(--status-warn-text)' : 'var(--border)'}`, borderLeftWidth: 3, borderLeftColor: r.status === 'pending' ? 'var(--status-warn-text)' : r.status === 'accepted' ? 'var(--status-ok-text)' : r.status === 'arrived' ? 'var(--status-info-text)' : 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-primary" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{r.name}</p>
            <span className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: sc.text, backgroundColor: sc.bg, padding: '2px 8px', borderRadius: 99 }}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--slate)', marginTop: 2 }}>
            {r.time_slot} · {r.covers} couvert{r.covers > 1 ? 's' : ''}
            {r.phone && ` · ${r.phone}`}
            {r.email && ` · ${r.email}`}
          </p>
          {r.notes && (
            <p className="font-accent mt-1" style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>{r.notes}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {r.status === 'pending' && (
          <>
            <button onClick={() => onAction(r.id, 'accepted')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-ok-bg)', border: '1px solid rgba(30,122,82,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-ok-text)' }}>
              ✓ Accepter
            </button>
            <button onClick={() => onAction(r.id, 'refused')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-err-bg)', border: '1px solid rgba(168,71,58,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-err-text)' }}>
              ✕ Refuser
            </button>
          </>
        )}
        {mode === 'advanced' && r.status === 'accepted' && (
          <>
            <button onClick={() => onAction(r.id, 'arrived')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-info-bg)', border: '1px solid rgba(58,107,143,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-info-text)' }}>
              Arrivée
            </button>
            <button onClick={() => onAction(r.id, 'no_show')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Absent
            </button>
          </>
        )}
      </div>
    </div>
  )
}
