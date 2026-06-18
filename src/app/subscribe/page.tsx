import { getStripe } from '../../../lib/stripe'
import SubscribeActions from './SubscribeActions'

const FEATURES = [
  "Site web sur-mesure",
  "Réservations en ligne (confirmation par mail automatique)",
  "Hébergement inclus",
  "Maintenance incluse",
  "Référencement (SEO) inclus",
]

async function getPriceDetails() {
  try {
    const price = await getStripe().prices.retrieve(process.env.STRIPE_PRICE_ID!, {
      expand: ['product'],
    })
    const amount = price.unit_amount ? price.unit_amount / 100 : null
    const currency = price.currency?.toUpperCase() ?? 'EUR'
    const symbol = currency === 'EUR' ? '€' : currency
    const interval = price.recurring?.interval === 'year' ? 'an' : 'mois'
    return { amount, symbol, interval }
  } catch {
    return { amount: null, symbol: '€', interval: 'mois' }
  }
}

export default async function SubscribePage() {
  const { amount, symbol, interval } = await getPriceDetails()

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-12">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--pine)' }}
        >
          <span className="font-primary" style={{ fontSize: '1.7rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>R</span>
        </div>
        <span className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          RESA<span style={{ color: 'var(--amber)' }}>.</span>
        </span>
      </div>

      <div className="w-full" style={{ maxWidth: 420 }}>
        {/* Carte offre */}
        <div
          className="mb-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '28px 28px 24px' }}
        >
          <p className="font-secondary mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
            ABONNEMENT MENSUEL
          </p>
          <div className="flex items-end gap-2 mb-6">
            {amount !== null ? (
              <>
                <span className="font-primary" style={{ fontSize: '3.2rem', lineHeight: 1, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                  {amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}{symbol}
                </span>
                <span className="font-secondary mb-2" style={{ color: 'var(--slate)', fontSize: '0.85rem' }}>
                  / {interval}
                </span>
              </>
            ) : (
              <span className="font-secondary" style={{ color: 'var(--muted)', fontSize: '1rem' }}>—</span>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {FEATURES.map(feature => (
              <div key={feature} className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 mt-0.5"
                  style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'var(--pine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#13503B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <SubscribeActions />
      </div>
    </div>
  )
}
