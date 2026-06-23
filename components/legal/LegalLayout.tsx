import Link from 'next/link'

type Props = {
  title: string
  updatedAt: string
  children: React.ReactNode
}

export default function LegalLayout({ title, updatedAt, children }: Props) {
  return (
    <div className="min-h-screen bg-secondary" style={{ backgroundColor: 'var(--paper)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="flex items-center justify-between" style={{ maxWidth: 880, margin: '0 auto', padding: '18px 24px' }}>
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--pine)' }}
            >
              <span className="font-primary" style={{ fontSize: '1.25rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>R</span>
            </div>
            <span className="font-primary" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              RESA<span style={{ color: 'var(--amber)' }}>.</span>
            </span>
          </Link>
          <nav className="flex gap-5 font-secondary" style={{ fontSize: '0.85rem' }}>
            <Link href="/mentions-legales" style={{ color: 'var(--slate)' }}>Mentions légales</Link>
            <Link href="/cgv" style={{ color: 'var(--slate)' }}>CGV</Link>
            <Link href="/contrat-abonnement" style={{ color: 'var(--slate)' }}>Contrat</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 className="font-primary" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.025em', marginBottom: 12 }}>
          {title}
        </h1>
        <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 40 }}>
          Dernière mise à jour&nbsp;: {updatedAt}
        </p>
        <article className="legal-content font-secondary" style={{ color: 'var(--ink)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {children}
        </article>
      </main>
    </div>
  )
}
