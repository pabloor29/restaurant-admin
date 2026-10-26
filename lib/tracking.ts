import type { NextRequest } from 'next/server'
import { promises as dns } from 'dns'

export type VisitorMeta = {
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  user_agent: string | null
  device: string
  is_bot: boolean
  referer: string | null
}

// Pull the visitor fingerprint from the request. On Vercel the geolocation is
// injected as `x-vercel-ip-*` headers; the client IP is the first entry of
// `x-forwarded-for`. Locally these are absent, so everything degrades to null.
export function readVisitorMeta(request: NextRequest): VisitorMeta {
  const h = request.headers
  const fwd = h.get('x-forwarded-for')
  const ip =
    (fwd ? fwd.split(',')[0].trim() : null) ||
    h.get('x-real-ip') ||
    null

  const ua = h.get('user-agent')
  const decode = (v: string | null) => {
    if (!v) return null
    try { return decodeURIComponent(v) } catch { return v }
  }

  return {
    ip,
    country: h.get('x-vercel-ip-country'),
    region: decode(h.get('x-vercel-ip-country-region')),
    city: decode(h.get('x-vercel-ip-city')),
    user_agent: ua,
    device: describeDevice(ua),
    is_bot: looksLikeBot(ua),
    referer: h.get('referer'),
  }
}

const BOT_RE =
  /bot|crawl|spider|slurp|curl|wget|python-requests|httpclient|headless|phantom|scrapy|axios|go-http|java\/|libwww|okhttp/i

export function looksLikeBot(ua: string | null): boolean {
  if (!ua) return true // no UA at all → almost always a script
  return BOT_RE.test(ua)
}

// Compact, human-readable device label for the admin list and notif email.
export function describeDevice(ua: string | null): string {
  if (!ua) return 'inconnu'
  if (looksLikeBot(ua)) {
    const m = ua.match(BOT_RE)
    return `bot (${m ? m[0].toLowerCase() : 'script'})`
  }

  let os = 'ordinateur'
  if (/iphone/i.test(ua)) os = 'iPhone'
  else if (/ipad/i.test(ua)) os = 'iPad'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac os x|macintosh/i.test(ua)) os = 'Mac'
  else if (/linux/i.test(ua)) os = 'Linux'

  let browser = ''
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua)) browser = 'Safari'

  return browser ? `${os} · ${browser}` : os
}

// A short list of throwaway / disposable mailbox providers. Not exhaustive —
// it only catches the obvious ones; the MX check below does the heavy lifting.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'yopmail.com', 'yopmail.fr', 'guerrillamail.com',
  'guerrillamail.info', 'sharklasers.com', 'trashmail.com', 'getnada.com',
  '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'throwawaymail.com',
  'maildrop.cc', 'mailnesia.com', 'dispostable.com', 'fakeinbox.com',
])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type EmailCheck = { valid: boolean; reason: string | null }

// Validate an address beyond syntax: the domain must actually be able to
// receive mail (it must publish MX, or at least A/AAAA, records). This is what
// weeds out the "improbable, non-existent" addresses — e.g. `azerty@xyz.qq`.
export async function checkEmail(email: string): Promise<EmailCheck> {
  const addr = (email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(addr)) return { valid: false, reason: 'syntaxe' }

  const domain = addr.split('@')[1]
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, reason: 'jetable' }

  try {
    const mx = await withTimeout(dns.resolveMx(domain), 3000)
    if (mx && mx.length > 0) return { valid: true, reason: null }
  } catch {
    // fall through to the A/AAAA fallback
  }

  // Some valid domains accept mail without MX, relying on their A record.
  try {
    const a = await withTimeout(dns.resolve(domain), 3000)
    if (a && a.length > 0) return { valid: true, reason: null }
  } catch {
    // no records at all
  }

  return { valid: false, reason: 'domaine_inexistant' }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('dns_timeout')), ms)),
  ])
}
