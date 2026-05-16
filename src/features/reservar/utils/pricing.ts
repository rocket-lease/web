const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export function estimateReservationTotalCents(
  basePriceDaily: number,
  startAt: Date,
  endAt: Date,
): number {
  const ms = endAt.getTime() - startAt.getTime()
  if (ms <= 0) return 0
  if (ms >= DAY_MS) {
    return Math.ceil(ms / DAY_MS) * basePriceDaily
  }
  const hourly = Math.round(basePriceDaily / 24)
  return Math.ceil(ms / HOUR_MS) * hourly
}
