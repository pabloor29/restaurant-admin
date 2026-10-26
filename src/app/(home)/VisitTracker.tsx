"use client"

import { useEffect } from 'react'

// Logs one landing-page visit per browser session. Uses sessionStorage so a
// reload or re-render doesn't spam the log, and sendBeacon so the request
// survives the page being closed right after load.
export default function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('resa_visit_logged')) return
    sessionStorage.setItem('resa_visit_logged', '1')

    const payload = JSON.stringify({ path: window.location.pathname })
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        })
      }
    } catch {
      // tracking must never break the page
    }
  }, [])

  return null
}
