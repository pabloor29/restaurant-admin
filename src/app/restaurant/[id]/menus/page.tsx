"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'
import { convertToWebP } from '../../../../../lib/convertToWebP'

const supabase = createClient()

type Category = { id: string; name: string; position: number }
type MenuFile = { id: string; file_path: string; category_id: string; position: number }

const btnSecondary = {
  backgroundColor: 'rgba(252,238,239,0.07)',
  border: '1px solid rgba(252,238,239,0.12)',
  color: 'rgba(252,238,239,0.7)',
}

const inputStyle = {
  backgroundColor: 'rgba(252,238,239,0.07)',
  border: '1px solid rgba(252,238,239,0.12)',
  color: 'var(--neutral)',
}

export default function MenusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFiles, setCategoryFiles] = useState<Record<string, MenuFile[]>>({})
  const [newFiles, setNewFiles] = useState<Record<string, File[]>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('is_admin').eq('id', user.id).single()
          .then(({ data }) => setIsAdmin(!!data?.is_admin))
      }
    })
    load()
  }, [restaurantId])

  const load = async () => {
    const [{ data: cats }, { data: files }] = await Promise.all([
      supabase.from('menu_categories').select('id, name, position').eq('restaurant_id', restaurantId).order('position'),
      supabase.from('menu_files').select('id, file_path, category_id, position').eq('restaurant_id', restaurantId).order('position'),
    ])
    if (cats) setCategories(cats)
    if (files) {
      const grouped: Record<string, MenuFile[]> = {}
      files.forEach(f => {
        if (!grouped[f.category_id]) grouped[f.category_id] = []
        grouped[f.category_id].push(f)
      })
      setCategoryFiles(grouped)
    }
  }

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setCreating(true)
    const maxPos = categories.length > 0 ? Math.max(...categories.map(c => c.position)) + 1 : 0
    await supabase.from('menu_categories').insert({
      restaurant_id: restaurantId,
      name: newCatName.trim(),
      position: maxPos,
    })
    setNewCatName('')
    setCreating(false)
    load()
  }

  const deleteCategory = async (cat: Category) => {
    const files = categoryFiles[cat.id] || []
    if (files.length > 0) {
      await supabase.storage.from('menus').remove(files.map(f => f.file_path))
    }
    await supabase.from('menu_categories').delete().eq('id', cat.id)
    load()
  }

  const handleFileChange = (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setNewFiles(prev => ({ ...prev, [catId]: Array.from(e.target.files!) }))
  }

  const uploadForCategory = async (catId: string) => {
    const filesToUpload = newFiles[catId] || []
    if (!filesToUpload.length) return
    setUploading(catId)
    setMessage('')

    // Conversion en WebP (PDF → 1 fichier par page)
    const converted: File[] = []
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const isPdf = file.type === 'application/pdf'
      setStatus(isPdf
        ? `Conversion PDF ${i + 1}/${filesToUpload.length}...`
        : `Conversion image ${i + 1}/${filesToUpload.length}...`
      )
      try {
        const webpFiles = await convertToWebP(file, (page, total) => {
          setStatus(`Conversion PDF ${i + 1}/${filesToUpload.length} — page ${page}/${total}...`)
        })
        converted.push(...webpFiles)
      } catch (err) {
        setMessage(`Erreur de conversion : ${err instanceof Error ? err.message : err}`)
        setStatus('')
        setUploading(null)
        return
      }
    }

    // Upload des fichiers convertis
    const existingCount = categoryFiles[catId]?.length || 0
    for (let i = 0; i < converted.length; i++) {
      const file = converted[i]
      setStatus(`Upload ${i + 1}/${converted.length}...`)
      const path = `${restaurantId}/${catId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('menus').upload(path, file)
      if (upErr) { setMessage('Erreur upload : ' + upErr.message); setStatus(''); setUploading(null); return }
      const { error: dbErr } = await supabase.from('menu_files').insert({
        restaurant_id: restaurantId,
        category_id: catId,
        file_path: path,
        position: existingCount + i,
      })
      if (dbErr) { setMessage('Erreur DB : ' + dbErr.message); setStatus(''); setUploading(null); return }
    }

    setNewFiles(prev => ({ ...prev, [catId]: [] }))
    setStatus('')
    setMessage(`${converted.length} fichier${converted.length > 1 ? 's' : ''} enregistré${converted.length > 1 ? 's' : ''}.`)
    setUploading(null)
    load()
  }

  const updatePositions = async (files: MenuFile[]) => {
    await Promise.all(files.map((f, i) => supabase.from('menu_files').update({ position: i }).eq('id', f.id)))
  }

  const move = async (catId: string, index: number, dir: 'up' | 'down') => {
    const files = [...(categoryFiles[catId] || [])]
    const target = dir === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= files.length) return
    ;[files[index], files[target]] = [files[target], files[index]]
    setCategoryFiles(prev => ({ ...prev, [catId]: files }))
    await updatePositions(files)
  }

  const deleteFile = async (file: MenuFile) => {
    await supabase.storage.from('menus').remove([file.file_path])
    await supabase.from('menu_files').delete().eq('id', file.id)
    const remaining = (categoryFiles[file.category_id] || []).filter(f => f.id !== file.id)
    setCategoryFiles(prev => ({ ...prev, [file.category_id]: remaining }))
    await updatePositions(remaining)
  }

  return (
    <div>
      <h2 className="font-secondary text-neutral mb-6" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        MENUS
      </h2>

      {/* Créer une catégorie — admin seulement */}
      {isAdmin && (
        <form onSubmit={createCategory} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Nom de la nouvelle catégorie"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            required
            className="font-secondary text-sm rounded-lg px-4 py-2.5 outline-none flex-1"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={creating}
            className="font-secondary text-sm py-2.5 px-5 rounded-lg cursor-pointer transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)', opacity: creating ? 0.5 : 1 }}
          >
            {creating ? '...' : '+ Créer la catégorie'}
          </button>
        </form>
      )}

      {/* Liste des catégories */}
      {categories.length === 0 ? (
        <p className="font-secondary text-sm" style={{ color: 'rgba(252,238,239,0.3)' }}>
          {isAdmin ? 'Aucune catégorie. Créez-en une ci-dessus.' : 'Aucune catégorie disponible.'}
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => {
            const files = categoryFiles[cat.id] || []
            const pending = newFiles[cat.id] || []

            return (
              <div key={cat.id} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <p className="font-secondary text-sm" style={{ color: 'var(--neutral)' }}>
                    {cat.name}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => deleteCategory(cat)}
                      className="font-secondary text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
                      style={{ backgroundColor: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(252,238,239,0.5)' }}
                    >
                      Supprimer la catégorie
                    </button>
                  )}
                </div>

                {/* Fichiers avec ordre */}
                {files.length > 0 ? (
                  <div className="space-y-1.5 mb-4">
                    {files.map((f, i) => {
                      const { data } = supabase.storage.from('menus').getPublicUrl(f.file_path)
                      const fileName = f.file_path.split('/').pop() ?? f.file_path
                      return (
                        <div key={f.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg" style={{ backgroundColor: 'rgba(252,238,239,0.04)', border: '1px solid rgba(252,238,239,0.07)' }}>
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => move(cat.id, i, 'up')}
                              disabled={i === 0}
                              className="font-secondary px-1.5 py-0.5 rounded cursor-pointer transition-opacity"
                              style={{ ...btnSecondary, opacity: i === 0 ? 0.2 : 1, fontSize: '0.6rem' }}
                            >↑</button>
                            <button
                              onClick={() => move(cat.id, i, 'down')}
                              disabled={i === files.length - 1}
                              className="font-secondary px-1.5 py-0.5 rounded cursor-pointer transition-opacity"
                              style={{ ...btnSecondary, opacity: i === files.length - 1 ? 0.2 : 1, fontSize: '0.6rem' }}
                            >↓</button>
                          </div>
                          <span className="font-secondary text-xs w-5 text-center flex-shrink-0" style={{ color: 'rgba(252,238,239,0.2)' }}>
                            {i + 1}
                          </span>
                          <a
                            href={data.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-secondary text-sm flex-1 truncate hover:opacity-70 transition-opacity"
                            style={{ color: 'rgba(252,238,239,0.55)' }}
                          >
                            {fileName}
                          </a>
                          <button
                            onClick={() => deleteFile(f)}
                            className="font-secondary text-sm flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ color: 'rgba(220,80,80,0.7)', background: 'none', border: 'none' }}
                          >×</button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="font-secondary text-xs mb-4" style={{ color: 'rgba(252,238,239,0.2)' }}>
                    Aucun fichier dans cette catégorie.
                  </p>
                )}

                {/* Upload */}
                <div className="flex items-center gap-3 flex-wrap">
                  <label
                    className="font-secondary text-sm px-4 py-2 rounded-lg cursor-pointer inline-block transition-opacity hover:opacity-80"
                    style={btnSecondary}
                  >
                    Ajouter des fichiers
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={e => handleFileChange(cat.id, e)}
                      className="hidden"
                    />
                  </label>
                  {pending.length > 0 && (
                    <button
                      onClick={() => uploadForCategory(cat.id)}
                      disabled={uploading === cat.id}
                      className="font-secondary text-sm py-2 px-4 rounded-lg cursor-pointer transition-opacity"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)', opacity: uploading === cat.id ? 0.6 : 1 }}
                    >
                      {uploading === cat.id
                        ? (status || '...')
                        : `Enregistrer (${pending.length} fichier${pending.length > 1 ? 's' : ''})`
                      }
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {message && (
        <p className="font-secondary text-sm mt-4" style={{ color: message.includes('Erreur') ? 'var(--primary)' : 'rgba(252,238,239,0.6)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
