"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

type Formule = {
  id: string
  nom: string
  prix: number
  description: string | null
  elements: string[]
  active: boolean
  created_at: string
}

const inputCls = "font-secondary outline-none w-full"
const inputStyle = { border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.875rem', color: 'var(--ink)', backgroundColor: 'var(--surface)' }

export default function FormulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [formules, setFormules] = useState<Formule[]>([])
  const [loading, setLoading] = useState(true)
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [description, setDescription] = useState('')
  const [elements, setElements] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase
      .from('formules')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    if (data) setFormules(data as Formule[])
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [restaurantId])

  const reset = () => { setNom(''); setPrix(''); setDescription(''); setElements(''); setEditingId(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      nom,
      prix: Number(prix),
      description: description || null,
      elements: elements.split(',').map(el => el.trim()).filter(Boolean),
    }
    if (editingId) {
      await supabase.from('formules').update(payload).eq('id', editingId)
    } else {
      await supabase.from('formules').insert({ ...payload, restaurant_id: restaurantId })
    }
    reset()
    load()
  }

  const edit = (f: Formule) => {
    setEditingId(f.id)
    setNom(f.nom)
    setPrix(String(f.prix))
    setDescription(f.description ?? '')
    setElements(f.elements.join(', '))
  }

  const remove = async (id: string) => {
    await supabase.from('formules').delete().eq('id', id)
    load()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('formules').update({ active: !active }).eq('id', id)
    load()
  }

  if (loading) return <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement...</p>

  return (
    <div>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        FORMULES DE GROUPE
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulaire */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.1em', fontWeight: 600 }}>
              {editingId ? 'MODIFIER LA FORMULE' : 'NOUVELLE FORMULE'}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required className={inputCls} style={inputStyle} />
              <input type="number" step="0.01" placeholder="Prix (€)" value={prix} onChange={e => setPrix(e.target.value)} required className={inputCls} style={inputStyle} />
              <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
              <textarea placeholder="Éléments (séparés par des virgules)" value={elements} onChange={e => setElements(e.target.value)} rows={3} className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
              <button type="submit" className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 10, padding: '11px', fontSize: '0.875rem', fontWeight: 600, border: 'none' }}>
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingId && (
                <button type="button" onClick={reset} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--surface-alt)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '9px', fontSize: '0.875rem', color: 'var(--slate)' }}>
                  Annuler
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 space-y-3">
          {formules.length === 0 && (
            <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune formule.</p>
          )}
          {formules.map(f => (
            <div key={f.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>
                    {f.nom} — {f.prix}€
                    <span
                      className="ml-2 font-secondary"
                      style={{ fontSize: '0.72rem', fontWeight: 600, color: f.active ? 'var(--status-ok-text)' : 'var(--muted)', backgroundColor: f.active ? 'var(--status-ok-bg)' : 'var(--surface-alt)', padding: '2px 7px', borderRadius: 99 }}
                    >
                      {f.active ? 'Actif' : 'Inactif'}
                    </span>
                  </p>
                  {f.description && (
                    <p className="font-secondary mt-1" style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>{f.description}</p>
                  )}
                </div>
              </div>
              {f.elements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {f.elements.map(el => (
                    <span key={el} className="font-secondary" style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 99, backgroundColor: 'var(--pine-light)', color: 'var(--pine)', fontWeight: 500 }}>
                      {el}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => edit(f)} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', color: 'var(--ink)' }}>
                  Modifier
                </button>
                <button onClick={() => toggleActive(f.id, f.active)} className="font-secondary cursor-pointer" style={{ backgroundColor: f.active ? 'var(--status-err-bg)' : 'var(--status-ok-bg)', border: `1px solid ${f.active ? 'rgba(168,71,58,0.2)' : 'rgba(30,122,82,0.2)'}`, borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', color: f.active ? 'var(--status-err-text)' : 'var(--status-ok-text)', fontWeight: 500 }}>
                  {f.active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => remove(f.id)} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--status-err-bg)', border: '1px solid rgba(168,71,58,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', color: 'var(--status-err-text)' }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
