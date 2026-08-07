"use client"

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Trash2, Users, ChevronLeft, ChevronRight, Link2, Unlink,
  PencilRuler, Eye, Circle, Square, RectangleHorizontal, Check, X, Sun, Moon,
} from 'lucide-react'
import { createClient } from '../../../../../lib/supabase/client'

const supabase = createClient()

// ── Types ────────────────────────────────────────────────────────────
type Mode = 'editor' | 'service'
type Shape = 'round' | 'square' | 'rect'

type Room = { id: string; name: string; position: number }

type Table = {
  id: string
  room_id: string
  label: string
  shape: Shape
  seats: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  merge_group: string | null
}

type Reservation = {
  id: string
  date: string
  time_slot: string
  covers: number
  name: string
  status: string
  table_id: string | null
}

// A logical table = one physical table OR a merged group acting as one.
type Logical = { key: string; members: Table[]; seats: number; repId: string; memberIds: string[] }

// Reservation statuses that actually occupy a table.
const ACTIVE_STATUSES = ['pending', 'accepted', 'arrived']

const CANVAS_H = 560
const GRID = 8

// ── Helpers ──────────────────────────────────────────────────────────
function toISO(d: Date) { return d.toISOString().split('T')[0] }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function fmtDay(d: Date) {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
function snap(v: number) { return Math.round(v / GRID) * GRID }

function migrationHint(msg: string) {
  return `Fusion ponctuelle indisponible (${msg}). Lancez sql/2026-08-07-floor-temp-merges.sql dans Supabase (table floor_temp_merges + colonnes kind, time_slot).`
}

function shapeDefaults(shape: Shape): { seats: number; width: number; height: number } {
  if (shape === 'rect') return { seats: 4, width: 118, height: 64 }
  if (shape === 'square') return { seats: 2, width: 66, height: 66 }
  return { seats: 2, width: 66, height: 66 } // round
}

type TempMerge = { id: string; kind: 'merge' | 'split'; time_slot: string; table_ids: string[] }

// Group physical tables into logical tables. Sources combined in order:
//  - permanent merges: floor_tables.merge_group (set in the editor)
//  - punctual merges: floor_temp_merges kind='merge' for the active date+service
//  - punctual splits: floor_temp_merges kind='split' force listed tables standalone
//    (breaks a permanent merge for this date+service only). Splits win over merges.
function buildLogical(tables: Table[], tempMerges: TempMerge[] = [], splitIds: Set<string> = new Set()): Logical[] {
  const idSet = new Set(tables.map(t => t.id))
  const parent = new Map<string, string>(tables.map(t => [t.id, t.id]))
  const find = (x: string): string => {
    let r = x
    while (parent.get(r) !== r) r = parent.get(r)!
    while (parent.get(x) !== r) { const n = parent.get(x)!; parent.set(x, r); x = n }
    return r
  }
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb) }

  // Permanent merges.
  const byGroup = new Map<string, string[]>()
  for (const t of tables) if (t.merge_group) {
    const arr = byGroup.get(t.merge_group); if (arr) arr.push(t.id); else byGroup.set(t.merge_group, [t.id])
  }
  for (const arr of byGroup.values()) for (let i = 1; i < arr.length; i++) union(arr[0], arr[i])

  // Punctual merges (only ids that still exist in this room).
  for (const m of tempMerges) {
    const present = m.table_ids.filter(id => idSet.has(id))
    for (let i = 1; i < present.length; i++) union(present[0], present[i])
  }

  // Group key per table; punctual splits override to a solo group.
  const comps = new Map<string, Table[]>()
  for (const t of tables) {
    const g = splitIds.has(t.id) ? `solo:${t.id}` : find(t.id)
    const arr = comps.get(g); if (arr) arr.push(t); else comps.set(g, [t])
  }
  return [...comps.values()].map(members => {
    const seats = members.reduce((s, m) => s + m.seats, 0)
    const memberIds = members.map(m => m.id)
    const repId = [...memberIds].sort()[0]
    return { key: repId, members, seats, repId, memberIds }
  })
}

// Adjust only the spacing between member tables while keeping their original
// arrangement: tables placed side by side stay side by side, tables stacked
// stay stacked. gap = 0 snaps them touching (merge); gap > 0 leaves a small
// space (split). The cross-axis coordinate of each table is left untouched.
const SPLIT_GAP = 14
function layoutRow(members: Table[], gap: number): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>()
  if (members.length < 2) return pos
  const minX = Math.min(...members.map(m => m.x))
  const maxX = Math.max(...members.map(m => m.x))
  const minY = Math.min(...members.map(m => m.y))
  const maxY = Math.max(...members.map(m => m.y))
  const horizontal = (maxX - minX) >= (maxY - minY)  // dominant axis
  if (horizontal) {
    let cx = minX
    for (const m of [...members].sort((a, b) => a.x - b.x)) {
      pos.set(m.id, { x: snap(cx), y: m.y })   // keep each table's y (row layout preserved)
      cx += m.width + gap
    }
  } else {
    let cy = minY
    for (const m of [...members].sort((a, b) => a.y - b.y)) {
      pos.set(m.id, { x: m.x, y: snap(cy) })   // keep each table's x (column layout preserved)
      cy += m.height + gap
    }
  }
  return pos
}

/**
 * Auto-suggest a table for every unassigned reservation of the day.
 * Manual assignments (reservation.table_id != null) are fixed. Suggestions are
 * computed in-memory only — never persisted until the restaurateur drags.
 * Greedy: largest parties first onto the smallest table that still fits and is
 * free for that time slot.
 * Returns Map<reservationId, logicalKey>.
 */
function autoSuggest(reservations: Reservation[], logicals: Logical[]): Map<string, string> {
  const byId = new Map(logicals.map(l => [l.repId, l]))
  const memberToKey = new Map<string, string>()
  for (const l of logicals) for (const id of l.memberIds) memberToKey.set(id, l.key)

  // occupancy[logicalKey][timeSlot] = covers already seated
  const occ = new Map<string, Map<string, number>>()
  const bump = (key: string, slot: string, n: number) => {
    let m = occ.get(key); if (!m) { m = new Map(); occ.set(key, m) }
    m.set(slot, (m.get(slot) ?? 0) + n)
  }
  const seated = (key: string, slot: string) => occ.get(key)?.get(slot) ?? 0

  // Seed occupancy from manual assignments.
  for (const r of reservations) {
    if (!r.table_id) continue
    const key = memberToKey.get(r.table_id) ?? byId.get(r.table_id)?.key
    if (key) bump(key, r.time_slot, r.covers)
  }

  const suggestions = new Map<string, string>()
  const sorted = [...logicals].sort((a, b) => a.seats - b.seats)
  const unassigned = reservations
    .filter(r => !r.table_id)
    .sort((a, b) => b.covers - a.covers)

  for (const r of unassigned) {
    const fit = sorted.find(l => seated(l.key, r.time_slot) + r.covers <= l.seats)
    if (fit) { suggestions.set(r.id, fit.key); bump(fit.key, r.time_slot, r.covers) }
  }
  return suggestions
}

// ── Styles ───────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  border: '1px solid var(--border)', borderRadius: 14,
  backgroundColor: 'var(--surface)', padding: 16,
}
const btn = (active?: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  border: `1.5px solid ${active ? 'var(--pine)' : 'var(--border)'}`,
  borderRadius: 9, padding: '7px 13px', fontSize: '0.8rem',
  fontFamily: 'var(--font-secondary)', fontWeight: active ? 600 : 500,
  color: active ? 'var(--pine)' : 'var(--slate)',
  backgroundColor: active ? 'var(--pine-light)' : 'var(--surface)',
  cursor: 'pointer', whiteSpace: 'nowrap',
})
const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
  backgroundColor: 'var(--surface)', cursor: 'pointer', color: 'var(--slate)',
}
const input: React.CSSProperties = {
  border: '1.5px solid var(--border)', borderRadius: 8, padding: '7px 10px',
  fontSize: '0.85rem', color: 'var(--ink)', backgroundColor: 'var(--surface)',
  fontFamily: 'var(--font-secondary)', outline: 'none', width: '100%',
}

// ── Drag state ───────────────────────────────────────────────────────
type Drag =
  | { kind: 'table'; ids: string[]; startX: number; startY: number; orig: Map<string, { x: number; y: number }>; moved: boolean }
  | { kind: 'resa'; resaId: string; covers: number; name: string; px: number; py: number }
  | { kind: 'pan'; startX: number; startY: number; origX: number; origY: number }
  | null

// ── Page ─────────────────────────────────────────────────────────────
export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)

  const [mode, setMode] = useState<Mode>('service')
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  // Editor: selection & fusion
  const [selected, setSelected] = useState<string | null>(null)   // single table being edited
  const [fusion, setFusion] = useState(false)                     // fusion mode on/off
  const [fusionSel, setFusionSel] = useState<Set<string>>(new Set())

  // Service: date + service (midi/soir) + reservations
  const [date, setDate] = useState(new Date())
  // Default view: from 15:00 local time onward, show the evening service.
  const [service, setService] = useState<'midi' | 'soir'>(() => new Date().getHours() >= 15 ? 'soir' : 'midi')
  const [schedule, setSchedule] = useState({
    soir: { debut: '19:00' },  // midi/soir cutoff
  })
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tempMerges, setTempMerges] = useState<TempMerge[]>([])   // punctual merges for date+service
  const [tempError, setTempError] = useState<string | null>(null) // surfaced DB error (e.g. missing migration)
  const [openTable, setOpenTable] = useState<string | null>(null) // logical key detail panel

  // Drag + pan
  const [drag, setDrag] = useState<Drag>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })   // canvas pan offset (infinite space)
  const tablesRef = useRef<Table[]>(tables)   // live tables for the pointerup persistence closure
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const logicalRects = useRef<{ key: string; rect: DOMRect }[]>([])  // hit-test targets (service)

  // ── Load rooms + tables ──
  const loadPlan = useCallback(async () => {
    setLoading(true)
    const { data: roomRows } = await supabase
      .from('floor_rooms').select('*')
      .eq('restaurant_id', restaurantId).order('position')
    const rs = (roomRows ?? []) as Room[]
    setRooms(rs)
    setActiveRoom(prev => prev && rs.some(r => r.id === prev) ? prev : (rs[0]?.id ?? null))

    const { data: tableRows } = await supabase
      .from('floor_tables').select('*').eq('restaurant_id', restaurantId)
    setTables((tableRows ?? []) as Table[])
    setLoading(false)
  }, [restaurantId])

  useEffect(() => { loadPlan() }, [loadPlan])

  // Midi/soir cutoff = start of the evening service.
  useEffect(() => {
    supabase.from('reservation_schedule').select('soir_debut').eq('restaurant_id', restaurantId).single()
      .then(({ data }) => { if (data?.soir_debut) setSchedule({ soir: { debut: data.soir_debut } }) })
  }, [restaurantId])

  // ── Load reservations for the selected day (service mode) ──
  useEffect(() => {
    if (mode !== 'service') return
    supabase.from('reservations')
      .select('id, date, time_slot, covers, name, status, table_id')
      .eq('restaurant_id', restaurantId)
      .eq('date', toISO(date))
      .in('status', ACTIVE_STATUSES)
      .then(({ data }) => setReservations((data ?? []) as Reservation[]))
  }, [mode, date, restaurantId])

  // Punctual merges for the active date+service, all seating slots (service view only).
  const loadTempMerges = useCallback(async () => {
    const { data, error } = await supabase.from('floor_temp_merges')
      .select('id, kind, time_slot, table_ids')
      .eq('restaurant_id', restaurantId).eq('date', toISO(date)).eq('service', service)
    if (error) { setTempError(migrationHint(error.message)); return }
    setTempError(null)
    setTempMerges((data ?? []).map(r => ({
      id: r.id as string,
      kind: (r.kind ?? 'merge') as 'merge' | 'split',
      time_slot: (r.time_slot ?? '') as string,
      table_ids: (r.table_ids ?? []) as string[],
    })))
  }, [restaurantId, date, service])

  useEffect(() => {
    if (mode !== 'service') { setTempMerges([]); return }
    loadTempMerges()
  }, [mode, loadTempMerges])

  const roomTables = useMemo(
    () => tables.filter(t => t.room_id === activeRoom),
    [tables, activeRoom],
  )

  // Reservations of the selected service (midi vs soir) — all seatings at once.
  const serviceResas = useMemo(
    () => reservations.filter(r => (r.time_slot >= schedule.soir.debut) === (service === 'soir')),
    [reservations, schedule.soir.debut, service],
  )

  // Logical tables for the whole service (punctual merges/splits apply to date+service).
  const logicals = useMemo(() => {
    if (mode !== 'service') return buildLogical(roomTables)
    const mergeRows = tempMerges.filter(m => m.kind === 'merge')
    const splitIds = new Set(tempMerges.filter(m => m.kind === 'split').flatMap(m => m.table_ids))
    return buildLogical(roomTables, mergeRows, splitIds)
  }, [roomTables, mode, tempMerges])

  // Render-only geometry for the service view: punctual merges snap tables together,
  // punctual splits space them apart — WITHOUT persisting to floor_tables, so the
  // move shows only on this date+service. Editor keeps base (persisted) positions.
  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>(roomTables.map(t => [t.id, { x: t.x, y: t.y }]))
    if (mode !== 'service') return pos
    for (const l of logicals) if (l.members.length > 1) {
      for (const [id, xy] of layoutRow(l.members, 0)) pos.set(id, xy)
    }
    for (const m of tempMerges) {
      if (m.kind !== 'split') continue
      const members = roomTables.filter(t => m.table_ids.includes(t.id))
      if (members.length > 1) for (const [id, xy] of layoutRow(members, SPLIT_GAP)) pos.set(id, xy)
    }
    return pos
  }, [roomTables, mode, logicals, tempMerges])

  const suggestions = useMemo(
    () => mode === 'service' ? autoSuggest(serviceResas, logicals) : new Map<string, string>(),
    [mode, serviceResas, logicals],
  )

  // reservations grouped per logical key (manual + suggested), whole service
  const resasByKey = useMemo(() => {
    const memberToKey = new Map<string, string>()
    for (const l of logicals) for (const id of l.memberIds) memberToKey.set(id, l.key)
    const map = new Map<string, { r: Reservation; suggested: boolean }[]>()
    const push = (key: string, r: Reservation, suggested: boolean) => {
      const a = map.get(key); if (a) a.push({ r, suggested }); else map.set(key, [{ r, suggested }])
    }
    for (const r of serviceResas) {
      if (r.table_id) { const k = memberToKey.get(r.table_id); if (k) push(k, r, false) }
      else { const k = suggestions.get(r.id); if (k) push(k, r, true) }
    }
    return map
  }, [serviceResas, logicals, suggestions])

  // Flat list of every service reservation with its (placed/suggested) table label.
  const serviceList = useMemo(() => {
    const byResa = new Map<string, { label: string; suggested: boolean; key: string }>()
    for (const l of logicals) {
      const label = l.members.map(m => m.label || '—').join('+')
      for (const { r, suggested } of resasByKey.get(l.key) ?? []) byResa.set(r.id, { label, suggested, key: l.key })
    }
    return [...serviceResas]
      .sort((a, b) => a.time_slot.localeCompare(b.time_slot) || a.name.localeCompare(b.name))
      .map(r => ({ r, ...(byResa.get(r.id) ?? { label: null as string | null, suggested: false, key: null as string | null }) }))
  }, [serviceResas, logicals, resasByKey])

  // ── Room ops ──
  const addRoom = async () => {
    const name = prompt('Nom de la salle (ex : Salle, Terrasse, Cour)')?.trim()
    if (!name) return
    const { data } = await supabase.from('floor_rooms')
      .insert({ restaurant_id: restaurantId, name, position: rooms.length })
      .select().single()
    if (data) { setRooms(prev => [...prev, data as Room]); setActiveRoom((data as Room).id) }
  }
  const renameRoom = async (room: Room) => {
    const name = prompt('Renommer la salle', room.name)?.trim()
    if (!name || name === room.name) return
    await supabase.from('floor_rooms').update({ name }).eq('id', room.id)
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, name } : r))
  }
  const deleteRoom = async (room: Room) => {
    if (!confirm(`Supprimer la salle « ${room.name} » et ses tables ?`)) return
    await supabase.from('floor_rooms').delete().eq('id', room.id)
    setTables(prev => prev.filter(t => t.room_id !== room.id))
    setRooms(prev => {
      const next = prev.filter(r => r.id !== room.id)
      setActiveRoom(cur => cur === room.id ? (next[0]?.id ?? null) : cur)
      return next
    })
  }

  // ── Table ops ──
  const addTable = async (shape: Shape) => {
    if (!activeRoom) return
    const d = shapeDefaults(shape)
    const n = roomTables.length
    const label = String(n + 1)
    const x = snap(40 + (n % 6) * 30)
    const y = snap(40 + Math.floor(n / 6) * 30)
    const { data } = await supabase.from('floor_tables').insert({
      restaurant_id: restaurantId, room_id: activeRoom, label, shape,
      seats: d.seats, x, y, width: d.width, height: d.height,
    }).select().single()
    if (data) { setTables(prev => [...prev, data as Table]); setSelected((data as Table).id) }
  }
  const patchTable = async (id: string, patch: Partial<Table>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    await supabase.from('floor_tables').update(patch).eq('id', id)
  }
  const deleteTable = async (id: string) => {
    await supabase.from('floor_tables').delete().eq('id', id)
    setTables(prev => prev.filter(t => t.id !== id))
    setSelected(cur => cur === id ? null : cur)
  }

  // ── Fusion ──
  const toggleFusionSel = (id: string) => {
    setFusionSel(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  // Reposition tables: gap=0 snaps them touching (merge), gap>0 spaces them (split).
  const applyLayout = async (ids: string[], gap: number) => {
    const members = tablesRef.current.filter(t => ids.includes(t.id))
    if (members.length < 2) return
    const pos = layoutRow(members, gap)
    setTables(prev => prev.map(t => pos.has(t.id) ? { ...t, x: pos.get(t.id)!.x, y: pos.get(t.id)!.y } : t))
    await Promise.all([...pos.entries()].map(([id, p]) =>
      supabase.from('floor_tables').update({ x: p.x, y: p.y }).eq('id', id)))
  }

  // Permanent merge (editor): writes floor_tables.merge_group + snaps tables together.
  const mergePermanent = async () => {
    if (fusionSel.size < 2) return
    const group = crypto.randomUUID()
    const ids = [...fusionSel]
    setTables(prev => prev.map(t => ids.includes(t.id) ? { ...t, merge_group: group } : t))
    await supabase.from('floor_tables').update({ merge_group: group }).in('id', ids)
    await applyLayout(ids, 0)
    setFusionSel(new Set())
  }
  const unmergePermanent = async () => {
    const ids = [...fusionSel]
    if (!ids.length) return
    setTables(prev => prev.map(t => ids.includes(t.id) ? { ...t, merge_group: null } : t))
    await supabase.from('floor_tables').update({ merge_group: null }).in('id', ids)
    await applyLayout(ids, SPLIT_GAP)
    setFusionSel(new Set())
  }

  // Punctual merge (service): one floor_temp_merges row for this date+service.
  // Geometry is render-only (see the `positions` memo) — floor_tables is untouched.
  const mergeTemp = async () => {
    if (fusionSel.size < 2) return
    const { error } = await supabase.from('floor_temp_merges').insert({
      restaurant_id: restaurantId, date: toISO(date), service, kind: 'merge', table_ids: [...fusionSel],
    })
    if (error) { setTempError(migrationHint(error.message)); return }
    setFusionSel(new Set())
    await loadTempMerges()
  }
  // Punctual separation (service): undo punctual merges AND break permanent merges
  // for this date+service (via a 'split' row). Geometry is render-only.
  const separateTemp = async () => {
    if (!fusionSel.size) return
    const toDelete = tempMerges
      .filter(m => m.kind === 'merge' && m.table_ids.some(id => fusionSel.has(id)))
      .map(m => m.id)
    if (toDelete.length) {
      const { error } = await supabase.from('floor_temp_merges').delete().in('id', toDelete)
      if (error) { setTempError(migrationHint(error.message)); return }
    }
    const permIds = tablesRef.current.filter(t => fusionSel.has(t.id) && t.merge_group).map(t => t.id)
    if (permIds.length) {
      const { error } = await supabase.from('floor_temp_merges').insert({
        restaurant_id: restaurantId, date: toISO(date), service, kind: 'split', table_ids: permIds,
      })
      if (error) { setTempError(migrationHint(error.message)); return }
    }
    setFusionSel(new Set())
    await loadTempMerges()
  }

  const mergeSelected = () => (mode === 'editor' ? mergePermanent() : mergeTemp())
  const unmergeSelected = () => (mode === 'editor' ? unmergePermanent() : separateTemp())

  // ── Reservation assignment ──
  const assignResa = async (resaId: string, repId: string | null) => {
    setReservations(prev => prev.map(r => r.id === resaId ? { ...r, table_id: repId } : r))
    await supabase.from('reservations').update({ table_id: repId }).eq('id', resaId)
  }

  // ── Pointer drag (tables in editor, reservations in service) ──
  const startTableDrag = (e: React.PointerEvent, table: Table) => {
    if (mode !== 'editor' || fusion) return
    e.preventDefault()
    // Move whole merge group together.
    const groupIds = table.merge_group
      ? roomTables.filter(t => t.merge_group === table.merge_group).map(t => t.id)
      : [table.id]
    const orig = new Map(roomTables.filter(t => groupIds.includes(t.id)).map(t => [t.id, { x: t.x, y: t.y }]))
    setDrag({ kind: 'table', ids: groupIds, startX: e.clientX, startY: e.clientY, orig, moved: false })
  }
  const startResaDrag = (e: React.PointerEvent, r: Reservation) => {
    e.preventDefault()
    setDrag({ kind: 'resa', resaId: r.id, covers: r.covers, name: r.name, px: e.clientX, py: e.clientY })
  }
  // Pan the canvas when the drag starts on empty space (not on a table).
  const startPan = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-table]')) return
    setDrag({ kind: 'pan', startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y })
  }

  useEffect(() => {
    if (!drag) return
    const onMove = (e: PointerEvent) => {
      if (drag.kind === 'table') {
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return
        // Infinite space: no clamping to canvas bounds.
        setTables(prev => prev.map(t => {
          if (!drag.ids.includes(t.id)) return t
          const o = drag.orig.get(t.id)!
          return { ...t, x: o.x + dx, y: o.y + dy }
        }))
        setDrag(d => d && d.kind === 'table' ? { ...d, moved: true } : d)
      } else if (drag.kind === 'resa') {
        setDrag(d => d && d.kind === 'resa' ? { ...d, px: e.clientX, py: e.clientY } : d)
      } else if (drag.kind === 'pan') {
        setPan({ x: drag.origX + (e.clientX - drag.startX), y: drag.origY + (e.clientY - drag.startY) })
      }
    }
    const onUp = (e: PointerEvent) => {
      if (drag.kind === 'table') {
        if (drag.moved) {
          // Persist snapped final positions of the whole group.
          for (const id of drag.ids) {
            const t = tablesRef.current.find(x => x.id === id)
            if (t) patchTable(id, { x: snap(t.x), y: snap(t.y) })
          }
        } else {
          // A click without movement = select for editing.
          setSelected(drag.ids[0])
        }
      } else if (drag.kind === 'resa') {
        // Hit-test logical tables (service).
        let hitKey: string | null = null
        for (const { key, rect } of logicalRects.current) {
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) { hitKey = key; break }
        }
        if (hitKey) {
          const rep = logicals.find(l => l.key === hitKey)?.repId ?? null
          assignResa(drag.resaId, rep)
        }
      }
      setDrag(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, logicals])

  // Keep a live ref of tables for the pointerup persistence closure.
  useEffect(() => { tablesRef.current = tables }, [tables])

  // Refresh hit-test rects after render in service mode.
  useEffect(() => {
    if (mode !== 'service') return
    const el = canvasRef.current
    if (!el) return
    const arr: { key: string; rect: DOMRect }[] = []
    el.querySelectorAll<HTMLElement>('[data-logical]').forEach(node => {
      arr.push({ key: node.dataset.logical!, rect: node.getBoundingClientRect() })
    })
    logicalRects.current = arr
  }, [mode, logicals, positions, pan, drag, activeRoom, reservations])

  const selectedTable = tables.find(t => t.id === selected) ?? null
  const unplaced = serviceResas.filter(r => !r.table_id)

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <div>
          <h1 className="font-primary" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
            Plan de salle
          </h1>
          <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--slate)', margin: '4px 0 0' }}>
            {mode === 'editor'
              ? 'Disposez vos tables. Glissez pour déplacer, fusionnez deux tables pour en former une plus grande.'
              : 'Réservations du jour placées automatiquement. Glissez une réservation pour ajuster.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setMode('service'); setSelected(null); setFusion(false); setFusionSel(new Set()) }} style={btn(mode === 'service')}>
            <Eye size={15} strokeWidth={1.9} /> Service
          </button>
          <button onClick={() => { setMode('editor'); setOpenTable(null); setSelected(null); setFusion(false); setFusionSel(new Set()) }} style={btn(mode === 'editor')}>
            <PencilRuler size={15} strokeWidth={1.9} /> Éditeur
          </button>
        </div>
      </div>

      {/* Room tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {rooms.map(room => (
          <div key={room.id} style={{ display: 'flex' }}>
            <button
              onClick={() => { setActiveRoom(room.id); setSelected(null); setOpenTable(null) }}
              onDoubleClick={() => mode === 'editor' && renameRoom(room)}
              style={{
                ...btn(activeRoom === room.id),
                borderRadius: mode === 'editor' ? '9px 0 0 9px' : 9,
              }}
              title={mode === 'editor' ? 'Double-clic pour renommer' : undefined}
            >
              {room.name}
            </button>
            {mode === 'editor' && (
              <button
                onClick={() => deleteRoom(room)}
                style={{ ...iconBtn, width: 30, height: 'auto', borderRadius: '0 9px 9px 0', borderLeft: 'none' }}
                title="Supprimer la salle"
              >
                <Trash2 size={13} strokeWidth={1.9} />
              </button>
            )}
          </div>
        ))}
        {mode === 'editor' && (
          <button onClick={addRoom} style={btn(false)}>
            <Plus size={15} strokeWidth={2} /> Salle
          </button>
        )}
      </div>

      {tempError && (
        <div className="font-secondary" style={{
          border: '1px solid var(--status-err-bg)', background: 'var(--status-err-bg)',
          color: 'var(--status-err-text)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem',
        }}>
          {tempError}
        </div>
      )}

      {loading ? (
        <div style={{ ...card, color: 'var(--muted)', fontFamily: 'var(--font-secondary)' }}>Chargement…</div>
      ) : rooms.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <p className="font-secondary" style={{ color: 'var(--slate)', marginBottom: 14 }}>
            Aucune salle. Créez-en une pour commencer votre plan.
          </p>
          <button onClick={addRoom} style={{ ...btn(true), margin: '0 auto' }}>
            <Plus size={15} strokeWidth={2} /> Créer une salle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          {/* ── Canvas ── */}
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            {mode === 'editor' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <button onClick={() => addTable('round')} style={btn(false)}><Circle size={15} strokeWidth={1.9} /> Ronde</button>
                <button onClick={() => addTable('square')} style={btn(false)}><Square size={15} strokeWidth={1.9} /> Carrée</button>
                <button onClick={() => addTable('rect')} style={btn(false)}><RectangleHorizontal size={15} strokeWidth={1.9} /> Rectangle</button>
                <div style={{ width: 1, background: 'var(--border)', margin: '0 2px' }} />
                <button
                  onClick={() => { setFusion(f => !f); setFusionSel(new Set()); setSelected(null) }}
                  style={btn(fusion)}
                  title="Fusion permanente (toutes dates)"
                >
                  <Link2 size={15} strokeWidth={1.9} /> Fusionner
                </button>
              </div>
            )}

            {mode === 'service' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex' }}>
                  <button onClick={() => { setService('midi'); setOpenTable(null) }} style={{ ...btn(service === 'midi'), borderRadius: '9px 0 0 9px' }}>
                    <Sun size={15} strokeWidth={1.9} /> Midi
                  </button>
                  <button onClick={() => { setService('soir'); setOpenTable(null) }} style={{ ...btn(service === 'soir'), borderRadius: '0 9px 9px 0', borderLeft: 'none' }}>
                    <Moon size={15} strokeWidth={1.9} /> Soir
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220 }}>
                  <button onClick={() => setDate(d => addDays(d, -1))} style={iconBtn}><ChevronLeft size={16} /></button>
                  <div className="font-secondary" style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                    {fmtDay(date)}
                  </div>
                  <button onClick={() => setDate(d => addDays(d, 1))} style={iconBtn}><ChevronRight size={16} /></button>
                  <button onClick={() => setDate(new Date())} style={btn(false)}>Aujourd’hui</button>
                </div>
                <button
                  onClick={() => { setFusion(f => !f); setFusionSel(new Set()); setOpenTable(null) }}
                  style={btn(fusion)}
                  title="Regrouper des tables"
                >
                  <Link2 size={15} strokeWidth={1.9} /> Fusionner
                </button>
              </div>
            )}

            <div
              ref={canvasRef}
              onPointerDown={startPan}
              style={{
                position: 'relative', height: CANVAS_H,
                border: '1px solid var(--border)', borderRadius: 14,
                backgroundColor: 'var(--surface-alt)',
                backgroundImage: 'radial-gradient(var(--border-soft) 1px, transparent 1px)',
                backgroundSize: `${GRID * 2}px ${GRID * 2}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
                overflow: 'hidden', touchAction: 'none', userSelect: 'none',
                cursor: drag?.kind === 'pan' ? 'grabbing' : 'default',
              }}
            >
              {/* Infinite pannable content: tables live here, translated by the pan offset */}
              <div style={{ position: 'absolute', inset: 0, transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                {logicals.map(l => (
                  <LogicalTable
                    key={l.key}
                    logical={l}
                    positions={positions}
                    mode={mode}
                    fusion={fusion}
                    fusionSel={fusionSel}
                    isSelected={!!selectedTable && l.memberIds.includes(selectedTable.id)}
                    resas={resasByKey.get(l.key) ?? []}
                    onTablePointerDown={startTableDrag}
                    onFusionToggle={toggleFusionSel}
                    onOpenDetail={() => setOpenTable(l.key)}
                  />
                ))}
              </div>
              {roomTables.length === 0 && (
                <div className="font-secondary" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>
                  {mode === 'editor' ? 'Ajoutez des tables avec les boutons ci-dessus.' : 'Aucune table dans cette salle.'}
                </div>
              )}
              {(pan.x !== 0 || pan.y !== 0) && (
                <button
                  onClick={() => setPan({ x: 0, y: 0 })}
                  onPointerDown={e => e.stopPropagation()}
                  className="font-secondary"
                  style={{
                    position: 'absolute', right: 10, bottom: 10, zIndex: 5,
                    border: '1.5px solid var(--border)', borderRadius: 8, padding: '5px 10px',
                    background: 'var(--surface)', color: 'var(--slate)', fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  Recentrer
                </button>
              )}
            </div>

            {/* Fusion action bar */}
            {fusion && (
              <div style={{ ...card, marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="font-secondary" style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>
                  {fusionSel.size} table{fusionSel.size > 1 ? 's' : ''} sélectionnée{fusionSel.size > 1 ? 's' : ''}
                  <span style={{ color: 'var(--muted)' }}>
                    {' · '}{mode === 'editor' ? 'fusion permanente' : `ponctuel (${service}, ${toISO(date)})`}
                  </span>
                </span>
                <button onClick={mergeSelected} disabled={fusionSel.size < 2} style={{ ...btn(fusionSel.size >= 2), opacity: fusionSel.size >= 2 ? 1 : 0.45 }}>
                  <Link2 size={15} strokeWidth={1.9} /> Regrouper
                </button>
                <button onClick={unmergeSelected} disabled={fusionSel.size === 0} style={{ ...btn(false), opacity: fusionSel.size ? 1 : 0.45 }}>
                  <Unlink size={15} strokeWidth={1.9} /> Séparer
                </button>
              </div>
            )}
          </div>

          {/* ── Side panel ── */}
          <div style={{ flex: '0 1 300px', minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'editor' && selectedTable && (
              <TableEditor
                table={selectedTable}
                onPatch={p => patchTable(selectedTable.id, p)}
                onDelete={() => deleteTable(selectedTable.id)}
                onClose={() => setSelected(null)}
              />
            )}
            {mode === 'editor' && !selectedTable && (
              <div style={{ ...card, color: 'var(--slate)', fontFamily: 'var(--font-secondary)', fontSize: '0.82rem' }}>
                Cliquez une table pour la modifier (numéro, couverts, forme). Glissez-la pour la déplacer.
              </div>
            )}

            {mode === 'service' && (
              <ServicePanel
                list={serviceList}
                unplaced={unplaced}
                onResaPointerDown={startResaDrag}
                onOpenTable={setOpenTable}
                openLogical={openTable ? logicals.find(l => l.key === openTable) ?? null : null}
                openResas={openTable ? (resasByKey.get(openTable) ?? []) : []}
                onUnassign={id => assignResa(id, null)}
                onCloseDetail={() => setOpenTable(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* Floating drag ghost for reservations */}
      {drag?.kind === 'resa' && (
        <div style={{
          position: 'fixed', left: drag.px + 12, top: drag.py + 12, zIndex: 100,
          pointerEvents: 'none', backgroundColor: 'var(--pine)', color: 'var(--paper)',
          borderRadius: 8, padding: '6px 10px', fontSize: '0.78rem', fontFamily: 'var(--font-secondary)',
          fontWeight: 600, boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        }}>
          {drag.name} · {drag.covers}p
        </div>
      )}
    </div>
  )
}

// ── LogicalTable (rendered on the canvas) ────────────────────────────
function LogicalTable({
  logical, positions, mode, fusion, fusionSel, isSelected, resas,
  onTablePointerDown, onFusionToggle, onOpenDetail,
}: {
  logical: Logical
  positions: Map<string, { x: number; y: number }>
  mode: Mode
  fusion: boolean
  fusionSel: Set<string>
  isSelected: boolean
  resas: { r: Reservation; suggested: boolean }[]
  onTablePointerDown: (e: React.PointerEvent, t: Table) => void
  onFusionToggle: (id: string) => void
  onOpenDetail: () => void
}) {
  const occupied = resas.length > 0
  // Over-capacity is per seating slot: two parties at different times don't conflict.
  const perSlot = new Map<string, number>()
  for (const { r } of resas) perSlot.set(r.time_slot, (perSlot.get(r.time_slot) ?? 0) + r.covers)
  const over = [...perSlot.values()].some(v => v > logical.seats)
  const isMerged = logical.members.length > 1
  const posOf = (t: Table) => positions.get(t.id) ?? { x: t.x, y: t.y }

  return (
    <>
      {logical.members.map(t => {
        const inFusionSel = fusionSel.has(t.id)
        const isRep = t.id === logical.repId
        const p = posOf(t)
        const radius = t.shape === 'round' ? '50%' : 12
        const highlight =
          isSelected ? 'var(--pine)' :
          inFusionSel ? 'var(--amber)' :
          logical.members.length > 1 ? 'var(--pine)' : 'var(--border)'
        return (
          <div
            key={t.id}
            data-table=""
            data-logical={mode === 'service' ? logical.key : undefined}
            onPointerDown={e => {
              if (fusion) { onFusionToggle(t.id); return }
              if (mode === 'editor') onTablePointerDown(e, t)
            }}
            onClick={() => { if (mode === 'service' && !fusion) onOpenDetail() }}
            style={{
              position: 'absolute', left: p.x, top: p.y, width: t.width, height: t.height,
              borderRadius: radius,
              border: `2px solid ${highlight}`,
              backgroundColor: inFusionSel
                ? 'var(--amber-light)'
                : mode === 'service'
                  ? (over ? 'var(--status-err-bg)' : occupied ? 'var(--status-ok-bg)' : 'var(--surface)')
                  : 'var(--surface)',
              boxShadow: isSelected ? '0 0 0 3px var(--pine-light)' : '0 1px 3px rgba(0,0,0,0.06)',
              cursor: mode === 'editor' ? (fusion ? 'pointer' : 'grab') : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1, touchAction: 'none',
            }}
          >
            <span className="font-primary" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
              {t.label || '—'}
            </span>
            {/* Merged tables show the combined capacity once (on the representative box). */}
            {(!isMerged || isRep) && (
              <span className="font-secondary" style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.62rem', color: isMerged ? 'var(--pine)' : 'var(--slate)', fontWeight: isMerged ? 700 : 400 }}>
                <Users size={9} strokeWidth={2} />{isMerged ? logical.seats : t.seats}
              </span>
            )}
          </div>
        )
      })}

      {/* All service reservations for this table, listed at a glance below it (service) */}
      {mode === 'service' && occupied && (
        <div style={{
          position: 'absolute',
          left: Math.min(...logical.members.map(m => posOf(m).x)),
          top: Math.max(...logical.members.map(m => posOf(m).y + m.height)) + 3,
          width: Math.max(100, Math.max(...logical.members.map(m => posOf(m).x + m.width)) - Math.min(...logical.members.map(m => posOf(m).x))),
          display: 'flex', flexDirection: 'column', gap: 2, pointerEvents: 'none', zIndex: 2,
        }}>
          {[...resas].sort((a, b) => a.r.time_slot.localeCompare(b.r.time_slot)).map(({ r, suggested }) => (
            <div key={r.id} className="font-secondary" style={{
              fontSize: '0.6rem', lineHeight: 1.15,
              color: suggested ? 'var(--amber)' : 'var(--ink)',
              backgroundColor: 'var(--surface)',
              border: `1px solid ${suggested ? 'var(--amber-light)' : 'var(--border-soft)'}`,
              borderRadius: 5, padding: '2px 5px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              <b style={{ fontWeight: 700 }}>{r.time_slot}</b> · {r.covers}p · {r.name}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── TableEditor side panel ───────────────────────────────────────────
function TableEditor({
  table, onPatch, onDelete, onClose,
}: {
  table: Table
  onPatch: (p: Partial<Table>) => void
  onDelete: () => void
  onClose: () => void
}) {
  const shapes: { v: Shape; Icon: React.ElementType; label: string }[] = [
    { v: 'round', Icon: Circle, label: 'Ronde' },
    { v: 'square', Icon: Square, label: 'Carrée' },
    { v: 'rect', Icon: RectangleHorizontal, label: 'Rect.' },
  ]
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="font-primary" style={{ fontWeight: 700, color: 'var(--ink)' }}>Table {table.label}</span>
        <button onClick={onClose} style={{ ...iconBtn, width: 26, height: 26 }}><X size={13} /></button>
      </div>

      <label className="font-secondary" style={labelStyle}>Numéro / nom</label>
      <input style={{ ...input, marginBottom: 12 }} value={table.label} onChange={e => onPatch({ label: e.target.value })} />

      <label className="font-secondary" style={labelStyle}>Couverts</label>
      <input type="number" min={1} max={20} style={{ ...input, marginBottom: 12 }}
        value={table.seats} onChange={e => onPatch({ seats: Math.max(1, Number(e.target.value) || 1) })} />

      <label className="font-secondary" style={labelStyle}>Forme</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {shapes.map(({ v, Icon, label }) => (
          <button key={v}
            onClick={() => onPatch({ shape: v, ...(v === 'rect'
              ? { width: Math.max(table.width, 118), height: 64 }
              : { width: 66, height: 66 }) })}
            style={{ ...btn(table.shape === v), flex: 1, justifyContent: 'center', padding: '7px 4px' }}>
            <Icon size={14} strokeWidth={1.9} /> {label}
          </button>
        ))}
      </div>

      <button onClick={onDelete} style={{ ...btn(false), width: '100%', justifyContent: 'center', color: 'var(--status-err-text)', borderColor: 'var(--status-err-bg)' }}>
        <Trash2 size={14} strokeWidth={1.9} /> Supprimer la table
      </button>
    </div>
  )
}

// ── ServicePanel side panel ──────────────────────────────────────────
type ServiceListItem = { r: Reservation; label: string | null; suggested: boolean; key: string | null }

function ServicePanel({
  list, unplaced, onResaPointerDown, onOpenTable, openLogical, openResas, onUnassign, onCloseDetail,
}: {
  list: ServiceListItem[]
  unplaced: Reservation[]
  onResaPointerDown: (e: React.PointerEvent, r: Reservation) => void
  onOpenTable: (key: string) => void
  openLogical: Logical | null
  openResas: { r: Reservation; suggested: boolean }[]
  onUnassign: (id: string) => void
  onCloseDetail: () => void
}) {
  return (
    <>
      {/* Full list of the service reservations: name · time · covers · table */}
      <div style={card}>
        <div className="font-primary" style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
          Réservations du service
        </div>
        <p className="font-secondary" style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0 0 10px' }}>
          {list.length} réservation{list.length > 1 ? 's' : ''}
        </p>
        {list.length === 0 ? (
          <p className="font-secondary" style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>Aucune réservation.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 320, overflowY: 'auto' }}>
            {list.map(({ r, label, suggested, key }) => (
              <div key={r.id}
                onClick={() => { if (key) onOpenTable(key) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  padding: '6px 9px', borderRadius: 8, border: '1px solid var(--border-soft)',
                  backgroundColor: 'var(--surface-alt)', cursor: key ? 'pointer' : 'default',
                }}>
                <div style={{ minWidth: 0 }}>
                  <div className="font-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>{r.time_slot} · {r.covers}p</div>
                </div>
                <span className="font-secondary" style={{
                  flexShrink: 0, fontSize: '0.72rem', fontWeight: 700, borderRadius: 6, padding: '2px 7px',
                  color: label ? (suggested ? 'var(--amber)' : 'var(--pine)') : 'var(--muted)',
                  backgroundColor: label ? (suggested ? 'var(--amber-light)' : 'var(--pine-light)') : 'var(--surface)',
                  border: label ? 'none' : '1px dashed var(--border)',
                }}>
                  {label ? `T${label}` : 'à placer'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {openLogical && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="font-primary" style={{ fontWeight: 700, color: 'var(--ink)' }}>
              Table {openLogical.members.map(m => m.label).join(' + ')} · {openLogical.seats}p
            </span>
            <button onClick={onCloseDetail} style={{ ...iconBtn, width: 26, height: 26 }}><X size={13} /></button>
          </div>
          {openResas.length === 0 ? (
            <p className="font-secondary" style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>Aucune réservation.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openResas.sort((a, b) => a.r.time_slot.localeCompare(b.r.time_slot)).map(({ r, suggested }) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '7px 10px', borderRadius: 9, backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-soft)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="font-secondary" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                    <div className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>
                      {r.time_slot} · {r.covers}p {suggested && <span style={{ color: 'var(--amber)', fontWeight: 600 }}>· suggéré</span>}
                    </div>
                  </div>
                  {!suggested && (
                    <button onClick={() => onUnassign(r.id)} style={{ ...iconBtn, width: 26, height: 26 }} title="Retirer de la table"><X size={13} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={card}>
        <div className="font-primary" style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>À placer</div>
        <p className="font-secondary" style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0 0 10px' }}>
          Glissez une réservation sur une table pour l’assigner.
        </p>
        {unplaced.length === 0 ? (
          <p className="font-secondary" style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
            <Check size={13} style={{ verticalAlign: -2 }} /> Toutes les réservations sont placées.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {unplaced.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(r => (
              <div key={r.id}
                onPointerDown={e => onResaPointerDown(e, r)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)', cursor: 'grab', touchAction: 'none',
                }}>
                <div style={{ minWidth: 0 }}>
                  <div className="font-secondary" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>{r.time_slot} · {r.covers}p</div>
                </div>
                <span className="font-secondary" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--slate)', flexShrink: 0 }}>
                  <Users size={11} strokeWidth={2} />{r.covers}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em',
  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5,
}
