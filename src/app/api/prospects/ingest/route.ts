import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Ingestion des prospects trouvés par la tâche quotidienne (Cowork).
// Auth par secret partagé (header x-ingest-secret == PROSPECTS_INGEST_SECRET).
// Seules les colonnes "données" sont écrites : les statuts/notes existants sont préservés.

const DATA_COLUMNS = [
  'id', 'ajoute', 'nom', 'ville', 'priorite', 'adresse', 'tel', 'email', 'contact',
  'contexte', 'resa', 'resa_prix', 'site', 'site_url', 'heberg', 'angle', 'conf', 'objet', 'corps',
] as const

type IncomingProspect = Record<string, unknown>

export async function POST(request: NextRequest) {
  const secret = process.env.PROSPECTS_INGEST_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Ingestion non configurée (PROSPECTS_INGEST_SECRET manquant).' }, { status: 500 })
  }
  if (request.headers.get('x-ingest-secret') !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { prospects?: unknown })?.prospects)
      ? (body as { prospects: unknown[] }).prospects
      : null

  if (!list) {
    return NextResponse.json({ error: 'Attendu : un tableau de prospects (ou { prospects: [...] }).' }, { status: 400 })
  }
  if (list.length > 200) {
    return NextResponse.json({ error: 'Trop de prospects en une requête (max 200).' }, { status: 400 })
  }

  const rows = (list as IncomingProspect[])
    .filter(p => typeof p?.id === 'string' && typeof p?.nom === 'string')
    .map(p => {
      const row: Record<string, unknown> = {}
      for (const col of DATA_COLUMNS) {
        if (col === 'ajoute') {
          const v = p[col]
          row[col] = typeof v === 'string' && v.trim() ? v : null
        } else {
          row[col] = p[col] ?? null
        }
      }
      return row
    })

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Aucun prospect valide (id + nom requis).' }, { status: 400 })
  }

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // upsert sur l'id : insère les nouveaux, met à jour les données des existants
  // sans toucher aux colonnes de suivi (statut, notes, hidden…) absentes du payload.
  const { error } = await admin.from('prospects').upsert(rows, { onConflict: 'id' })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, upserted: rows.length })
}
