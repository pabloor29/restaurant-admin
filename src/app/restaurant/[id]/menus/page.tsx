"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

const MENU_TYPES = ['brunch', 'diner', 'fiesta'] as const
type MenuType = typeof MENU_TYPES[number]

type MenuFile = { id: string; file_path: string }

export default function MenusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [files, setFiles] = useState<Record<MenuType, File[]>>({ brunch: [], diner: [], fiesta: [] })
  const [existing, setExisting] = useState<Record<MenuType, MenuFile[]>>({ brunch: [], diner: [], fiesta: [] })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('menu_files')
      .select('id, file_path, category')
      .eq('restaurant_id', restaurantId)
    if (data) {
      const grouped: Record<MenuType, MenuFile[]> = { brunch: [], diner: [], fiesta: [] }
      data.forEach((f: any) => { if (MENU_TYPES.includes(f.category)) grouped[f.category as MenuType].push(f) })
      setExisting(grouped)
    }
  }

  useEffect(() => { load() }, [restaurantId])

  const handleFileChange = (type: MenuType, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return
    setFiles(prev => ({ ...prev, [type]: Array.from(selected) }))
  }

  const upload = async () => {
    setUploading(true)
    setMessage('')
    for (const type of MENU_TYPES) {
      for (const file of files[type]) {
        const path = `${restaurantId}/${type}/${Date.now()}-${file.name}`
        const { error: uploadErr } = await supabase.storage.from('menus').upload(path, file)
        if (uploadErr) { setMessage('Erreur upload : ' + uploadErr.message); setUploading(false); return }
        const { error: dbErr } = await supabase.from('menu_files').insert({ restaurant_id: restaurantId, category: type, file_path: path })
        if (dbErr) { setMessage('Erreur DB : ' + dbErr.message); setUploading(false); return }
      }
    }
    setFiles({ brunch: [], diner: [], fiesta: [] })
    setMessage('Menus mis à jour !')
    setUploading(false)
    load()
  }

  const deleteFile = async (id: string, filePath: string, type: MenuType) => {
    await supabase.storage.from('menus').remove([filePath])
    await supabase.from('menu_files').delete().eq('id', id)
    setExisting(prev => ({ ...prev, [type]: prev[type].filter(f => f.id !== id) }))
  }

  const hasFiles = MENU_TYPES.some(t => files[t].length > 0)

  return (
    <div>
      <h2 className="font-secondary text-neutral mb-6" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        MISE À JOUR DES MENUS
      </h2>

      <div className="space-y-4 mb-6">
        {MENU_TYPES.map(type => (
          <div key={type} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
            <p className="font-secondary text-xs mb-4" style={{ color: 'rgba(252,238,239,0.5)', letterSpacing: '0.1em' }}>
              {type.toUpperCase()}
            </p>

            {/* Upload */}
            <div className="mb-4">
              <label
                className="font-secondary text-sm px-4 py-2 rounded-lg cursor-pointer inline-block"
                style={{ backgroundColor: 'rgba(252,238,239,0.08)', border: '1px solid rgba(252,238,239,0.15)', color: 'rgba(252,238,239,0.7)' }}
              >
                Choisir des fichiers
                <input type="file" multiple accept="image/*,application/pdf" onChange={e => handleFileChange(type, e)} className="hidden" />
              </label>
              {files[type].length > 0 && (
                <p className="font-secondary text-xs mt-2" style={{ color: 'rgba(252,238,239,0.4)' }}>
                  {files[type].length} fichier(s) sélectionné(s)
                </p>
              )}
            </div>

            {/* Existants */}
            {existing[type].length > 0 && (
              <div className="space-y-1.5">
                {existing[type].map(f => {
                  const { data } = supabase.storage.from('menus').getPublicUrl(f.file_path)
                  return (
                    <div key={f.id} className="flex items-center justify-between gap-3 py-1">
                      <a
                        href={data.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-secondary text-xs truncate hover:opacity-70 transition-opacity"
                        style={{ color: 'rgba(252,238,239,0.5)' }}
                      >
                        {f.file_path.split('/').pop()}
                      </a>
                      <button
                        onClick={() => deleteFile(f.id, f.file_path, type)}
                        className="font-secondary text-xs flex-shrink-0 cursor-pointer hover:opacity-70"
                        style={{ color: 'rgba(220,80,80,0.8)', background: 'none', border: 'none' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {message && (
        <p className="font-secondary text-sm mb-4" style={{ color: message.includes('Erreur') ? 'var(--primary)' : 'rgba(252,238,239,0.6)' }}>
          {message}
        </p>
      )}

      <button
        onClick={upload}
        disabled={uploading || !hasFiles}
        className="font-secondary text-sm py-3 px-6 rounded-lg cursor-pointer transition-opacity"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)', opacity: uploading || !hasFiles ? 0.4 : 1 }}
      >
        {uploading ? '...' : 'Enregistrer les menus'}
      </button>
    </div>
  )
}
