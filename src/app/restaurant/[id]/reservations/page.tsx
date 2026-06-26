"use client"

import { use, useEffect, useState, useCallback } from 'react'
import { createClient } from '../../../../../lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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
  review_email_sent_at: string | null
}

type ChartDay = { label: string; reservations: number; couverts: number }

const STATUS_LABEL: Record<Status, string> = {
  pending: 'En attente', accepted: 'Acceptée', refused: 'Refusée',
  arrived: 'Arrivée', no_show: 'Absente',
}
const STATUS_COLOR: Record<Status, { text: string; bg: string }> = {
  pending:  { text: 'var(--status-warn-text)', bg: 'var(--status-warn-bg)' },
  accepted: { text: 'var(--status-ok-text)',   bg: 'var(--status-ok-bg)' },
  refused:  { text: 'var(--status-err-text)',  bg: 'var(--status-err-bg)' },
  arrived:  { text: 'var(--status-info-text)', bg: 'var(--status-info-bg)' },
  no_show:  { text: 'var(--muted)',            bg: 'var(--surface-alt)' },
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']

function toISO(d: Date) { return d.toISOString().split('T')[0] }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function fmtDate(d: Date) { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }
function isToday(d: Date) { return toISO(d) === toISO(new Date()) }

function getMondayOfWeek(d: Date) {
  const day = d.getDay()
  return addDays(d, day === 0 ? -6 : 1 - day)
}

const btn = (active?: boolean) => ({
  border: `1.5px solid ${active ? 'var(--pine)' : 'var(--border)'}`,
  borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--pine)' : 'var(--slate)',
  backgroundColor: active ? 'var(--pine-light)' : 'var(--surface)',
  cursor: 'pointer',
})

const inputStyle = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px',
  fontSize: '0.875rem', color: 'var(--ink)', backgroundColor: 'var(--surface)',
  outline: 'none', width: '100%',
}

export default function ReservationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)

  const [mode, setMode] = useState<Mode>('simple')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAdmin, setIsAdmin] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [reviewAuto, setReviewAuto] = useState(false)
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null)
  const [sendingReview, setSendingReview] = useState<string | null>(null)

  // Deux listes séparées
  const [pendingList, setPendingList]   = useState<Reservation[]>([])  // en attente (toutes dates)
  const [dayList,     setDayList]       = useState<Reservation[]>([])  // non-pending du jour (advanced)
  const [loadingPending, setLoadingPending] = useState(true)
  const [loadingDay,     setLoadingDay]     = useState(false)

  // Chart / stats (depuis reservation_history)
  const [chartView,   setChartView]   = useState<ChartView>('reservations')
  const [chartScale,  setChartScale]  = useState<ChartScale>('mois')
  const [chartOffset, setChartOffset] = useState(0)
  const [chartData,   setChartData]   = useState<ChartDay[]>([])
  const [totalRes,    setTotalRes]    = useState(0)
  const [totalCouverts, setTotalCouverts] = useState(0)

  // Popup confirmation (commentaire admin)
  const [confirmDialog, setConfirmDialog] = useState<{ r: Reservation; action: Status } | null>(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [submittingDialog, setSubmittingDialog] = useState(false)

  // Formulaire d'ajout
  const [showForm,  setShowForm]  = useState(false)
  const [form, setForm] = useState({ date: toISO(new Date()), name: '', email: '', phone: '', time_slot: '', covers: '2', notes: '' })
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')

  // Sync date du formulaire sur la navigation
  useEffect(() => { setForm(f => ({ ...f, date: toISO(currentDate) })) }, [currentDate])

  // ── Vérification admin ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('is_admin').eq('id', user.id).single()
        .then(({ data }) => { if (data?.is_admin) setIsAdmin(true) })
    })
  }, [])

  // ── Load mode ──
  useEffect(() => {
    supabase.from('restaurants').select('reservation_mode').eq('id', restaurantId).single()
      .then(({ data }) => { if (data?.reservation_mode) setMode(data.reservation_mode as Mode) })
  }, [restaurantId])

  // ── Load review settings (silencieux si colonnes absentes) ──
  useEffect(() => {
    supabase.from('restaurants')
      .select('review_email_auto, google_review_url')
      .eq('id', restaurantId).single()
      .then(({ data, error }) => {
        if (error) return
        setReviewAuto(!!data?.review_email_auto)
        setGoogleReviewUrl(data?.google_review_url ?? null)
      })
  }, [restaurantId])

  // ── Cleanup advanced : suppr réservations > 7j ──
  const cleanup = useCallback(async () => {
    await supabase.from('reservations').delete()
      .eq('restaurant_id', restaurantId)
      .lt('date', toISO(addDays(new Date(), -7)))
      .in('status', ['accepted', 'arrived', 'no_show', 'refused'])
  }, [restaurantId])

  // ── En attente (toutes dates) ──
  const loadPending = useCallback(async () => {
    setLoadingPending(true)
    const { data } = await supabase.from('reservations').select('*')
      .eq('restaurant_id', restaurantId).eq('status', 'pending')
      .order('created_at', { ascending: true })
    setPendingList((data ?? []) as Reservation[])
    setLoadingPending(false)
  }, [restaurantId])

  // ── Jour sélectionné (non-pending, advanced) ──
  const loadDay = useCallback(async () => {
    setLoadingDay(true)
    const { data } = await supabase.from('reservations').select('*')
      .eq('restaurant_id', restaurantId).eq('date', toISO(currentDate))
      .neq('status', 'pending').order('time_slot')
    setDayList((data ?? []) as Reservation[])
    setLoadingDay(false)
  }, [restaurantId, currentDate])

  // ── Chart depuis reservation_history ──
  const loadChart = useCallback(async () => {
    const today = new Date()
    let startDate: Date, endDate: Date

    if (chartScale === '7j') {
      const monday = getMondayOfWeek(today)
      startDate = addDays(monday, chartOffset * 7)
      endDate   = addDays(startDate, 6)
    } else if (chartScale === 'mois') {
      startDate = new Date(today.getFullYear(), today.getMonth() + chartOffset, 1)
      endDate   = new Date(today.getFullYear(), today.getMonth() + chartOffset + 1, 0)
    } else if (chartScale === '3mois') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 2 + chartOffset * 3, 1)
      endDate   = new Date(today.getFullYear(), today.getMonth() + 1 + chartOffset * 3, 0)
    } else {
      startDate = new Date(today.getFullYear() + chartOffset, 0, 1)
      endDate   = new Date(today.getFullYear() + chartOffset, 11, 31)
    }

    const { data } = await supabase.from('reservation_history').select('date, covers')
      .eq('restaurant_id', restaurantId)
      .gte('date', toISO(startDate))
      .lte('date', toISO(endDate))

    if (!data) return

    // Année → agréger par mois
    if (chartScale === 'annee') {
      const map = Array.from({ length: 12 }, () => ({ reservations: 0, couverts: 0 }))
      data.forEach(r => {
        const m = new Date(r.date + 'T00:00:00').getMonth()
        map[m].reservations += 1
        map[m].couverts += r.covers
      })
      setChartData(map.map((v, i) => ({ label: MONTHS_SHORT[i], ...v })))
      return
    }

    // Autres → par jour
    const map: Record<string, { reservations: number; couverts: number }> = {}
    const d = new Date(startDate)
    while (d <= endDate) {
      map[toISO(d)] = { reservations: 0, couverts: 0 }
      d.setDate(d.getDate() + 1)
    }
    data.forEach(r => {
      if (map[r.date]) { map[r.date].reservations += 1; map[r.date].couverts += r.covers }
    })
    setChartData(Object.entries(map).map(([date, v]) => ({
      label: new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      ...v,
    })))
  }, [restaurantId, chartScale, chartOffset])

  // ── Totaux depuis reservation_history ──
  const loadTotals = useCallback(async () => {
    const { data } = await supabase.from('reservation_history').select('covers').eq('restaurant_id', restaurantId)
    if (!data) return
    setTotalRes(data.length)
    setTotalCouverts(data.reduce((s, r) => s + r.covers, 0))
  }, [restaurantId])

  useEffect(() => { if (mode === 'advanced') cleanup() }, [mode, cleanup])
  useEffect(() => { loadPending() }, [loadPending])
  useEffect(() => { if (mode === 'advanced') loadDay() }, [mode, loadDay])
  useEffect(() => { loadChart() }, [loadChart])
  useEffect(() => { loadTotals() }, [loadTotals])

  // ── Action sur une réservation ──
  async function performAction(r: Reservation, action: Status, message = '') {
    // Logguer dans l'historique à l'acceptation
    if (action === 'accepted') {
      await supabase.from('reservation_history').insert({
        restaurant_id: restaurantId, date: r.date, covers: r.covers,
      })
    }

    // Envoyer le mail
    if (action === 'accepted' || action === 'refused') {
      await fetch('/api/reservations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: r.id, action, admin_message: message }),
      })
    }

    if (mode === 'simple') {
      await supabase.from('reservations').delete().eq('id', r.id)
    } else {
      await supabase.from('reservations').update({ status: action }).eq('id', r.id)
      loadDay()
    }
    loadPending()
    loadTotals()
    loadChart()
  }

  function handleAction(r: Reservation, action: Status) {
    const hasClientNote = !!(r.notes && r.notes.trim())
    // Refus → toujours popup ; Accept → popup uniquement si le client a écrit un commentaire
    if (action === 'refused' || (action === 'accepted' && hasClientNote)) {
      setAdminMessage('')
      setConfirmDialog({ r, action })
      return
    }
    // Autres transitions (arrived, no_show, accept sans note) → direct
    performAction(r, action)
  }

  async function submitDialog() {
    if (!confirmDialog) return
    setSubmittingDialog(true)
    await performAction(confirmDialog.r, confirmDialog.action, adminMessage.trim())
    setSubmittingDialog(false)
    setConfirmDialog(null)
    setAdminMessage('')
  }

  // ── Ajout manuel (advanced) ──
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveError('')
    const { error } = await supabase.from('reservations').insert({
      restaurant_id: restaurantId, date: form.date, time_slot: form.time_slot,
      covers: Number(form.covers), name: form.name, email: form.email || null,
      phone: form.phone || null, notes: form.notes || null, status: 'accepted',
    })
    if (error) { setSaveError(error.message); setSaving(false); return }

    // Logguer dans l'historique
    await supabase.from('reservation_history').insert({
      restaurant_id: restaurantId, date: form.date, covers: Number(form.covers),
    })

    if (form.date !== toISO(currentDate)) setCurrentDate(new Date(form.date + 'T00:00:00'))
    setForm(f => ({ ...f, name: '', email: '', phone: '', time_slot: '', covers: '2', notes: '' }))
    setShowForm(false); setSaving(false)
    loadDay(); loadTotals(); loadChart()
  }

  // ── Envoi manuel demande d'avis ──
  async function sendReview(r: Reservation) {
    if (sendingReview) return
    if (!r.email) { alert('Cette réservation n\'a pas d\'email client.'); return }
    if (!googleReviewUrl) { alert('Configurez d\'abord le lien Google avis dans Infos restaurant.'); return }
    setSendingReview(r.id)
    try {
      const res = await fetch('/api/reservations/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: r.id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(`Erreur : ${json.error ?? 'envoi impossible'}`)
        return
      }
      const update = (list: Reservation[]) =>
        list.map(x => x.id === r.id ? { ...x, review_email_sent_at: new Date().toISOString() } : x)
      setDayList(update)
      setPendingList(update)
    } finally {
      setSendingReview(null)
    }
  }

  // ── Réinitialisation stats (admin uniquement) ──
  async function handleReset() {
    if (!confirm('Réinitialiser toutes les statistiques de ce restaurant ? Cette action est irréversible.')) return
    setResetting(true)
    await supabase.from('reservation_history').delete().eq('restaurant_id', restaurantId)
    await loadTotals()
    await loadChart()
    setResetting(false)
  }

  // ── Label dynamique de la période affichée ──
  function getPeriodLabel(): string {
    const today = new Date()
    if (chartScale === '7j') {
      if (chartOffset === 0) return 'Cette semaine'
      const monday = getMondayOfWeek(today)
      const start = addDays(monday, chartOffset * 7)
      const end = addDays(start, 6)
      const sameMonth = start.getMonth() === end.getMonth()
      return sameMonth
        ? `${start.getDate()} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`
        : `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`
    }
    if (chartScale === 'mois') {
      const d = new Date(today.getFullYear(), today.getMonth() + chartOffset, 1)
      const suffix = d.getFullYear() !== today.getFullYear() ? ` ${d.getFullYear()}` : ''
      return MONTHS_FR[d.getMonth()] + suffix
    }
    if (chartScale === '3mois') {
      const start = new Date(today.getFullYear(), today.getMonth() - 2 + chartOffset * 3, 1)
      const end   = new Date(today.getFullYear(), today.getMonth() + chartOffset * 3, 1)
      const sameYear = start.getFullYear() === end.getFullYear()
      return sameYear
        ? `${MONTHS_SHORT[start.getMonth()]} – ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`
        : `${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()} – ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`
    }
    return String(today.getFullYear() + chartOffset)
  }

  const barSize = chartScale === 'annee' ? 28 : chartScale === '7j' ? 28 : chartScale === 'mois' ? 10 : 5
  const xInterval = chartScale === 'annee' ? 0 : chartScale === '7j' ? 0 : chartScale === 'mois' ? 4 : 9

  return (
    <div>
      {/* ── INDICATEUR EN ATTENTE ── */}
      {pendingList.length > 0 && (
        <div className="flex items-center gap-3 mb-6 rounded-xl px-5 py-4" style={{ backgroundColor: 'var(--status-warn-bg)', border: '1px solid rgba(185,125,43,0.25)' }}>
          <span className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-warn-text)', lineHeight: 1 }}>
            {pendingList.length}
          </span>
          <div>
            <p className="font-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--status-warn-text)' }}>
              demande{pendingList.length > 1 ? 's' : ''} en attente
            </p>
            <p className="font-secondary" style={{ fontSize: '0.78rem', color: 'var(--status-warn-text)', opacity: 0.7 }}>
              À traiter ci-dessous
            </p>
          </div>
        </div>
      )}

      {/* ── EN ATTENTE (les deux modes) ── */}
      <h2 className="font-secondary mb-4" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        DEMANDES EN ATTENTE
      </h2>
      {loadingPending ? (
        <p className="font-secondary mb-6" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : pendingList.length === 0 ? (
        <div className="rounded-xl p-6 text-center mb-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune demande en attente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {pendingList.map(r => <ReservationCard key={r.id} r={r} mode={mode} onAction={handleAction} showDate showReview={!reviewAuto && !!googleReviewUrl} onSendReview={sendReview} sendingReview={sendingReview === r.id} />)}
        </div>
      )}

      {/* ── PLANNING JOURNALIER (advanced seulement) ── */}
      {mode === 'advanced' && (
        <>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, marginBottom: 20 }}>
            <h2 className="font-secondary mb-4" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
              PLANNING
            </h2>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="font-secondary cursor-pointer" style={btn()}>←</button>
                <div style={{ minWidth: 220, textAlign: 'center' }}>
                  <p className="font-secondary capitalize" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
                    {fmtDate(currentDate)}
                  </p>
                </div>
                <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="font-secondary cursor-pointer" style={btn()}>→</button>
              </div>
              {!isToday(currentDate) && (
                <button onClick={() => setCurrentDate(new Date())} className="font-secondary cursor-pointer" style={btn()}>
                  Aujourd&apos;hui
                </button>
              )}
              <button
                onClick={() => setShowForm(v => !v)}
                className="font-secondary cursor-pointer"
                style={{ ...btn(), marginLeft: 'auto', backgroundColor: showForm ? 'var(--pine-light)' : 'var(--pine)', color: showForm ? 'var(--pine)' : 'var(--paper)', borderColor: 'var(--pine)', fontWeight: 600 }}
              >
                {showForm ? '✕ Annuler' : '+ Ajouter'}
              </button>
            </div>

            {/* Formulaire d'ajout */}
            {showForm && (
              <form onSubmit={handleAdd} className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>NOUVELLE RÉSERVATION</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {[
                    { label: 'DATE *',      type: 'date',   key: 'date',      placeholder: '' },
                    { label: 'HEURE *',     type: 'time',   key: 'time_slot', placeholder: '' },
                    { label: 'NOM *',       type: 'text',   key: 'name',      placeholder: 'Marie Dupont' },
                    { label: 'COUVERTS *',  type: 'number', key: 'covers',    placeholder: '2' },
                    { label: 'EMAIL',       type: 'email',  key: 'email',     placeholder: 'client@email.com' },
                    { label: 'TÉLÉPHONE',   type: 'tel',    key: 'phone',     placeholder: '06 00 00 00 00' },
                    { label: 'NOTES',       type: 'text',   key: 'notes',     placeholder: 'Allergie, chaise bébé…' },
                  ].map(({ label, type, key, placeholder }) => (
                    <div key={key}>
                      <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{label}</label>
                      <input
                        required={label.includes('*')}
                        type={type}
                        min={key === 'covers' ? 1 : undefined}
                        max={key === 'covers' ? 50 : undefined}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="font-secondary"
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
                {saveError && (
                  <p className="font-secondary mb-3" style={{ fontSize: '0.82rem', color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg)', borderRadius: 8, padding: '8px 12px' }}>
                    Erreur : {saveError}
                  </p>
                )}
                <button type="submit" disabled={saving} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                  {saving ? '…' : 'Enregistrer la réservation'}
                </button>
              </form>
            )}

            {loadingDay ? (
              <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement…</p>
            ) : dayList.length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune réservation confirmée ce jour.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {dayList.map(r => <ReservationCard key={r.id} r={r} mode={mode} onAction={handleAction} showReview={!reviewAuto && !!googleReviewUrl} onSendReview={sendReview} sendingReview={sendingReview === r.id} />)}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── STATISTIQUES ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginTop: mode === 'advanced' ? 0 : 8 }}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>STATISTIQUES</p>
          {isAdmin && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="font-secondary cursor-pointer"
              style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--status-err-text)',
                backgroundColor: 'var(--status-err-bg)',
                border: '1px solid rgba(168,71,58,0.25)',
                borderRadius: 8, padding: '5px 12px',
                opacity: resetting ? 0.6 : 1,
                cursor: resetting ? 'not-allowed' : 'pointer',
              }}
            >
              {resetting ? '…' : 'Réinitialiser'}
            </button>
          )}
        </div>

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

        {/* Toggles + navigation période */}
        <div className="flex gap-2 flex-wrap items-center mb-4">
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['7j', 'mois', '3mois', 'annee'] as ChartScale[]).map(s => (
              <button
                key={s}
                onClick={() => { setChartScale(s); setChartOffset(0) }}
                className="font-secondary cursor-pointer transition-all"
                style={{ ...btn(chartScale === s), border: 'none', borderRadius: 6, padding: '5px 12px' }}
              >
                {s === '7j' ? 'Semaine' : s === 'mois' ? 'Mois' : s === '3mois' ? '3 mois' : 'Année'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => setChartView('reservations')} className="font-secondary cursor-pointer" style={{ ...btn(chartView === 'reservations'), border: 'none', borderRadius: 6, padding: '5px 12px' }}>Réservations</button>
            <button onClick={() => setChartView('couverts')} className="font-secondary cursor-pointer" style={{ ...btn(chartView === 'couverts'), border: 'none', borderRadius: 6, padding: '5px 12px' }}>Couverts</button>
          </div>
        </div>

        {/* Navigation période */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setChartOffset(o => o - 1)}
            className="font-secondary cursor-pointer"
            style={{ ...btn(), padding: '5px 10px', flexShrink: 0 }}
          >
            ←
          </button>
          <p className="font-secondary capitalize" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', minWidth: 160, textAlign: 'center' }}>
            {getPeriodLabel()}
          </p>
          <button
            onClick={() => setChartOffset(o => o + 1)}
            className="font-secondary cursor-pointer"
            style={{ ...btn(), padding: '5px 10px', flexShrink: 0 }}
          >
            →
          </button>
          {chartOffset !== 0 && (
            <button
              onClick={() => setChartOffset(0)}
              className="font-secondary cursor-pointer"
              style={{ ...btn(), padding: '5px 10px', fontSize: '0.75rem' }}
            >
              Actuel
            </button>
          )}
        </div>

        {/* Graphique */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 16px 8px' }}>
          {chartData.length === 0 ? (
            <p className="font-secondary text-center py-8" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune donnée pour cette période.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={barSize} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-secondary)', fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={xInterval} />
                <YAxis tick={{ fontFamily: 'var(--font-secondary)', fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
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

      {/* ── POPUP CONFIRMATION ── */}
      {confirmDialog && (
        <div
          onClick={() => !submittingDialog && setConfirmDialog(null)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(22,32,27,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="rounded-2xl"
            style={{
              backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
              padding: 24, maxWidth: 480, width: '100%',
              boxShadow: '0 20px 60px rgba(22,32,27,0.25)',
            }}
          >
            <p className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 8 }}>
              {confirmDialog.action === 'accepted' ? 'ACCEPTER LA RÉSERVATION' : 'REFUSER LA RÉSERVATION'}
            </p>
            <p className="font-primary" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
              {confirmDialog.r.name} · {confirmDialog.r.time_slot} · {confirmDialog.r.covers} couvert{confirmDialog.r.covers > 1 ? 's' : ''}
            </p>

            {confirmDialog.r.notes && confirmDialog.r.notes.trim() && (
              <div className="rounded-xl mb-4" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '12px 14px' }}>
                <p className="font-secondary" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>
                  COMMENTAIRE DU CLIENT
                </p>
                <p className="font-accent" style={{ fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                  {confirmDialog.r.notes}
                </p>
              </div>
            )}

            <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              VOTRE RÉPONSE (OPTIONNELLE)
            </label>
            <textarea
              value={adminMessage}
              onChange={e => setAdminMessage(e.target.value)}
              placeholder={confirmDialog.action === 'accepted'
                ? 'Ex : nous vous installerons en terrasse, à bientôt.'
                : 'Ex : malheureusement nous sommes complets ce soir.'}
              rows={4}
              className="font-secondary"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90, marginBottom: 16 }}
            />

            <div className="flex gap-2 justify-end flex-wrap">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={submittingDialog}
                className="font-secondary cursor-pointer"
                style={{ ...btn(), padding: '8px 18px', opacity: submittingDialog ? 0.5 : 1 }}
              >
                Annuler
              </button>
              <button
                onClick={submitDialog}
                disabled={submittingDialog}
                className="font-secondary cursor-pointer"
                style={{
                  backgroundColor: confirmDialog.action === 'accepted' ? 'var(--status-ok-text)' : 'var(--status-err-text)',
                  color: 'var(--paper)', border: 'none', borderRadius: 8,
                  padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600,
                  opacity: submittingDialog ? 0.6 : 1,
                }}
              >
                {submittingDialog
                  ? '…'
                  : adminMessage.trim()
                    ? 'Envoyer'
                    : 'Envoyer sans commentaire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Carte réservation ──
function ReservationCard({ r, mode, onAction, showDate = false, showReview = false, onSendReview, sendingReview = false }: {
  r: Reservation
  mode: Mode
  onAction: (r: Reservation, action: Status) => void
  showDate?: boolean
  showReview?: boolean
  onSendReview?: (r: Reservation) => void
  sendingReview?: boolean
}) {
  const sc = STATUS_COLOR[r.status]
  const dateLabel = showDate
    ? new Date(r.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : null
  const sentLabel = new Date(r.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const reservationStart = new Date(`${r.date}T${r.time_slot}:00`)
  const isPast = reservationStart.getTime() < Date.now()
  const reviewable = showReview && mode === 'advanced' && !!r.email
    && (r.status === 'accepted' || r.status === 'arrived')
    && isPast

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${r.status === 'pending' ? 'var(--status-warn-text)' : r.status === 'accepted' ? 'var(--status-ok-text)' : r.status === 'arrived' ? 'var(--status-info-text)' : 'var(--border)'}` }}>
      <div className="flex items-start gap-3 mb-3 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-primary" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{r.name}</p>
            <span className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: sc.text, backgroundColor: sc.bg, padding: '2px 8px', borderRadius: 99 }}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <p className="font-secondary mt-1" style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>
            {dateLabel && <span className="capitalize">{dateLabel} · </span>}
            {r.time_slot} · {r.covers} couvert{r.covers > 1 ? 's' : ''}
            {r.phone && ` · ${r.phone}`}
            {r.email && ` · ${r.email}`}
          </p>
          {r.notes && <p className="font-accent mt-1" style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>{r.notes}</p>}
          {showDate && <p className="font-secondary mt-1" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Reçue le {sentLabel}</p>}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {r.status === 'pending' && (
          <>
            <button onClick={() => onAction(r, 'accepted')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-ok-bg)', border: '1px solid rgba(30,122,82,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-ok-text)' }}>
              ✓ Accepter
            </button>
            <button onClick={() => onAction(r, 'refused')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-err-bg)', border: '1px solid rgba(168,71,58,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-err-text)' }}>
              ✕ Refuser
            </button>
          </>
        )}
        {mode === 'advanced' && r.status === 'accepted' && (
          <>
            <button onClick={() => onAction(r, 'arrived')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-info-bg)', border: '1px solid rgba(58,107,143,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-info-text)' }}>
              Arrivée
            </button>
            <button onClick={() => onAction(r, 'no_show')} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Absent
            </button>
          </>
        )}
        {reviewable && (
          r.review_email_sent_at ? (
            <span className="font-secondary" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', color: 'var(--muted)' }}>
              ✓ Avis envoyé
            </span>
          ) : (
            <button
              onClick={() => onSendReview?.(r)}
              disabled={sendingReview}
              className="font-secondary cursor-pointer"
              style={{ backgroundColor: 'var(--pine-light)', border: '1px solid var(--pine)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--pine)', opacity: sendingReview ? 0.6 : 1 }}
            >
              {sendingReview ? '…' : '★ Demander un avis'}
            </button>
          )
        )}
      </div>
    </div>
  )
}
