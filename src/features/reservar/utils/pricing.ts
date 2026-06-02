const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export function estimateReservationTotalCents(
  basePriceDaily: number,
  startAt: Date,
  endAt: Date,
  homeDeliveryFeeCents: number | null = null,
  homeReturnFeeCents: number | null = null,
): number {
  const ms = endAt.getTime() - startAt.getTime()
  let base = 0
  if (ms > 0) {
    if (ms >= DAY_MS) {
      base = Math.ceil(ms / DAY_MS) * basePriceDaily
    } else {
      const hourly = Math.round(basePriceDaily / 24)
      base = Math.ceil(ms / HOUR_MS) * hourly
    }
  }
  return base + (homeDeliveryFeeCents ?? 0) + (homeReturnFeeCents ?? 0)
}
