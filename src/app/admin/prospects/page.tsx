"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/client'
import { PROSPECTS, type Prospect } from './prospects.data'

type Statut = 'a_contacter' | 'contacte' | 'relance' | 'close' | 'refus'

type Row = Prospect & {
  statut: Statut
  contacte_le: string | null
  relance_le: string | null
  notes: string
  hidden: boolean
}

const DATA_COLUMNS: (keyof Prospect)[] = [
  'id', 'ajoute', 'nom', 'ville', 'priorite', 'adresse', 'tel', 'email', 'contact',
  'contexte', 'resa', 'resa_prix', 'site', 'site_url', 'heberg', 'angle', 'conf', 'objet', 'corps',
]

const STATUS_LABELS: Record<Statut, string> = {
  a_contacter: 'À contacter', contacte: 'Contacté', relance: 'Relancé', close: 'Closé', refus: 'Refus',
}
const STATUS_COLORS: Record<Statut, { text: string; bg: string }> = {
  a_contacter: { text: 'var(--slate)', bg: 'var(--surface-alt)' },
  contacte: { text: 'var(--status-info-text)', bg: 'var(--status-info-bg)' },
  relance: { text: 'var(--status-warn-text)', bg: 'var(--status-warn-bg)' },
  close: { text: 'var(--status-ok-text)', bg: 'var(--status-ok-bg)' },
  refus: { text: 'var(--status-err-text)', bg: 'var(--status-err-bg)' },
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 13px',
  fontSize: '0.85rem', color: 'var(--ink)', backgroundColor: 'var(--surface)', outline: 'none',
}
const selectStyle: React.CSSProperties = { ...inputStyle, padding: '8px 10px', fontSize: '0.8rem', cursor: 'pointer' }
const labelStyle: React.CSSProperties = { fontSize: '0.68rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }

const hasEmail = (email: string) => /@/.test(email)

export default function ProspectsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [search, setSearch] = useState('')
  const [ville, setVille] = useState('')
  const [statut, setStatut] = useState('')
  const [canal, setCanal] = useState('')
  const [openMail, setOpenMail] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('ajoute', { ascending: false })
      .order('nom', { ascending: true })
    if (error) setError(error.message)
    else setRows((data ?? []) as Row[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  /* ── Écritures ── */
  const updateRow = async (id: string, patch: Partial<Row>) => {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)))
    const dbPatch: Record<string, unknown> = { ...patch }
    if ('contacte_le' in dbPatch && !dbPatch.contacte_le) dbPatch.contacte_le = null
    if ('relance_le' in dbPatch && !dbPatch.relance_le) dbPatch.relance_le = null
    const { error } = await supabase.from('prospects').update(dbPatch).eq('id', id)
    if (error) setError(error.message)
  }

  const removeRow = async (r: Row) => {
    if (typeof window !== 'undefined' && window.confirm(`Supprimer « ${r.nom} » de la liste ?`)) {
      await updateRow(r.id, { hidden: true })
    }
  }
  const restoreAll = async () => {
    const ids = rows.filter(r => r.hidden).map(r => r.id)
    if (ids.length === 0) return
    setRows(rs => rs.map(r => ({ ...r, hidden: false })))
    const { error } = await supabase.from('prospects').update({ hidden: false }).in('id', ids)
    if (error) setError(error.message)
  }

  const seed = async () => {
    setBusy(true); setError('')
    const payload = PROSPECTS.map(p => {
      const o: Record<string, unknown> = {}
      DATA_COLUMNS.forEach(c => { o[c] = c === 'ajoute' ? (p.ajoute || null) : p[c] })
      return o
    })
    const { error } = await supabase.from('prospects').upsert(payload, { onConflict: 'id' })
    if (error) setError(error.message)
    await load(); setBusy(false)
  }

  const importStatuses = async () => {
    setImportMsg('')
    let parsed: Record<string, Partial<{ statut: Statut; contacte_le: string; relance_le: string; notes: string }>>
    try { parsed = JSON.parse(importText) } catch { setImportMsg('JSON invalide.'); return }
    setBusy(true)
    const ids = new Set(rows.map(r => r.id))
    let applied = 0
    for (const [id, st] of Object.entries(parsed)) {
      if (!ids.has(id) || !st) continue
      const patch: Record<string, unknown> = {}
      if (st.statut) patch.statut = st.statut
      if (st.contacte_le !== undefined) patch.contacte_le = st.contacte_le || null
      if (st.relance_le !== undefined) patch.relance_le = st.relance_le || null
      if (st.notes !== undefined) patch.notes = st.notes ?? ''
      if (Object.keys(patch).length === 0) continue
      const { error } = await supabase.from('prospects').update(patch).eq('id', id)
      if (!error) applied++
    }
    setBusy(false); setImportMsg(`${applied} statut(s) importé(s).`); setImportText('')
    await load()
  }

  const copyMail = (r: Row) => {
    navigator.clipboard.writeText(`${r.objet}\n\n${r.corps}`).then(() => {
      setCopied(r.id); setTimeout(() => setCopied(null), 1500)
    })
  }

  const villes = useMemo(() => [...new Set(rows.map(r => r.ville))].sort(), [rows])
  const visible = useMemo(() => rows.filter(r => !r.hidden), [rows])
  const hiddenCount = rows.length - visible.length

  const stats = useMemo(() => {
    const c = { total: visible.length, a_contacter: 0, contacte: 0, relance: 0, close: 0, refus: 0, withEmail: 0, toCall: 0 }
    visible.forEach(r => { c[r.statut] += 1; if (hasEmail(r.email)) c.withEmail += 1; else c.toCall += 1 })
    return c
  }, [visible])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return visible.filter(r => {
      if (ville && r.ville !== ville) return false
      if (statut && r.statut !== statut) return false
      if (canal && (hasEmail(r.email) ? 'email' : 'tel') !== canal) return false
      if (q && !`${r.nom} ${r.ville} ${r.adresse}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [visible, search, ville, statut, canal])

  const Stat = ({ n, label }: { n: number; label: string }) => (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', minWidth: 92 }}>
      <div className="font-primary" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>{n}</div>
      <div className="font-secondary" style={{ fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
    </div>
  )
  const Pill = ({ text, colors }: { text: string; colors: { text: string; bg: string } }) => (
    <span className="font-secondary" style={{ fontSize: '0.7rem', fontWeight: 600, color: colors.text, backgroundColor: colors.bg, padding: '2px 9px', borderRadius: 99, whiteSpace: 'nowrap' }}>{text}</span>
  )

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>
              Prospection<span style={{ color: 'var(--amber)' }}>.</span>
            </h1>
            <p className="font-secondary mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>RESTAURANTS À DÉMARCHER</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowImport(v => !v)} className="font-secondary cursor-pointer" style={{ fontSize: '0.8rem', color: 'var(--pine)', background: 'none', border: 'none' }}>Importer mes statuts</button>
            <Link href="/admin" className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'none' }}>← Admin</Link>
          </div>
        </div>

        {error && (
          <div className="font-secondary" style={{ backgroundColor: 'var(--status-err-bg)', color: 'var(--status-err-text)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', marginBottom: 14 }}>
            {error.includes('does not exist') || error.includes('relation') ? "La table « prospects » n'existe pas encore. Lance la migration sql/2026-07-12-prospects.sql dans Supabase." : error}
          </div>
        )}

        {showImport && (
          <div className="font-secondary" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', marginBottom: 8 }}>
              Colle ici le JSON exporté depuis le tracker Cowork (bouton « Exporter mes statuts ») pour récupérer tes statuts, dates et notes.
            </p>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder='{"comte-roger-carcassonne":{"statut":"contacte","notes":"..."}}' style={{ ...inputStyle, width: '100%', minHeight: 90, fontFamily: 'monospace', fontSize: '0.78rem' }} />
            <div className="flex items-center gap-3 mt-2">
              <button onClick={importStatuses} disabled={busy || !importText.trim()} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', opacity: busy || !importText.trim() ? 0.6 : 1 }}>Importer</button>
              {importMsg && <span style={{ fontSize: '0.8rem', color: 'var(--status-ok-text)' }}>{importMsg}</span>}
            </div>
          </div>
        )}

        {loading ? (
          <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement…</p>
        ) : rows.length === 0 && !error ? (
          <div className="font-secondary" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', marginBottom: 12 }}>La base de prospects est vide.</p>
            <button onClick={seed} disabled={busy} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: '0.85rem', fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
              {busy ? '…' : `Initialiser avec les ${PROSPECTS.length} prospects`}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              <Stat n={stats.total} label="Prospects" />
              <Stat n={stats.withEmail} label="Avec email" />
              <Stat n={stats.toCall} label="À appeler" />
              <Stat n={stats.a_contacter} label="À contacter" />
              <Stat n={stats.contacte} label="Contactés" />
              <Stat n={stats.relance} label="Relancés" />
              <Stat n={stats.close} label="Closés" />
              <Stat n={stats.refus} label="Refus" />
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher (nom, ville…)" className="font-secondary" style={{ ...inputStyle, flex: '1 1 200px' }} />
              <select value={ville} onChange={e => setVille(e.target.value)} className="font-secondary" style={selectStyle}>
                <option value="">Toutes les villes</option>
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={statut} onChange={e => setStatut(e.target.value)} className="font-secondary" style={selectStyle}>
                <option value="">Tous les statuts</option>
                {(Object.keys(STATUS_LABELS) as Statut[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <select value={canal} onChange={e => setCanal(e.target.value)} className="font-secondary" style={selectStyle}>
                <option value="">Tous les canaux</option>
                <option value="email">📧 Email (brouillon prêt)</option>
                <option value="tel">☎️ À appeler (sans email)</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {filtered.map(r => {
                const email = hasEmail(r.email)
                return (
                  <div key={r.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-primary" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>{r.nom}</h3>
                          <Pill text={STATUS_LABELS[r.statut]} colors={STATUS_COLORS[r.statut]} />
                          <Pill text={email ? '📧 Email' : '☎️ À appeler'} colors={email ? STATUS_COLORS.close : STATUS_COLORS.relance} />
                        </div>
                        <p className="font-secondary" style={{ fontSize: '0.78rem', color: 'var(--slate)', marginTop: 3 }}>{r.ville} · {r.adresse} · ajouté le {r.ajoute}</p>
                      </div>
                      <Pill text={`Priorité ${r.priorite}`} colors={r.priorite === 'Haute' ? STATUS_COLORS.refus : STATUS_COLORS.relance} />
                    </div>

                    <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px 18px' }}>
                      <Field label="Téléphone" value={r.tel} warn={/confirmer/i.test(r.tel)} />
                      <Field label="Email" value={r.email} warn={!email} />
                      <Field label="Gérant / Chef" value={r.contact} warn={/confirmer/i.test(r.contact)} />
                      <Field label="Réservation" value={r.resa_prix && r.resa_prix !== '—' ? `${r.resa} (${r.resa_prix})` : r.resa} />
                      <Field label="Site web" value={r.site} link={r.site_url} />
                      <Field label="Hébergement (est.)" value={r.heberg} />
                    </div>

                    <Field label="Contexte" value={r.contexte} block />
                    <Field label="Angle d'approche" value={r.angle} block />
                    <Field label="Fiabilité des données" value={r.conf} block warn />

                    <div className="flex gap-3 flex-wrap items-end" style={{ borderTop: '1px dashed var(--border-soft)', paddingTop: 12, marginTop: 10 }}>
                      <label className="font-secondary" style={labelStyle}>Statut
                        <select value={r.statut} onChange={e => updateRow(r.id, { statut: e.target.value as Statut })} className="font-secondary" style={selectStyle}>
                          {(Object.keys(STATUS_LABELS) as Statut[]).map(k => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                        </select>
                      </label>
                      <label className="font-secondary" style={labelStyle}>Contacté le
                        <input type="date" value={r.contacte_le ?? ''} onChange={e => updateRow(r.id, { contacte_le: e.target.value })} className="font-secondary" style={selectStyle} />
                      </label>
                      <label className="font-secondary" style={labelStyle}>Relancé le
                        <input type="date" value={r.relance_le ?? ''} onChange={e => updateRow(r.id, { relance_le: e.target.value })} className="font-secondary" style={selectStyle} />
                      </label>
                      <label className="font-secondary" style={{ ...labelStyle, flex: '1 1 240px' }}>Notes
                        <textarea
                          value={r.notes}
                          onChange={e => setRows(rs => rs.map(x => (x.id === r.id ? { ...x, notes: e.target.value } : x)))}
                          onBlur={e => updateRow(r.id, { notes: e.target.value })}
                          placeholder="Notes d'appel, objection, RDV…"
                          className="font-secondary" style={{ ...selectStyle, minHeight: 36, resize: 'vertical', cursor: 'text' }}
                        />
                      </label>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border-soft)', paddingTop: 10, marginTop: 12 }}>
                      <button onClick={() => setOpenMail(o => ({ ...o, [r.id]: !o[r.id] }))} className="font-secondary cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--pine)', fontWeight: 600, fontSize: '0.82rem', padding: 0 }}>
                        ✉︎ Brouillon d&apos;email {openMail[r.id] ? '▲' : '▼'}
                      </button>
                      {openMail[r.id] && (
                        <div className="mt-2">
                          <p className="font-secondary" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Objet</p>
                          <p className="font-secondary" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>{r.objet}</p>
                          <p className="font-secondary mt-2" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Message</p>
                          <pre className="font-secondary" style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginTop: 4, fontSize: '0.82rem', color: 'var(--ink)' }}>{r.corps}</pre>
                          <button onClick={() => copyMail(r)} className="font-secondary cursor-pointer" style={{ marginTop: 8, backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: '0.78rem' }}>
                            {copied === r.id ? 'Copié ✓' : 'Copier le message'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-3">
                      <button onClick={() => removeRow(r)} className="font-secondary cursor-pointer" style={{ backgroundColor: 'var(--surface)', color: 'var(--status-err-text)', border: '1px solid var(--status-err-bg)', borderRadius: 8, padding: '6px 11px', fontSize: '0.75rem' }}>
                        🗑 Supprimer ce restaurant
                      </button>
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucun prospect ne correspond aux filtres.</p>
              )}
            </div>

            {hiddenCount > 0 && (
              <div className="font-secondary" style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem', color: 'var(--slate)', marginTop: 14 }}>
                {hiddenCount} restaurant(s) supprimé(s) et masqué(s).{' '}
                <button onClick={restoreAll} className="cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--pine)', fontWeight: 600, textDecoration: 'underline', padding: 0, fontSize: '0.8rem' }}>Tout restaurer</button>
              </div>
            )}

            <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 22, textAlign: 'center' }}>
              Données collectées par recherche web — à confirmer avant appel/envoi.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, warn, block, link }: { label: string; value: string; warn?: boolean; block?: boolean; link?: string }) {
  return (
    <div style={block ? { marginTop: 8 } : undefined}>
      <span className="font-secondary" style={{ display: 'block', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{label}</span>
      <span className="font-secondary" style={{ fontSize: '0.82rem', color: warn ? 'var(--status-warn-text)' : 'var(--ink)' }}>
        {value}
        {link ? <> · <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pine)' }}>ouvrir</a></> : null}
      </span>
    </div>
  )
}
