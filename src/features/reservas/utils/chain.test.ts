import { describe, it, expect } from 'vitest'
import type {
  GetReservationResponse,
  ReservationChainItem,
  ReservationStatus,
} from '@rocket-lease/contracts'
import {
  getChainEndAt,
  getChainStartAt,
  getChainTotalCents,
  getCommittedChainEndAt,
  getCommittedChainTotalCents,
  getPendingExtension,
} from './chain'

function makeChainItem(
  overrides: Partial<ReservationChainItem>,
): ReservationChainItem {
  return {
    id: overrides.id ?? 'id',
    status: 'confirmed',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    totalCents: 100000,
    parentReservationId: null,
    pricingSnapshot: {
      vehicleId: 'v1', currency: 'ARS', basePriceCents: 50000, durationDays: 2,
      subtotalCents: 100000, appliedDiscountTier: null, appliedDiscountPercentage: 0,
      discountCents: 0, totalCents: 100000,
    },
    ...overrides,
  }
}

function makeReservation(
  overrides: Partial<GetReservationResponse>,
): GetReservationResponse {
  return {
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    chain: undefined,
    ...overrides,
  } as GetReservationResponse
}

describe('getChainStartAt / getChainEndAt', () => {
  it('usa las fechas propias cuando no hay cadena', () => {
    const reservation = makeReservation({
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-03T10:00:00.000Z',
    })
    expect(getChainStartAt(reservation)).toBe('2026-06-01T10:00:00.000Z')
    expect(getChainEndAt(reservation)).toBe('2026-06-03T10:00:00.000Z')
  })

  it('toma el inicio más temprano y la devolución más tardía de la cadena', () => {
    const reservation = makeReservation({
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-03T10:00:00.000Z',
      chain: [
        makeChainItem({ id: 'parent', startAt: '2026-06-01T10:00:00.000Z', endAt: '2026-06-03T10:00:00.000Z' }),
        makeChainItem({ id: 'ext-1', startAt: '2026-06-03T10:00:00.000Z', endAt: '2026-06-05T10:00:00.000Z' }),
        makeChainItem({ id: 'ext-2', startAt: '2026-06-05T10:00:00.000Z', endAt: '2026-06-08T10:00:00.000Z' }),
      ],
    })
    expect(getChainStartAt(reservation)).toBe('2026-06-01T10:00:00.000Z')
    expect(getChainEndAt(reservation)).toBe('2026-06-08T10:00:00.000Z')
  })

  it('ignora eslabones cancelados, rechazados o expirados', () => {
    const terminal: ReservationStatus[] = ['cancelled', 'rejected', 'expired']
    for (const status of terminal) {
      const reservation = makeReservation({
        endAt: '2026-06-03T10:00:00.000Z',
        chain: [
          makeChainItem({ id: 'parent', endAt: '2026-06-03T10:00:00.000Z' }),
          makeChainItem({ id: 'ext', status, endAt: '2026-06-10T10:00:00.000Z' }),
        ],
      })
      expect(getChainEndAt(reservation)).toBe('2026-06-03T10:00:00.000Z')
    }
  })

  it('suma los totalCents de los eslabones vigentes', () => {
    const reservation = makeReservation({
      totalCents: 2800000,
      chain: [
        makeChainItem({ id: 'parent', totalCents: 2800000 }),
        makeChainItem({ id: 'ext-1', totalCents: 2800000 }),
        makeChainItem({ id: 'ext-2', totalCents: 2800000 }),
        makeChainItem({ id: 'cancelled', status: 'cancelled', totalCents: 5000000 }),
      ],
    })
    expect(getChainTotalCents(reservation)).toBe(8400000)
  })

  it('usa el total propio cuando no hay cadena', () => {
    expect(getChainTotalCents(makeReservation({ totalCents: 2800000 }))).toBe(2800000)
  })

  it('cae a la cadena completa si todos los eslabones son terminales', () => {
    const reservation = makeReservation({
      chain: [
        makeChainItem({ id: 'a', status: 'cancelled', startAt: '2026-06-01T10:00:00.000Z', endAt: '2026-06-04T10:00:00.000Z' }),
        makeChainItem({ id: 'b', status: 'rejected', startAt: '2026-06-04T10:00:00.000Z', endAt: '2026-06-06T10:00:00.000Z' }),
      ],
    })
    expect(getChainStartAt(reservation)).toBe('2026-06-01T10:00:00.000Z')
    expect(getChainEndAt(reservation)).toBe('2026-06-06T10:00:00.000Z')
  })
})

describe('chain comprometido vs pendiente', () => {
  const tCross = () =>
    makeReservation({
      endAt: '2026-06-02T09:00:00.000Z',
      totalCents: 2800000,
      chain: [
        makeChainItem({ id: 'root', status: 'in_progress', startAt: '2026-05-25T09:00:00.000Z', endAt: '2026-06-02T09:00:00.000Z', totalCents: 2800000, parentReservationId: null }),
        makeChainItem({ id: 'ext1', status: 'confirmed', startAt: '2026-06-02T09:00:00.000Z', endAt: '2026-06-03T09:00:00.000Z', totalCents: 2800000, parentReservationId: 'root' }),
        makeChainItem({ id: 'ext2', status: 'confirmed', startAt: '2026-06-03T09:00:00.000Z', endAt: '2026-06-04T09:00:00.000Z', totalCents: 2800000, parentReservationId: 'ext1' }),
        makeChainItem({ id: 'ext3', status: 'pending_approval', startAt: '2026-06-04T09:00:00.000Z', endAt: '2026-06-05T09:00:00.000Z', totalCents: 2800000, parentReservationId: 'ext2' }),
        makeChainItem({ id: 'ext4', status: 'pending_approval', startAt: '2026-06-05T09:00:00.000Z', endAt: '2026-06-06T09:00:00.000Z', totalCents: 2800000, parentReservationId: 'ext3' }),
      ],
    })

  it('la fecha/total comprometidos ignoran las extensiones pendientes', () => {
    const r = tCross()
    expect(getCommittedChainEndAt(r)).toBe('2026-06-04T09:00:00.000Z')
    expect(getCommittedChainTotalCents(r)).toBe(8400000)
  })

  it('la cadena vigente (baseline de extensión) sí incluye las pendientes', () => {
    const r = tCross()
    expect(getChainEndAt(r)).toBe('2026-06-06T09:00:00.000Z')
  })

  it('getPendingExtension devuelve la pendiente más lejana', () => {
    const pending = getPendingExtension(tCross())
    expect(pending?.id).toBe('ext4')
    expect(pending?.endAt).toBe('2026-06-06T09:00:00.000Z')
  })

  it('sin extensiones pendientes, getPendingExtension es null y committed = propio', () => {
    const r = makeReservation({ endAt: '2026-06-03T10:00:00.000Z', totalCents: 100000 })
    expect(getPendingExtension(r)).toBeNull()
    expect(getCommittedChainEndAt(r)).toBe('2026-06-03T10:00:00.000Z')
    expect(getCommittedChainTotalCents(r)).toBe(100000)
  })
})
