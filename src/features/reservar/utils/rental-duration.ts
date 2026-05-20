import type { RentalTimeConstraints } from '@rocket-lease/contracts'

const DAY_MS = 24 * 60 * 60 * 1000

export type RentalDurationViolation =
  | { kind: 'min'; limit: number }
  | { kind: 'max'; limit: number }

export function formatRentalDays(days: number): string {
  return `${days} ${days === 1 ? 'día' : 'días'}`
}

export function calculateRentalDurationDays(
  startAtLocal: string,
  endAtLocal: string,
): number | null {
  if (!startAtLocal || !endAtLocal) return null

  const start = new Date(startAtLocal).getTime()
  const end = new Date(endAtLocal).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return null
  }

  return (end - start) / DAY_MS
}

export function getRentalDurationViolation(
  constraints: RentalTimeConstraints | null | undefined,
  startAtLocal: string,
  endAtLocal: string,
): RentalDurationViolation | null {
  const durationDays = calculateRentalDurationDays(startAtLocal, endAtLocal)
  if (durationDays == null || !constraints) return null

  if (constraints.minDays !== undefined && durationDays < constraints.minDays) {
    return { kind: 'min', limit: constraints.minDays }
  }

  if (constraints.maxDays !== undefined && durationDays > constraints.maxDays) {
    return { kind: 'max', limit: constraints.maxDays }
  }

  return null
}
