import { describe, it, expect } from 'vitest'
import type { ReservationListItem } from '@rocket-lease/contracts'
import { collapseChain } from './ReservasPage'

function makeItem(overrides: Partial<ReservationListItem>): ReservationListItem {
  return {
    id: overrides.id ?? 'id',
    vehicleId: 'veh-1',
    conductorId: 'con-1',
    rentadorId: 'ren-1',
    status: 'confirmed',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS',
    paymentMethod: null,
    paidAt: null,
    voucherToken: null,
    rejectionReason: null,
    parentReservationId: null,
    createdAt: '2026-05-29T09:00:00.000Z',
    updatedAt: '2026-05-29T09:00:00.000Z',
    vehicle: { id: 'veh-1', brand: 'Toyota', model: 'Corolla', year: 2022, photo: null },
    conductor: { id: 'con-1', name: 'Conductor', avatarUrl: null },
    rentador: { id: 'ren-1', name: 'Rentador', avatarUrl: null },
    ...overrides,
  } as ReservationListItem
}

describe('collapseChain', () => {
  it('devuelve cada reserva sola cuando no hay extensiones', () => {
    const items = [makeItem({ id: 'a' }), makeItem({ id: 'b', startAt: '2026-07-01T10:00:00.000Z', endAt: '2026-07-03T10:00:00.000Z' })]
    const result = collapseChain(items)
    expect(result).toHaveLength(2)
  })

  it('colapsa padre + extensión en un solo entry con rango extendido', () => {
    const parent = makeItem({
      id: 'parent',
      status: 'in_progress',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-05T10:00:00.000Z',
    })
    const extension = makeItem({
      id: 'ext',
      status: 'confirmed',
      startAt: '2026-06-05T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
      parentReservationId: 'parent',
    })
    const result = collapseChain([parent, extension])
    expect(result).toHaveLength(1)
    expect(result[0].rangeStartAt).toBe('2026-06-01T10:00:00.000Z')
    expect(result[0].rangeEndAt).toBe('2026-06-08T10:00:00.000Z')
  })

  it('elige el eslabón más activo como representante (in_progress > confirmed)', () => {
    const parent = makeItem({
      id: 'parent',
      status: 'in_progress',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-05T10:00:00.000Z',
    })
    const extension = makeItem({
      id: 'ext',
      status: 'confirmed',
      startAt: '2026-06-05T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
      parentReservationId: 'parent',
    })
    const result = collapseChain([extension, parent])
    expect(result[0].representative.id).toBe('parent')
  })

  it('elige confirmed sobre pending_approval cuando no hay in_progress', () => {
    const parent = makeItem({
      id: 'parent',
      status: 'confirmed',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-05T10:00:00.000Z',
    })
    const extension = makeItem({
      id: 'ext',
      status: 'pending_approval',
      startAt: '2026-06-05T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
      parentReservationId: 'parent',
    })
    const result = collapseChain([parent, extension])
    expect(result[0].representative.id).toBe('parent')
  })

  it('excluye eslabones cancelled/rejected del rango', () => {
    const parent = makeItem({
      id: 'parent',
      status: 'in_progress',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-05T10:00:00.000Z',
    })
    const cancelledExt = makeItem({
      id: 'ext',
      status: 'cancelled',
      startAt: '2026-06-05T10:00:00.000Z',
      endAt: '2026-06-10T10:00:00.000Z',
      parentReservationId: 'parent',
    })
    const result = collapseChain([parent, cancelledExt])
    expect(result[0].rangeEndAt).toBe('2026-06-05T10:00:00.000Z')
  })

  it('agrupa cadena de tres niveles (padre + dos extensiones encadenadas)', () => {
    const parent = makeItem({
      id: 'parent',
      status: 'completed',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-03T10:00:00.000Z',
    })
    const ext1 = makeItem({
      id: 'ext1',
      status: 'completed',
      startAt: '2026-06-03T10:00:00.000Z',
      endAt: '2026-06-05T10:00:00.000Z',
      parentReservationId: 'parent',
    })
    const ext2 = makeItem({
      id: 'ext2',
      status: 'in_progress',
      startAt: '2026-06-05T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
      parentReservationId: 'ext1',
    })
    const result = collapseChain([parent, ext1, ext2])
    expect(result).toHaveLength(1)
    expect(result[0].representative.id).toBe('ext2')
    expect(result[0].rangeStartAt).toBe('2026-06-01T10:00:00.000Z')
    expect(result[0].rangeEndAt).toBe('2026-06-08T10:00:00.000Z')
  })

  it('ordena entries por rangeStartAt descendiente', () => {
    const old = makeItem({ id: 'old', startAt: '2026-05-01T10:00:00.000Z', endAt: '2026-05-03T10:00:00.000Z' })
    const fresh = makeItem({ id: 'fresh', startAt: '2026-07-01T10:00:00.000Z', endAt: '2026-07-03T10:00:00.000Z' })
    const result = collapseChain([old, fresh])
    expect(result[0].representative.id).toBe('fresh')
    expect(result[1].representative.id).toBe('old')
  })
})
