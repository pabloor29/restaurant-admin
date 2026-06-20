'use client'

import { useEffect, useRef } from 'react'
import './HeroMotion.css'

export function HeroMotion() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const q = <T extends Element = HTMLElement>(sel: string) =>
      root.querySelector(sel) as T | null
    const qa = <T extends Element = HTMLElement>(sel: string) =>
      Array.from(root.querySelectorAll(sel)) as T[]

    const app = q('#hm-app')!
    const cur = q('#hm-cur')!
    const v1 = q('#hm-v1')
    const v3 = q('#hm-v3')
    const v4 = q('#hm-v4')
    const modal = q('#hm-modal')!
    const toast = q('#hm-toast')!
    const addBtn = q('#hm-addBtn')!
    const confirmBtn = q('#hm-confirmBtn')!
    const allNavs = ['hm-ni-db', 'hm-ni-res', 'hm-ni-menu', 'hm-ni-team', 'hm-ni-an']
      .map(id => q('#' + id)!) as HTMLElement[]
    const scs = [0, 1, 2, 3].map(i => q('#hm-sc' + i)!) as HTMLElement[]
    const trs = [0, 1, 2, 3, 4].map(i => q('#hm-tr' + i)!) as HTMLElement[]
    const trNew = q('#hm-tr-new') as HTMLElement
    const fn = q<HTMLInputElement>('#hm-fn')!
    const fc = q<HTMLInputElement>('#hm-fc')!
    const fh = q<HTMLInputElement>('#hm-fh')!
    const fo = q<HTMLInputElement>('#hm-fo')!
    const rbs = qa('.hm-rb')
    const bars = [0, 1, 2, 3, 4, 5, 6].map(i => q('#hm-b' + i)!) as HTMLElement[]
    const revEl = q('#hm-rev')!
    const rescountEl = q('#hm-rescount')!
    const occEl = q('#hm-occ')!

    let cancelled = false
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const rafs = new Set<number>()

    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        const id = setTimeout(() => {
          timers.delete(id)
          resolve()
        }, ms)
        timers.add(id)
      })

    const W = () => app.getBoundingClientRect()

    const mc = (xp: number, yp: number) => {
      const r = W()
      cur.style.left = r.left + (r.width * xp) / 100 - 7 + 'px'
      cur.style.top = r.top + (r.height * yp) / 100 - 7 + 'px'
    }

    const click = async (el: HTMLElement | null) => {
      el?.classList.add('hm-hl')
      cur.classList.add('hm-click')
      await wait(280)
      cur.classList.remove('hm-click')
      el?.classList.remove('hm-hl')
    }

    const setNav = (idx: number) => {
      allNavs.forEach((n, i) => n.classList.toggle('hm-act', i === idx))
    }

    const focusField = (f: HTMLInputElement) => {
      ;[fn, fc, fh, fo].forEach(x => x.classList.remove('hm-fc'))
      f.classList.add('hm-fc')
    }

    const type = async (f: HTMLInputElement, text: string, speed = 65) => {
      focusField(f)
      f.value = ''
      for (const ch of text) {
        if (cancelled) return
        f.value += ch
        await wait(speed)
      }
    }

    const showView = (v: HTMLElement | null) => {
      ;[v1, v3, v4].forEach(x => x?.classList.remove('hm-on'))
      v?.classList.add('hm-on')
    }

    const counter = (el: HTMLElement, to: number, fmt: (v: number) => string) => {
      const start = Date.now()
      const tick = () => {
        if (cancelled) return
        const t = Math.min((Date.now() - start) / 1600, 1)
        const e = 1 - Math.pow(1 - t, 3)
        const v = Math.round(to * e)
        el.textContent = fmt(v)
        if (t < 1) {
          const id = requestAnimationFrame(tick)
          rafs.add(id)
        }
      }
      const id = requestAnimationFrame(tick)
      rafs.add(id)
    }

    const animateCounters = () => {
      counter(revEl, 48240, v => v.toLocaleString('fr-FR') + ' €')
      counter(rescountEl, 1247, v => v.toLocaleString('fr-FR'))
      counter(occEl, 87, v => v + '%')
    }

    const animateBars = () => {
      bars.forEach((b, i) => {
        const id = setTimeout(() => {
          b.style.height = (b.dataset.h ?? '0') + '%'
          timers.delete(id)
        }, i * 90)
        timers.add(id)
      })
    }
    const resetBars = () => bars.forEach(b => (b.style.height = '0%'))
    const showBlocks = () => {
      rbs.forEach((b, i) => {
        const id = setTimeout(() => {
          b.classList.add('hm-on')
          timers.delete(id)
        }, i * 110)
        timers.add(id)
      })
    }
    const hideBlocks = () => rbs.forEach(b => b.classList.remove('hm-on'))

    const run = async (): Promise<void> => {
      if (cancelled) return
      cur.classList.add('hm-show')

      setNav(0)
      showView(v1)
      mc(65, 50)
      await wait(350)
      scs.forEach((s, i) => {
        const id = setTimeout(() => {
          s.classList.add('hm-on')
          timers.delete(id)
        }, i * 90)
        timers.add(id)
      })
      await wait(600)
      trs.forEach((r, i) => {
        const id = setTimeout(() => {
          r.classList.add('hm-on')
          timers.delete(id)
        }, i * 100)
        timers.add(id)
      })
      await wait(1600)

      mc(83, 10)
      await wait(650)
      await click(addBtn)
      await wait(300)

      modal.classList.add('hm-on')
      mc(60, 50)
      await wait(550)

      mc(55, 38); await wait(300)
      await type(fn, 'Sophie Martin', 68)
      await wait(180)

      mc(38, 52); await wait(280)
      await type(fc, '4', 120)
      await wait(120)

      mc(58, 52); await wait(280)
      await type(fh, '21h30', 90)
      await wait(200)

      mc(55, 63); await wait(280)
      await type(fo, 'Allergie poisson', 58)
      await wait(350)

      mc(62, 77); await wait(380)
      await click(confirmBtn)
      await wait(200)

      modal.classList.remove('hm-on')
      ;[fn, fc, fh, fo].forEach(f => {
        f.value = ''
        f.classList.remove('hm-fc')
      })

      await wait(280)
      toast.classList.add('hm-on')
      trNew.style.display = 'grid'
      await wait(50)
      trNew.classList.add('hm-on')

      await wait(1400)
      toast.classList.remove('hm-on')
      await wait(700)

      setNav(1)
      v1?.classList.remove('hm-on')
      await wait(80)
      hideBlocks()
      v3?.classList.add('hm-on')
      mc(50, 50)
      await wait(350)
      showBlocks()
      await wait(2800)

      setNav(4)
      v3?.classList.remove('hm-on')
      await wait(80)
      v4?.classList.add('hm-on')
      mc(50, 60)
      await wait(350)
      animateCounters()
      await wait(400)
      animateBars()
      await wait(3000)

      if (!v4) return
      v4.style.transition = 'opacity .5s ease'
      v4.style.opacity = '0'
      cur.style.opacity = '0'
      await wait(500)

      v4.classList.remove('hm-on')
      v4.style.opacity = ''
      v4.style.transition = ''
      cur.style.opacity = ''

      revEl.textContent = '0 €'
      rescountEl.textContent = '0'
      occEl.textContent = '0%'
      resetBars()

      scs.forEach(s => s.classList.remove('hm-on'))
      trs.forEach(r => r.classList.remove('hm-on'))
      trNew.style.display = 'none'
      trNew.classList.remove('hm-on')

      await wait(250)
      run()
    }

    const bootId = setTimeout(() => {
      app.classList.add('hm-ready')
      const startId = setTimeout(() => {
        timers.delete(startId)
        run()
      }, 900)
      timers.add(startId)
      timers.delete(bootId)
    }, 400)
    timers.add(bootId)

    return () => {
      cancelled = true
      timers.forEach(t => clearTimeout(t))
      timers.clear()
      rafs.forEach(id => cancelAnimationFrame(id))
      rafs.clear()
    }
  }, [])

  return (
    <div className="hm-root" ref={rootRef}>
      <div className="hm-bg" />
      <div className="hm-bg-dots" />
      <div className="hm-bg-glow" />

      <div className="hm-app" id="hm-app">
        <div className="hm-topbar"><div className="hm-topbar-url">app.resa.fr</div></div>

        <div className="hm-sidebar">
          <div className="hm-sb-logo">
            <div className="hm-sb-logo-icon">R</div>
            <span className="hm-sb-logo-name">RESA</span>
          </div>
          <nav className="hm-sb-nav">
            <div className="hm-ni" id="hm-ni-db">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              Tableau de bord
            </div>
            <div className="hm-ni" id="hm-ni-res">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Réservations
            </div>
            <div className="hm-ni" id="hm-ni-menu">
              <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              Menu
            </div>
            <div className="hm-ni" id="hm-ni-team">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Équipe
            </div>
            <div className="hm-ni" id="hm-ni-an">
              <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
              Analytiques
            </div>
          </nav>
          <div className="hm-sb-bottom">
            <div className="hm-sb-avatar">PO</div>
            <div>
              <div className="hm-sb-user-name">Pablo Ortega</div>
              <div className="hm-sb-user-role">Gérant</div>
            </div>
          </div>
        </div>

        <div className="hm-main">
          {/* VIEW 1: Dashboard */}
          <div className="hm-view" id="hm-v1">
            <div className="hm-vh">
              <div>
                <div className="hm-vh-title">Tableau de bord</div>
                <div className="hm-vh-sub">Jeudi 19 juin 2025</div>
              </div>
              <button className="hm-add-btn" id="hm-addBtn">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Réservation
              </button>
            </div>
            <div className="hm-stats">
              <div className="hm-sc" id="hm-sc0"><div className="hm-sc-num">42</div><div className="hm-sc-label">Réservations</div><div className="hm-sc-trend">↑ +8 vs hier</div></div>
              <div className="hm-sc" id="hm-sc1"><div className="hm-sc-num">156</div><div className="hm-sc-label">Couverts</div><div className="hm-sc-trend">↑ +14 vs hier</div></div>
              <div className="hm-sc" id="hm-sc2"><div className="hm-sc-num hm-am">89%</div><div className="hm-sc-label">Occupation</div><div className="hm-sc-trend">↑ +5pts</div></div>
              <div className="hm-sc" id="hm-sc3"><div className="hm-sc-num">2 840€</div><div className="hm-sc-label">CA du jour</div><div className="hm-sc-trend">↑ estimé</div></div>
            </div>
            <div className="hm-tcard">
              <div className="hm-thead"><div className="hm-th">Heure</div><div className="hm-th">Client</div><div className="hm-th">Couverts</div><div className="hm-th">Statut</div></div>
              <div className="hm-tr" id="hm-tr0"><div className="hm-tc hm-t">19h00</div><div className="hm-tc">Famille Martin</div><div className="hm-tc hm-cv">6 pers.</div><div className="hm-tc"><span className="hm-badge hm-b-ok">● Confirmé</span></div></div>
              <div className="hm-tr" id="hm-tr1"><div className="hm-tc hm-t">19h30</div><div className="hm-tc">M. Leconte</div><div className="hm-tc hm-cv">2 pers.</div><div className="hm-tc"><span className="hm-badge hm-b-warn">● En attente</span></div></div>
              <div className="hm-tr" id="hm-tr2"><div className="hm-tc hm-t">20h00</div><div className="hm-tc">Sophie & Paul</div><div className="hm-tc hm-cv">4 pers.</div><div className="hm-tc"><span className="hm-badge hm-b-ok">● Confirmé</span></div></div>
              <div className="hm-tr" id="hm-tr3"><div className="hm-tc hm-t">20h30</div><div className="hm-tc">Table Dupont</div><div className="hm-tc hm-cv">3 pers.</div><div className="hm-tc"><span className="hm-badge hm-b-ok">● Confirmé</span></div></div>
              <div className="hm-tr" id="hm-tr4"><div className="hm-tc hm-t">21h00</div><div className="hm-tc">Rés. en ligne</div><div className="hm-tc hm-cv">5 pers.</div><div className="hm-tc"><span className="hm-badge hm-b-warn">● En attente</span></div></div>
              <div className="hm-tr hm-new-row" id="hm-tr-new" style={{ display: 'none' }}><div className="hm-tc hm-t">21h30</div><div className="hm-tc">Sophie Martin</div><div className="hm-tc hm-cv">4 pers.</div><div className="hm-tc"><span className="hm-badge hm-b-ok">● Confirmé</span></div></div>
            </div>
          </div>

          {/* VIEW 3: Calendar */}
          <div className="hm-view" id="hm-v3">
            <div className="hm-cal-header">
              <div>
                <div className="hm-vh-title">Calendrier</div>
                <div className="hm-vh-sub">Semaine du 16 au 22 juin 2025</div>
              </div>
              <div className="hm-cal-tabs"><div className="hm-cal-tab hm-act">Semaine</div><div className="hm-cal-tab">Mois</div></div>
            </div>
            <div className="hm-wgrid">
              <div style={{ borderBottom: '1px solid var(--border-soft)', borderRight: '1px solid var(--border-soft)' }} />
              <div className="hm-wdh"><div className="hm-wdn">Lun</div><div className="hm-wdd">16</div></div>
              <div className="hm-wdh"><div className="hm-wdn">Mar</div><div className="hm-wdd">17</div></div>
              <div className="hm-wdh"><div className="hm-wdn">Mer</div><div className="hm-wdd">18</div></div>
              <div className="hm-wdh"><div className="hm-wdn">Jeu</div><div className="hm-wdd hm-tod">19<div className="hm-wdd-today-dot" /></div></div>
              <div className="hm-wdh"><div className="hm-wdn">Ven</div><div className="hm-wdd">20</div></div>
              <div className="hm-wdh"><div className="hm-wdn">Sam</div><div className="hm-wdd">21</div></div>
              <div className="hm-wdh"><div className="hm-wdn">Dim</div><div className="hm-wdd">22</div></div>

              <div className="hm-tcol"><span className="hm-tlabel">19h</span></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb0" style={{ top: 2, height: 30 }}>Martin 6p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb1" style={{ top: 2, height: 30 }}>Renaud 4p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb2" style={{ top: 2, height: 30 }}>Martin 6p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb3" style={{ top: 2, height: 64 }}>Banquet 12p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>

              <div className="hm-tcol"><span className="hm-tlabel">20h</span></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-amb" id="hm-rb4" style={{ top: 2, height: 30 }}>Leconte 2p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb5" style={{ top: 2, height: 30 }}>Sophie P 4p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb6" style={{ top: 2, height: 30 }}>Dupont 3p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-amb" id="hm-rb7" style={{ top: 2, height: 64 }}>Rés. web 5p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb8" style={{ top: 2, height: 30 }}>Moreau 4p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>

              <div className="hm-tcol"><span className="hm-tlabel">21h</span></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-amb" id="hm-rb9" style={{ top: 2, height: 30 }}>Bernard 3p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb10" style={{ top: 2, height: 30 }}>Petit 2p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb11" style={{ top: 2, height: 30 }}>Martin 4p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /><div className="hm-rb hm-pine" id="hm-rb12" style={{ top: 2, height: 30 }}>Groupe 8p</div></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>
              <div className="hm-dcol"><div className="hm-dslot" /></div>
            </div>
          </div>

          {/* VIEW 4: Analytics */}
          <div className="hm-view" id="hm-v4">
            <div className="hm-an-header">
              <div>
                <div className="hm-vh-title">Analytiques</div>
                <div className="hm-vh-sub">Juin 2025</div>
              </div>
              <div className="hm-cal-tabs"><div className="hm-cal-tab hm-act">Ce mois</div><div className="hm-cal-tab">Trimestre</div></div>
            </div>
            <div className="hm-metrics">
              <div className="hm-mc"><div className="hm-mc-label">Chiffre d&apos;affaires</div><div className="hm-mc-val hm-pine" id="hm-rev">0 €</div><div className="hm-mc-sub">↑ +12% vs juin 2024</div></div>
              <div className="hm-mc"><div className="hm-mc-label">Réservations</div><div className="hm-mc-val" id="hm-rescount">0</div><div className="hm-mc-sub">↑ +18% vs juin 2024</div></div>
              <div className="hm-mc"><div className="hm-mc-label">Taux d&apos;occupation</div><div className="hm-mc-val hm-am" id="hm-occ">0%</div><div className="hm-mc-sub">↑ +5pts vs juin 2024</div></div>
            </div>
            <div className="hm-chart-card">
              <div className="hm-chart-title">Chiffre d&apos;affaires — Semaine du 16 juin</div>
              <div className="hm-chart-area">
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf" id="hm-b0" data-h="62" /></div><div className="hm-blabel">Lun</div></div>
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf" id="hm-b1" data-h="74" /></div><div className="hm-blabel">Mar</div></div>
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf" id="hm-b2" data-h="55" /></div><div className="hm-blabel">Mer</div></div>
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf hm-am" id="hm-b3" data-h="88" /></div><div className="hm-blabel hm-hi">Jeu</div></div>
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf" id="hm-b4" data-h="93" /></div><div className="hm-blabel">Ven</div></div>
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf" id="hm-b5" data-h="100" /></div><div className="hm-blabel" style={{ fontWeight: 600 }}>Sam</div></div>
                <div className="hm-bg-grp"><div className="hm-bar"><div className="hm-bf hm-am" id="hm-b6" data-h="76" /></div><div className="hm-blabel">Dim</div></div>
              </div>
            </div>
          </div>

          {/* Modal */}
          <div className="hm-modal-bg" id="hm-modal">
            <div className="hm-modal">
              <div className="hm-modal-title">Nouvelle réservation</div>
              <div className="hm-fg"><label className="hm-fl">Nom du client</label><input className="hm-fi" id="hm-fn" type="text" placeholder="Nom..." readOnly /></div>
              <div className="hm-frow">
                <div><label className="hm-fl">Couverts</label><input className="hm-fi" id="hm-fc" type="text" placeholder="Nb." readOnly /></div>
                <div><label className="hm-fl">Heure</label><input className="hm-fi" id="hm-fh" type="text" placeholder="hh:mm" readOnly /></div>
              </div>
              <div className="hm-fg"><label className="hm-fl">Notes</label><input className="hm-fi" id="hm-fo" type="text" placeholder="Informations..." readOnly /></div>
              <div className="hm-mactions">
                <button className="hm-btn-c">Annuler</button>
                <button className="hm-btn-ok" id="hm-confirmBtn">Confirmer</button>
              </div>
            </div>
          </div>

          {/* Toast */}
          <div className="hm-toast" id="hm-toast">
            <div className="hm-t-icon">
              <svg width="11" height="11" fill="none" stroke="var(--ok-t)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <div className="hm-t-title">Réservation confirmée</div>
              <div className="hm-t-sub">Sophie Martin · 21h30 · 4 pers.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hm-cursor" id="hm-cur" />
    </div>
  )
}
