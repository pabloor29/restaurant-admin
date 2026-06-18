"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

type Period = { debut: string; fin: string }

const inputStyle = {
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
  outline: 'none',
}

export default function CongesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [periods, setPeriods] = useState<Period[]>([{ debut: '', fin: '' }])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('holidays')
      .select('periods')
      .eq('restaurant_id', restaurantId)
      .single()
      .then(({ data }) => { if (data?.periods?.length) setPeriods(data.periods) })
  }, [restaurantId])

  const update = (i: number, field: keyof Period, val: string) => {
    const u = [...periods]; u[i][field] = val; setPeriods(u)
  }

  const add = () => setPeriods([...periods, { debut: '', fin: '' }])

  const remove = (i: number) => setPeriods(periods.filter((_, idx) => idx !== i))

  const save = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('holidays')
      .upsert({ restaurant_id: restaurantId, periods, updated_at: new Date().toISOString() }, { onConflict: 'restaurant_id' })
    setMessage(error ? 'Erreur lors de l\'enregistrement.' : 'Congés enregistrés !')
    setSaving(false)
  }

  return (
    <div>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        PÉRIODES DE CONGÉS
      </h2>

      <div className="space-y-3 mb-6" style={{ maxWidth: 560 }}>
        {periods.map((p, i) => (
          <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em' }}>DÉBUT</label>
              <input type="date" value={p.debut} onChange={e => update(i, 'debut', e.target.value)} className="font-secondary" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em' }}>FIN</label>
              <input type="date" value={p.fin} onChange={e => update(i, 'fin', e.target.value)} className="font-secondary" style={inputStyle} />
            </div>
            <button
              onClick={() => remove(i)}
              className="font-secondary cursor-pointer transition-all flex-shrink-0"
              style={{ backgroundColor: 'var(--status-err-bg)', border: '1px solid rgba(168,71,58,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: 'var(--status-err-text)', fontWeight: 500 }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={add}
          className="font-secondary cursor-pointer transition-all"
          style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}
        >
          + Ajouter une période
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="font-secondary cursor-pointer transition-all"
          style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 10, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 600, border: 'none', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? '...' : 'Enregistrer les congés'}
        </button>
      </div>

      {message && (
        <p className="font-secondary mt-4" style={{
          fontSize: '0.875rem',
          color: message.includes('Erreur') ? 'var(--status-err-text)' : 'var(--status-ok-text)',
          backgroundColor: message.includes('Erreur') ? 'var(--status-err-bg)' : 'var(--status-ok-bg)',
          borderRadius: 8, padding: '8px 12px', display: 'inline-block',
        }}>
          {message}
        </p>
      )}
    </div>
  )
}
