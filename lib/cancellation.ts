import type Stripe from 'stripe'

export const COMMITMENT_MONTHS = 12
export const NOTICE_DAYS = 60
export const MONTHLY_PRICE_EUR = 67

export type CancellationPreview = {
  subscriptionId: string
  startedAt: string
  commitmentEndsAt: string
  withinCommitment: boolean
  monthsLeft: number
  indemnityEur: number
  noticeEndsAt: string
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  const targetMonth = d.getMonth() + months
  d.setMonth(targetMonth)
  return d
}

export function computeCancellation(sub: Stripe.Subscription): CancellationPreview {
  const startedIso =
    (sub.metadata?.commitment_started_at as string | undefined) ??
    new Date(sub.created * 1000).toISOString()
  const months = parseInt(sub.metadata?.commitment_months ?? String(COMMITMENT_MONTHS), 10) || COMMITMENT_MONTHS

  const startedAt = new Date(startedIso)
  const commitmentEndsAt = addMonths(startedAt, months)
  const now = new Date()

  const withinCommitment = now < commitmentEndsAt
  const msPerMonth = (365.25 / 12) * 24 * 3600 * 1000

  // Cycle de facturation en cours (1-indexé). À t=0 → cycle 1 (premier loyer payé au signup).
  const currentCycle = Math.floor((now.getTime() - startedAt.getTime()) / msPerMonth) + 1
  // Mois restants à facturer (les cycles encore non débités).
  const monthsLeft = withinCommitment ? Math.max(0, months - currentCycle) : 0
  const indemnityEur = monthsLeft * MONTHLY_PRICE_EUR

  const noticeEndsAt = new Date(now.getTime() + NOTICE_DAYS * 24 * 3600 * 1000)

  return {
    subscriptionId: sub.id,
    startedAt: startedAt.toISOString(),
    commitmentEndsAt: commitmentEndsAt.toISOString(),
    withinCommitment,
    monthsLeft,
    indemnityEur,
    noticeEndsAt: noticeEndsAt.toISOString(),
  }
}
