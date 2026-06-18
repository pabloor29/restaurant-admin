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
      <h1 className="font-primary text-neutral mb-2" style={{ fontSize: '6rem', lineHeight: 1 }}>
        RESA
      </h1>
      <p className="font-secondary text-neutral mb-12" style={{ opacity: 0.4, fontSize: '0.85rem', letterSpacing: '0.15em' }}>
        GESTION DES RÉSERVATIONS
      </p>

      <div className="w-full" style={{ maxWidth: '400px' }}>
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.12)' }}
        >
          <p className="font-secondary mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(252,238,239,0.4)' }}>
            ABONNEMENT MENSUEL
          </p>
          <div className="flex items-end gap-2 mb-6">
            {amount !== null ? (
              <>
                <span className="font-primary text-neutral" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                  {amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}{symbol}
                </span>
                <span className="font-secondary mb-2" style={{ color: 'rgba(252,238,239,0.4)', fontSize: '0.85rem' }}>
                  / {interval}
                </span>
              </>
            ) : (
              <span className="font-secondary" style={{ color: 'rgba(252,238,239,0.4)', fontSize: '1rem' }}>
                —
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {FEATURES.map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>✓</span>
                <span className="font-secondary" style={{ fontSize: '0.85rem', color: 'rgba(252,238,239,0.7)' }}>
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
