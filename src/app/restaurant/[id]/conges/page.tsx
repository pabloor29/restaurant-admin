"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

type Period = { debut: string; fin: string }

const inputStyle = {
  backgroundColor: 'rgba(252,238,239,0.07)',
  border: '1px solid rgba(252,238,239,0.12)',
  color: 'var(--neutral)',
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
      <h2 className="font-secondary text-neutral mb-6" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        PÉRIODES DE CONGÉS
      </h2>

      <div className="space-y-3 mb-6">
        {periods.map((p, i) => (
          <div key={i} className="flex items-end gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-secondary text-xs" style={{ color: 'rgba(252,238,239,0.4)' }}>DÉBUT</label>
              <input
                type="date"
                value={p.debut}
                onChange={e => update(i, 'debut', e.target.value)}
                className="font-secondary text-sm rounded-lg px-3 py-2 outline-none"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-secondary text-xs" style={{ color: 'rgba(252,238,239,0.4)' }}>FIN</label>
              <input
                type="date"
                value={p.fin}
                onChange={e => update(i, 'fin', e.target.value)}
                className="font-secondary text-sm rounded-lg px-3 py-2 outline-none"
                style={inputStyle}
              />
            </div>
            <button
              onClick={() => remove(i)}
              className="font-secondary text-sm px-3 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70 flex-shrink-0"
              style={{ backgroundColor: 'rgba(220,50,50,0.15)', border: '1px solid rgba(220,50,50,0.3)', color: 'rgba(252,238,239,0.7)' }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={add}
          className="font-secondary text-sm py-2.5 px-5 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'rgba(252,238,239,0.08)', border: '1px solid rgba(252,238,239,0.15)', color: 'var(--neutral)' }}
        >
          + Ajouter une période
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="font-secondary text-sm py-2.5 px-5 rounded-lg cursor-pointer transition-opacity"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)', opacity: saving ? 0.5 : 1 }}
        >
          {saving ? '...' : 'Enregistrer les congés'}
        </button>
      </div>

      {message && (
        <p className="font-secondary text-sm mt-4" style={{ color: message.includes('Erreur') ? 'var(--primary)' : 'rgba(252,238,239,0.6)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
