"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'
import { convertToWebP } from '../../../../../lib/convertToWebP'

const supabase = createClient()

type Event = { id: string; event_date: string; position: number }
type EventFile = { id: string; file_path: string; event_id: string; position: number }

const btnSecondary = {
  backgroundColor: 'var(--surface)',
  border: '1.5px solid var(--border)',
  color: 'var(--slate)',
  borderRadius: 8,
  padding: '7px 14px',
  fontSize: '0.8rem',
  cursor: 'pointer',
}

const inputStyle = {
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
  outline: 'none',
}

export default function EvenementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)
  const [isAdmin, setIsAdmin] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [eventFiles, setEventFiles] = useState<Record<string, EventFile[]>>({})
  const [newFiles, setNewFiles] = useState<Record<string, File[]>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [newDate, setNewDate] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('is_admin').eq('id', user.id).single()
          .then(({ data }) => setIsAdmin(!!data?.is_admin))
      }
    })
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const load = async () => {
    const [{ data: evts }, { data: files }] = await Promise.all([
      supabase.from('restaurant_events').select('id, event_date, position').eq('restaurant_id', restaurantId).order('event_date', { ascending: false }),
      supabase.from('event_files').select('id, file_path, event_id, position').eq('restaurant_id', restaurantId).order('position'),
    ])
    if (evts) setEvents(evts)
    if (files) {
      const grouped: Record<string, EventFile[]> = {}
      files.forEach(f => {
        if (!grouped[f.event_id]) grouped[f.event_id] = []
        grouped[f.event_id].push(f)
      })
      setEventFiles(grouped)
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) return
    setCreating(true)
    const maxPos = events.length > 0 ? Math.max(...events.map(ev => ev.position)) + 1 : 0
    const { error } = await supabase.from('restaurant_events').insert({
      restaurant_id: restaurantId,
      event_date: newDate,
      position: maxPos,
    })
    if (error) setMessage('Erreur : ' + error.message)
    setNewDate('')
    setCreating(false)
    load()
  }

  const deleteEvent = async (evt: Event) => {
    const files = eventFiles[evt.id] || []
    if (files.length > 0) {
      await supabase.storage.from('events').remove(files.map(f => f.file_path))
    }
    await supabase.from('restaurant_events').delete().eq('id', evt.id)
    load()
  }

  const handleFileChange = (eventId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setNewFiles(prev => ({ ...prev, [eventId]: Array.from(e.target.files!) }))
  }

  const uploadForEvent = async (eventId: string) => {
    const filesToUpload = newFiles[eventId] || []
    if (!filesToUpload.length) return
    setUploading(eventId)
    setMessage('')

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

    const existingCount = eventFiles[eventId]?.length || 0
    for (let i = 0; i < converted.length; i++) {
      const file = converted[i]
      setStatus(`Upload ${i + 1}/${converted.length}...`)
      const path = `${restaurantId}/${eventId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('events').upload(path, file)
      if (upErr) { setMessage('Erreur upload : ' + upErr.message); setStatus(''); setUploading(null); return }
      const { error: dbErr } = await supabase.from('event_files').insert({
        restaurant_id: restaurantId,
        event_id: eventId,
        file_path: path,
        position: existingCount + i,
      })
      if (dbErr) { setMessage('Erreur DB : ' + dbErr.message); setStatus(''); setUploading(null); return }
    }

    setNewFiles(prev => ({ ...prev, [eventId]: [] }))
    setStatus('')
    setMessage(`${converted.length} fichier${converted.length > 1 ? 's' : ''} enregistré${converted.length > 1 ? 's' : ''}.`)
    setUploading(null)
    load()
  }

  const updatePositions = async (files: EventFile[]) => {
    await Promise.all(files.map((f, i) => supabase.from('event_files').update({ position: i }).eq('id', f.id)))
  }

  const move = async (eventId: string, index: number, dir: 'up' | 'down') => {
    const files = [...(eventFiles[eventId] || [])]
    const target = dir === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= files.length) return
    ;[files[index], files[target]] = [files[target], files[index]]
    setEventFiles(prev => ({ ...prev, [eventId]: files }))
    await updatePositions(files)
  }

  const deleteFile = async (file: EventFile) => {
    await supabase.storage.from('events').remove([file.file_path])
    await supabase.from('event_files').delete().eq('id', file.id)
    const remaining = (eventFiles[file.event_id] || []).filter(f => f.id !== file.id)
    setEventFiles(prev => ({ ...prev, [file.event_id]: remaining }))
    await updatePositions(remaining)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        ÉVÈNEMENTS
      </h2>

      {isAdmin && (
        <form onSubmit={createEvent} className="flex gap-3 mb-8">
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            required
            className="font-secondary flex-1"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={creating}
            className="font-secondary cursor-pointer flex-shrink-0"
            style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 10, padding: '10px 20px', fontSize: '0.875rem', fontWeight: 600, border: 'none', opacity: creating ? 0.6 : 1 }}
          >
            {creating ? '...' : "+ Créer l'évènement"}
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          {isAdmin ? 'Aucun évènement. Créez-en un ci-dessus.' : 'Aucun évènement disponible.'}
        </p>
      ) : (
        <div className="space-y-4">
          {events.map(evt => {
            const files = eventFiles[evt.id] || []
            const pending = newFiles[evt.id] || []

            return (
              <div key={evt.id} className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-secondary" style={{ fontSize: '0.95rem', color: 'var(--ink)', fontWeight: 600 }}>
                    {formatDate(evt.event_date)}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => deleteEvent(evt)}
                      className="font-secondary cursor-pointer"
                      style={{ backgroundColor: 'var(--status-err-bg)', border: '1px solid rgba(168,71,58,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: '0.78rem', color: 'var(--status-err-text)' }}
                    >
                      Supprimer l&apos;évènement
                    </button>
                  )}
                </div>

                {files.length > 0 ? (
                  <div className="space-y-1.5 mb-4">
                    {files.map((f, i) => {
                      const { data } = supabase.storage.from('events').getPublicUrl(f.file_path)
                      const fileName = f.file_path.split('/').pop() ?? f.file_path
                      return (
                        <div key={f.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-soft)' }}>
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => move(evt.id, i, 'up')}
                              disabled={i === 0}
                              className="font-secondary px-1.5 py-0.5 rounded cursor-pointer transition-opacity"
                              style={{ ...btnSecondary, opacity: i === 0 ? 0.2 : 1, fontSize: '0.6rem' }}
                            >↑</button>
                            <button
                              onClick={() => move(evt.id, i, 'down')}
                              disabled={i === files.length - 1}
                              className="font-secondary px-1.5 py-0.5 rounded cursor-pointer transition-opacity"
                              style={{ ...btnSecondary, opacity: i === files.length - 1 ? 0.2 : 1, fontSize: '0.6rem' }}
                            >↓</button>
                          </div>
                          <span className="font-secondary w-5 text-center flex-shrink-0" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                            {i + 1}
                          </span>
                          <a
                            href={data.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-secondary flex-1 truncate"
                            style={{ fontSize: '0.85rem', color: 'var(--slate)', textDecoration: 'none' }}
                          >
                            {fileName}
                          </a>
                          <button
                            onClick={() => deleteFile(f)}
                            className="font-secondary flex-shrink-0 cursor-pointer"
                            style={{ color: 'var(--status-err-text)', background: 'none', border: 'none', fontSize: '1.1rem', lineHeight: 1 }}
                          >×</button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="font-secondary mb-4" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Aucun fichier pour cet évènement.
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <label className="font-secondary cursor-pointer inline-block" style={btnSecondary}>
                    Ajouter des fichiers
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={e => handleFileChange(evt.id, e)}
                      className="hidden"
                    />
                  </label>
                  {pending.length > 0 && (
                    <button
                      onClick={() => uploadForEvent(evt.id)}
                      disabled={uploading === evt.id}
                      className="font-secondary cursor-pointer"
                      style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 8, padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', opacity: uploading === evt.id ? 0.6 : 1 }}
                    >
                      {uploading === evt.id
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
        <p className="font-secondary mt-4" style={{ fontSize: '0.875rem', color: message.includes('Erreur') ? 'var(--status-err-text)' : 'var(--status-ok-text)', backgroundColor: message.includes('Erreur') ? 'var(--status-err-bg)' : 'var(--status-ok-bg)', borderRadius: 8, padding: '8px 12px', display: 'inline-block' }}>
          {message}
        </p>
      )}
    </div>
  )
}
