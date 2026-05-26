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

const inputCls = "font-secondary text-sm rounded-lg px-4 py-3 outline-none w-full"
const inputStyle = { backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.12)', color: 'var(--neutral)' }

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

  if (loading) return <p className="font-secondary text-sm" style={{ color: 'rgba(252,238,239,0.4)' }}>Chargement...</p>

  return (
    <div>
      <h2 className="font-secondary text-neutral mb-6" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        FORMULES DE GROUPE
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulaire */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
            <p className="font-secondary text-xs mb-4" style={{ color: 'rgba(252,238,239,0.4)', letterSpacing: '0.1em' }}>
              {editingId ? 'MODIFIER LA FORMULE' : 'NOUVELLE FORMULE'}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required className={inputCls} style={inputStyle} />
              <input type="number" step="0.01" placeholder="Prix (€)" value={prix} onChange={e => setPrix(e.target.value)} required className={inputCls} style={inputStyle} />
              <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className={inputCls}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <textarea
                placeholder="Éléments (séparés par des virgules)"
                value={elements}
                onChange={e => setElements(e.target.value)}
                rows={3}
                className={inputCls}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <button type="submit" className="font-secondary text-sm py-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)' }}>
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingId && (
                <button type="button" onClick={reset} className="font-secondary text-sm py-2 rounded-lg cursor-pointer" style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.12)', color: 'rgba(252,238,239,0.6)' }}>
                  Annuler
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 space-y-3">
          {formules.length === 0 && (
            <p className="font-secondary text-sm" style={{ color: 'rgba(252,238,239,0.3)' }}>Aucune formule.</p>
          )}
          {formules.map(f => (
            <div key={f.id} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-secondary text-sm" style={{ color: 'var(--neutral)' }}>
                    {f.nom} — {f.prix}€
                    <span className="ml-2 text-xs" style={{ color: f.active ? 'rgba(50,200,100,0.8)' : 'rgba(252,238,239,0.3)' }}>
                      {f.active ? '● Actif' : '○ Inactif'}
                    </span>
                  </p>
                  {f.description && (
                    <p className="font-secondary text-xs mt-1" style={{ color: 'rgba(252,238,239,0.45)' }}>{f.description}</p>
                  )}
                </div>
              </div>
              {f.elements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {f.elements.map(el => (
                    <span key={el} className="font-secondary text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(252,238,239,0.08)', color: 'rgba(252,238,239,0.6)' }}>
                      {el}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => edit(f)} className="font-secondary text-xs py-1.5 px-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'rgba(252,238,239,0.08)', border: '1px solid rgba(252,238,239,0.12)', color: 'rgba(252,238,239,0.7)' }}>
                  Modifier
                </button>
                <button onClick={() => toggleActive(f.id, f.active)} className="font-secondary text-xs py-1.5 px-3 rounded-lg cursor-pointer" style={{ backgroundColor: f.active ? 'rgba(220,50,50,0.1)' : 'rgba(50,200,100,0.1)', border: `1px solid ${f.active ? 'rgba(220,50,50,0.3)' : 'rgba(50,200,100,0.3)'}`, color: 'rgba(252,238,239,0.7)' }}>
                  {f.active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => remove(f.id)} className="font-secondary text-xs py-1.5 px-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: 'rgba(252,238,239,0.7)' }}>
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
