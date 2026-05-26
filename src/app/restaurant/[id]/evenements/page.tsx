"use client"

import { use, useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'
import { convertToWebP } from '../../../../../lib/convertToWebP'

const supabase = createClient()

type Event = { id: string; event_date: string; position: number }
type EventFile = { id: string; file_path: string; event_id: string; position: number }

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
      <h2 className="font-secondary text-neutral mb-6" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        ÉVÈNEMENTS
      </h2>

      {isAdmin && (
        <form onSubmit={createEvent} className="flex gap-3 mb-8">
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
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
            {creating ? '...' : '+ Créer l\'évènement'}
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p className="font-secondary text-sm" style={{ color: 'rgba(252,238,239,0.3)' }}>
          {isAdmin ? 'Aucun évènement. Créez-en un ci-dessus.' : 'Aucun évènement disponible.'}
        </p>
      ) : (
        <div className="space-y-4">
          {events.map(evt => {
            const files = eventFiles[evt.id] || []
            const pending = newFiles[evt.id] || []

            return (
              <div key={evt.id} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-secondary text-sm" style={{ color: 'var(--neutral)' }}>
                    {formatDate(evt.event_date)}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => deleteEvent(evt)}
                      className="font-secondary text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
                      style={{ backgroundColor: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(252,238,239,0.5)' }}
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
                        <div key={f.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg" style={{ backgroundColor: 'rgba(252,238,239,0.04)', border: '1px solid rgba(252,238,239,0.07)' }}>
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
                    Aucun fichier pour cet évènement.
                  </p>
                )}

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
                      onChange={e => handleFileChange(evt.id, e)}
                      className="hidden"
                    />
                  </label>
                  {pending.length > 0 && (
                    <button
                      onClick={() => uploadForEvent(evt.id)}
                      disabled={uploading === evt.id}
                      className="font-secondary text-sm py-2 px-4 rounded-lg cursor-pointer transition-opacity"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)', opacity: uploading === evt.id ? 0.6 : 1 }}
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
        <p className="font-secondary text-sm mt-4" style={{ color: message.includes('Erreur') ? 'var(--primary)' : 'rgba(252,238,239,0.6)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
