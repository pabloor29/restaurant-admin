import Link from 'next/link'
import ContactForm from './ContactForm'
import { HeroVideo } from '../../components/HeroVideo'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="14" rx="3" stroke="#13503B" strokeWidth="1.6"/>
        <path d="M6 8h8M6 11.5h5" stroke="#13503B" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Site web sur-mesure',
    desc: 'Un site restaurant conçu à votre image, adapté à tous les écrans.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" stroke="#13503B" strokeWidth="1.6"/>
        <path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#13503B" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Réservations en ligne',
    desc: 'Vos clients réservent en quelques clics. Confirmation par mail automatique.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.4 7.3H18L13.4 10.7L15.3 16L10 12.8L4.7 16L6.6 10.7L2 7.3H7.6L10 2Z" stroke="#13503B" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Référencement (SEO)',
    desc: 'Optimisation pour apparaître en tête des résultats Google.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#13503B" strokeWidth="1.6"/>
        <path d="M7 10l2.5 2.5L13 7.5" stroke="#C77E3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Hébergement & maintenance',
    desc: 'Votre site hébergé, maintenu et mis à jour. Zéro souci technique.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#13503B" strokeWidth="1.6"/>
        <path d="M10 6v4l3 2" stroke="#13503B" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Espace d'administration",
    desc: 'Gérez horaires, menus, congés et évènements depuis un seul endroit.',
  },
]

const PARTNERS: { name: string; src: string; alt: string; url: string; desc: string }[] = [
  { name: 'Carbo', src: '/partenaires/CARBO-LOGO-4.webp', alt: 'Carbo', url: 'https://www.restaurant-carbo.fr/', desc: 'Restaurant partenaire RESA.' },
  { name: 'Floridablanca', src: '/partenaires/logo-blue.webp', alt: 'Floridablanca', url: 'https://www.floridablanca.fr/', desc: 'Restaurant partenaire RESA.' },
  { name: "L'Atelier de l'Écharpe", src: '/partenaires/logo-red.png', alt: "L'Atelier de l'Écharpe", url: 'https://www.latelierdelecharpe.fr/', desc: 'Restaurant partenaire RESA.' },
  { name: 'Bocante', src: '/partenaires/logo-cut.webp', alt: 'Bocante', url: 'https://www.bocante.com/', desc: 'Restaurant partenaire RESA.' },
]

const ADMIN_FEATURES = [
  { label: 'Horaires', desc: 'Définissez vos créneaux du midi et du soir pour chaque jour.' },
  { label: 'Fermetures', desc: 'Bloquez des dates sur un calendrier visuel en un clic.' },
  { label: 'Congés', desc: "Planifiez vos périodes de fermeture à l'avance." },
  { label: 'Menus', desc: 'Publiez vos menus (images, PDF) par catégorie.' },
  { label: 'Formules', desc: 'Créez des formules de groupe avec prix et description.' },
  { label: 'Évènements', desc: 'Annoncez vos soirées et évènements avec visuels.' },
]

function AdminMockup() {
  return (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px rgba(22,32,27,0.08)' }}>
      <div style={{ backgroundColor: 'var(--paper)', borderBottom: '1px solid var(--border)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FFB347', '#90D4A3', '#F08080'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />)}
        </div>
        <div style={{ flex: 1, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-secondary)' }}>
          resa-service.com/restaurant/…/horaires
        </div>
      </div>
      <div style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'var(--pine)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--paper)', fontFamily: 'var(--font-primary)', fontWeight: 800, fontSize: '0.9rem' }}>R</span>
            </div>
            <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Le Bistrot Parisien</span>
          </div>
          <span style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.75rem', color: 'var(--slate)' }}>Déconnexion</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {['Horaires', 'Fermetures', 'Congés', 'Formules', 'Menus'].map((tab, i) => (
            <span key={tab} style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.78rem', padding: '6px 12px', color: i === 0 ? 'var(--pine)' : 'var(--slate)', fontWeight: i === 0 ? 600 : 400, borderBottom: i === 0 ? '2px solid var(--pine)' : '2px solid transparent' }}>{tab}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 20px', backgroundColor: 'var(--paper)' }}>
        <p style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>HORAIRES D&apos;OUVERTURE</p>
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {[
            { day: 'Lundi',    midi: '12:00 – 14:00', soir: '19:30 – 22:00' },
            { day: 'Mardi',    midi: '12:00 – 14:00', soir: '19:30 – 22:00' },
            { day: 'Mercredi', midi: '—',             soir: '19:30 – 22:00' },
          ].map((row, i) => (
            <div key={row.day} style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', borderBottom: i < 2 ? '1px solid var(--border-soft)' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.78rem', color: 'var(--ink)', fontWeight: 500, width: 72 }}>{row.day}</span>
              <span style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.72rem', color: 'var(--slate)', flex: 1 }}>Midi : {row.midi}</span>
              <span style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.72rem', color: 'var(--slate)' }}>Soir : {row.soir}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 8, padding: '7px 14px', fontFamily: 'var(--font-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
            Enregistrer les horaires
          </span>
        </div>
      </div>
    </div>
  )
}

function ReservationMockup() {
  const reservations = [
    { name: 'Famille Martin', covers: 4, time: '19h30', table: 12, status: 'Confirmée', tc: 'var(--status-ok-text)', bc: 'var(--status-ok-bg)' },
    { name: 'Sophie Bernard', covers: 2, time: '20h00', table: 5,  status: 'En attente', tc: 'var(--status-warn-text)', bc: 'var(--status-warn-bg)' },
    { name: 'Groupe Dupont',  covers: 8, time: '20h30', table: 20, status: 'Confirmée', tc: 'var(--status-ok-text)', bc: 'var(--status-ok-bg)' },
  ]
  return (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px rgba(22,32,27,0.08)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Réservations du soir</p>
        <p style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.78rem', color: 'var(--slate)', marginTop: 2 }}>Vendredi 20 juin · Service du soir</p>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reservations.map(r => (
          <div key={r.name} style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--pine)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'var(--paper)', fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{r.name[0]}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 600 }}>{r.name}</p>
              <p style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.72rem', color: 'var(--slate)' }}>{r.covers} couverts · {r.time} · Table {r.table}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-secondary)', fontSize: '0.7rem', fontWeight: 600, color: r.tc, backgroundColor: r.bc, padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne un système de réservation en ligne pour restaurant ?',
    a: "Le formulaire de réservation est intégré directement à votre site web. Vos clients choisissent une date, un horaire et un nombre de couverts ; chaque réservation déclenche automatiquement un e-mail de confirmation. Vos horaires, fermetures et congés sont respectés en temps réel, sans intervention de votre part.",
  },
  {
    q: "Combien coûte un site web avec réservations en ligne pour un restaurant ?",
    a: "RESA propose un abonnement unique à 67 €/mois, engagement 1 an, qui inclut le site web sur-mesure, le système de réservation en ligne, l'hébergement, la maintenance et le référencement (SEO). Une formule site vitrine sans réservation est aussi disponible sur demande.",
  },
  {
    q: 'RESA gère-t-il le référencement (SEO) de mon restaurant sur Google ?',
    a: "Oui. L'optimisation pour le référencement naturel (SEO) est incluse : structure technique, balises, vitesse de chargement et données structurées pour aider votre restaurant à apparaître dans les résultats Google lorsque des clients recherchent un restaurant ou une table près de chez eux.",
  },
  {
    q: 'Puis-je modifier mes horaires, menus et congés moi-même ?',
    a: "Oui. Votre espace d'administration vous permet de mettre à jour vos horaires, menus, formules de groupe, fermetures, congés et évènements à tout moment, depuis un seul endroit, sans nous contacter.",
  },
  {
    q: 'Ai-je besoin de compétences techniques pour gérer mon site de restaurant ?',
    a: "Non. L'espace d'administration est pensé pour être rapide et intuitif, sans aucune formation. Vous gérez votre restaurant ; RESA s'occupe de toute la technique (hébergement, maintenance, mises à jour).",
  },
  {
    q: 'En combien de temps mon restaurant est-il en ligne ?',
    a: "La mise en ligne se fait généralement en moins de 2 semaines : un premier échange gratuit, la création du site sur-mesure et la configuration du système de réservation, puis l'accès à votre espace d'administration.",
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://resa-service.com/#organization',
      name: 'RESA',
      url: 'https://resa-service.com',
      logo: 'https://resa-service.com/favicon.svg',
      description:
        "RESA crée le site web de votre restaurant, gère les réservations en ligne et centralise l'administration.",
      areaServed: { '@type': 'Country', name: 'France' },
      knowsAbout: [
        'création de site web pour restaurant',
        'système de réservation en ligne pour restaurant',
        'référencement SEO pour restaurant',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://resa-service.com/#website',
      url: 'https://resa-service.com',
      name: 'RESA',
      inLanguage: 'fr-FR',
      publisher: { '@id': 'https://resa-service.com/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'RESA',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://resa-service.com',
      description:
        "Plateforme tout-en-un pour restaurants : site web sur-mesure, réservations en ligne, gestion des horaires, menus, congés et évènements.",
      areaServed: { '@type': 'Country', name: 'France' },
      offers: {
        '@type': 'Offer',
        price: '67',
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '67',
          priceCurrency: 'EUR',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
        },
        url: 'https://resa-service.com/subscribe',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://resa-service.com/#faq',
      mainEntity: FAQ_ITEMS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
}

export default function HomePage() {
  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'var(--pine)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-primary" style={{ fontSize: '1.2rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>R</span>
            </div>
            <span className="font-primary" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              RESA<span style={{ color: 'var(--amber)' }}>.</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="lp-nav-mid" style={{ gap: 16 }}>
              <Link href="#offre" className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)', textDecoration: 'none' }}>L&apos;offre</Link>
              <Link href="#fonctionnalites" className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)', textDecoration: 'none' }}>Fonctionnalités</Link>
              <Link href="#tarif" className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)', textDecoration: 'none' }}>Tarif</Link>
              <Link href="#faq" className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)', textDecoration: 'none' }}>FAQ</Link>
              <Link href="#contact" className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)', textDecoration: 'none' }}>Contact</Link>
            </div>
            <Link href="/login" className="font-secondary" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--paper)', backgroundColor: 'var(--pine)', padding: '8px 18px', borderRadius: 10, textDecoration: 'none' }}>
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px,8vw,80px) 24px 40px' }}>
        <div className="lp-grid-2" style={{ gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
          {/* Texte */}
          <div>
            <p className="font-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--pine)', fontWeight: 600, marginBottom: 16 }}>
              DÉVELOPPEUR WEB · RESTAURATEURS
            </p>
            <h1 className="font-primary" style={{ fontSize: 'clamp(2.4rem,6vw,4.2rem)', lineHeight: 0.95, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--ink)', marginBottom: 24 }}>
              Le site web et les réservations en ligne de votre restaurant.
            </h1>
            <p className="font-secondary" style={{ fontSize: '1.05rem', color: 'var(--slate)', lineHeight: 1.6, marginBottom: 36 }}>
              Site web sur-mesure, réservations automatisées et espace d&apos;administration — tout-en-un, sans abonnement complexe.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="#offre" className="font-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--paper)', backgroundColor: 'var(--pine)', padding: '13px 28px', borderRadius: 10, textDecoration: 'none' }}>
                Découvrir l&apos;offre →
              </Link>
              <Link href="#fonctionnalites" className="font-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--pine)', padding: '12px 20px', borderRadius: 10, textDecoration: 'none', border: '1.5px solid var(--pine)' }}>
                Voir les fonctionnalités
              </Link>
            </div>
          </div>

          {/* VSL vertical */}
          <div style={{
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(22,32,27,0.18)',
            border: '1px solid var(--border)',
            aspectRatio: '9 / 16',
            maxWidth: 380,
            margin: '0 auto',
            backgroundColor: '#0C3528',
          }}>
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section aria-label="Partenaires" style={{ backgroundColor: 'var(--surface-alt)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
        <p className="font-secondary" style={{ textAlign: 'center', fontSize: '0.78rem', letterSpacing: '0.14em', color: 'var(--slate)', fontWeight: 600, marginBottom: 20 }}>Ces restaurants nous font confiance</p>
        <div className="partners-marquee">
          <div className="partners-track">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <img key={`${p.src}-${i}`} src={p.src} alt={p.alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* MOCKUPS */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px 64px' }}>
        <div className="lp-grid-2" style={{ gap: 20 }}>
          <div className="lp-hide-mobile"><AdminMockup /></div>
          <ReservationMockup />
        </div>
      </section>

      {/* OFFRE */}
      <section id="offre" style={{ backgroundColor: 'var(--pine)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(245,241,233,0.5)', fontWeight: 600, marginBottom: 12 }}>L&apos;OFFRE</p>
          <h2 className="font-primary" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--paper)', marginBottom: 48, lineHeight: 1.05 }}>
            Tout ce dont votre restaurant a besoin.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ backgroundColor: 'rgba(245,241,233,0.08)', border: '1px solid rgba(245,241,233,0.15)', borderRadius: 14, padding: '22px 24px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <p className="font-primary" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--paper)', marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</p>
                <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'rgba(245,241,233,0.65)', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIF */}
      <section id="tarif" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--pine)', fontWeight: 600, marginBottom: 12 }}>TARIF</p>
          <h2 className="font-primary" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 40, lineHeight: 1.1 }}>
            Un abonnement simple, tout inclus.
          </h2>
          <div style={{ maxWidth: 480 }}>
            <div style={{ backgroundColor: 'var(--pine)', borderRadius: 18, padding: 'clamp(24px,4vw,36px)', color: 'var(--paper)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                <span className="font-primary" style={{ fontSize: 'clamp(3rem,8vw,4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>67€</span>
                <span className="font-secondary" style={{ fontSize: '1rem', color: 'rgba(245,241,233,0.6)', marginBottom: 8 }}>/&nbsp;mois</span>
              </div>
              <p className="font-accent" style={{ fontSize: '0.95rem', color: 'var(--amber-bright)', marginBottom: 24 }}>
                Engagement 1 an
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {[
                  'Site web sur-mesure',
                  'Réservations en ligne + confirmations auto',
                  'Hébergement inclus',
                  'Maintenance & mises à jour incluses',
                  'Référencement (SEO) inclus',
                  'Espace d\'administration',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'rgba(245,241,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#F5F1E9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="font-secondary" style={{ fontSize: '0.875rem', color: 'rgba(245,241,233,0.85)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="#contact" className="font-secondary" style={{ display: 'inline-block', backgroundColor: 'var(--amber)', color: 'white', borderRadius: 10, padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                Démarrer mon projet →
              </Link>
            </div>
            <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
              Un site web vitrine sans réservation est également disponible — contactez-moi.
            </p>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS ADMIN */}
      <section id="fonctionnalites" style={{ padding: '80px 24px', backgroundColor: 'var(--paper)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--pine)', fontWeight: 600, marginBottom: 12 }}>ESPACE D&apos;ADMINISTRATION</p>
          <h2 className="font-primary" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 12, lineHeight: 1.1 }}>
            Tout gérer depuis un seul endroit.
          </h2>
          <p className="font-secondary" style={{ fontSize: '1rem', color: 'var(--slate)', marginBottom: 52, maxWidth: 500, lineHeight: 1.6 }}>
            Chaque fonctionnalité est conçue pour être rapide et intuitive — même sans formation.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {ADMIN_FEATURES.map((f, i) => (
              <div key={f.label} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span className="font-secondary" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--pine-light)', color: 'var(--pine)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <span className="font-primary" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{f.label}</span>
                </div>
                <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--slate)', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--pine)', fontWeight: 600, marginBottom: 12 }}>COMMENT ÇA MARCHE</p>
          <h2 className="font-primary" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 48, lineHeight: 1.1 }}>
            En 3 étapes, votre restaurant est en ligne.
          </h2>
          <div className="lp-grid-3" style={{ gap: 32 }}>
            {[
              { n: '01', title: 'On se rencontre', desc: 'Un échange pour comprendre votre restaurant, vos horaires, votre style.' },
              { n: '02', title: 'Je crée votre site', desc: 'Design sur-mesure, mise en ligne, système de réservation configuré.' },
              { n: '03', title: 'Vous gérez tout', desc: "Accès à l'espace admin pour mettre à jour menus, horaires et congés." },
            ].map(step => (
              <div key={step.n}>
                <span className="font-primary" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--border)', letterSpacing: '-0.04em', display: 'block', marginBottom: 16 }}>{step.n}</span>
                <p className="font-primary" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>{step.title}</p>
                <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RÉSERVATIONS AUTO */}
      <section style={{ backgroundColor: 'var(--paper)', padding: '72px 24px', borderTop: '1px solid var(--border)' }}>
        <div className="lp-grid-2" style={{ maxWidth: 1080, margin: '0 auto', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--amber)', fontWeight: 600, marginBottom: 12 }}>RÉSERVATIONS AUTOMATISÉES</p>
            <h2 className="font-primary" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 20, lineHeight: 1.1 }}>
              Vos clients réservent. Vous gérez.
            </h2>
            <p className="font-secondary" style={{ fontSize: '0.95rem', color: 'var(--slate)', lineHeight: 1.65, marginBottom: 28 }}>
              Le système de réservation est intégré directement à votre site. Chaque réservation déclenche automatiquement une confirmation par e-mail au client — sans aucune intervention de votre part.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Formulaire de réservation sur votre site', 'Confirmation automatique par e-mail', 'Fermetures respectées automatiquement', 'Gestion des congés et jours fériés'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--pine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#13503B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <ReservationMockup />
        </div>
      </section>

      {/* PARTENAIRES — DÉTAIL */}
      <section id="partenaires" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--pine)', fontWeight: 600, marginBottom: 12 }}>PARTENAIRES</p>
          <h2 className="font-primary" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 16, lineHeight: 1.1 }}>
            Ils nous ont fait confiance.
          </h2>
          <p className="font-secondary" style={{ fontSize: '0.95rem', color: 'var(--slate)', lineHeight: 1.65, marginBottom: 40, maxWidth: 640 }}>
            Découvrez les restaurants qui utilisent RESA au quotidien pour leur site et leurs réservations.
          </p>
          <div className="lp-grid-3" style={{ gap: 20 }}>
            {PARTNERS.map(p => (
              <a key={p.src} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 14, textDecoration: 'none', transition: 'border-color 0.2s, transform 0.2s' }}>
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={p.src} alt={p.alt} style={{ maxHeight: 64, maxWidth: '70%', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="font-primary" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{p.name}</p>
                  <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--slate)', lineHeight: 1.5, marginBottom: 12 }}>{p.desc}</p>
                  <span className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--pine)', fontWeight: 600 }}>Voir le site →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ backgroundColor: 'var(--paper)', borderTop: '1px solid var(--border)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p className="font-secondary" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--pine)', fontWeight: 600, marginBottom: 12 }}>QUESTIONS FRÉQUENTES</p>
          <h2 className="font-primary" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 40, lineHeight: 1.1 }}>
            Tout savoir sur votre site et vos réservations.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ_ITEMS.map(item => (
              <details key={item.q} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
                <summary className="font-primary" style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', cursor: 'pointer', listStyle: 'none' }}>
                  {item.q}
                </summary>
                <p className="font-secondary" style={{ fontSize: '0.92rem', color: 'var(--slate)', lineHeight: 1.65, marginTop: 12 }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ backgroundColor: 'var(--pine)', padding: '80px 24px' }}>
        <div className="lp-grid-2" style={{ maxWidth: 1080, margin: '0 auto', gap: 'clamp(40px,5vw,80px)', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <p className="font-accent" style={{ fontSize: '1.05rem', color: 'var(--amber-bright)', marginBottom: 16 }}>
              Prêt à moderniser votre restaurant ?
            </p>
            <h2 className="font-primary" style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--paper)', marginBottom: 20, lineHeight: 1.05 }}>
              Parlons de votre projet.
            </h2>
            <p className="font-secondary" style={{ fontSize: '0.95rem', color: 'rgba(245,241,233,0.65)', lineHeight: 1.7, marginBottom: 32 }}>
              Un premier échange gratuit pour voir si RESA correspond à vos besoins. Réponse sous 24 h.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📍', label: 'Disponible partout en France' },
                { icon: '⚡', label: 'Mise en ligne en moins de 2 semaines' },
                { icon: '💬', label: 'Premier échange gratuit et sans engagement' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span className="font-secondary" style={{ fontSize: '0.875rem', color: 'rgba(245,241,233,0.7)' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'rgba(245,241,233,0.3)', marginTop: 40 }}>
              Déjà client ?{' '}
              <Link href="/login" style={{ color: 'rgba(245,241,233,0.55)', textDecoration: 'underline' }}>Se connecter</Link>
            </p>
          </div>
          {/* Right — formulaire */}
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--pine-dark)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-primary" style={{ fontSize: '1rem', color: 'var(--pine)', fontWeight: 800, lineHeight: 1 }}>R</span>
            </div>
            <span className="font-primary" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--paper)', letterSpacing: '-0.02em' }}>
              RESA<span style={{ color: 'var(--amber-bright)' }}>.</span>
            </span>
          </div>
          <nav className="font-secondary" style={{ display: 'flex', gap: 18, fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <Link href="/mentions-legales" style={{ color: 'rgba(245,241,233,0.55)' }}>Mentions légales</Link>
            <Link href="/cgv" style={{ color: 'rgba(245,241,233,0.55)' }}>CGV</Link>
            <Link href="/contrat-abonnement" style={{ color: 'rgba(245,241,233,0.55)' }}>Contrat d&apos;abonnement</Link>
          </nav>
          <p className="font-secondary" style={{ fontSize: '0.78rem', color: 'rgba(245,241,233,0.3)' }}>
            © {new Date().getFullYear()} RESA — resa-service.com
          </p>
        </div>
      </footer>
    </div>
  )
}
