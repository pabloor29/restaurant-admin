export const TRIAL_MONTHS = 2

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function computeTrialEnd(createdAtIso: string): Date {
  return addMonths(new Date(createdAtIso), TRIAL_MONTHS)
}

export function isTrialExpired(createdAtIso: string, now: Date = new Date()): boolean {
  return now >= computeTrialEnd(createdAtIso)
}
