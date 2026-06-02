import { describe, it, expect } from 'vitest'
import type { GetReservationResponse } from '@rocket-lease/contracts'
import { computeRequiresApproval } from '../../utils/extend'

function makeReservation(
  overrides: Partial<GetReservationResponse> = {},
): GetReservationResponse {
  return {
    id: 'res-1',
    vehicleId: 'veh-1',
    conductorId: 'con-1',
    rentadorId: 'ren-1',
    status: 'in_progress',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS',
    paymentMethod: null,
    walletProvider: null,
    contractAcceptedAt: '2026-05-30T10:00:00.000Z',
    paidAt: '2026-05-30T10:05:00.000Z',
    transferExpiresAt: null,
    transferCode: null,
    transferAlias: null,
    voucherToken: null,
    returnQrToken: null,
    startedAt: '2026-06-01T10:00:00.000Z',
    completedAt: null,
    rejectionReason: null,
    parentReservationId: null,
    chain: undefined,
    depositPercentageSnapshot: 10,
    basePriceCentsSnapshot: 50000,
    cancellationPolicySnapshot: 'FLEXIBLE',
    maxKilometrageSnapshot: { type: 'UNLIMITED' },
    rentalTimeConstraintsSnapshot: {},
    createdAt: '2026-05-30T09:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    vehicle: {
      id: 'veh-1',
      plate: 'AB123CD',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      photo: null,
    },
    rentador: {
      id: 'ren-1',
      name: 'Rentador Test',
      avatarUrl: null,
    },
    ...overrides,
  } as GetReservationResponse
}

describe('computeRequiresApproval', () => {
  it('requiere aprobación cuando vehicle.autoAccept es false', () => {
    const result = computeRequiresApproval({
      reservation: makeReservation(),
      vehicleAutoAccept: false,
      vehicleMaxDays: 30,
      newEndAtIso: '2026-06-05T10:00:00.000Z',
    })
    expect(result).toBe(true)
  })

  it('requiere aprobación cuando vehicle.autoAccept es null', () => {
    const result = computeRequiresApproval({
      reservation: makeReservation(),
      vehicleAutoAccept: null,
      vehicleMaxDays: 30,
      newEndAtIso: '2026-06-05T10:00:00.000Z',
    })
    expect(result).toBe(true)
  })

  it('inmediato cuando autoAccept es true y maxDays no está definido', () => {
    const result = computeRequiresApproval({
      reservation: makeReservation(),
      vehicleAutoAccept: true,
      vehicleMaxDays: undefined,
      newEndAtIso: '2026-06-10T10:00:00.000Z',
    })
    expect(result).toBe(false)
  })

  it('inmediato cuando autoAccept y total de días entra en maxDays', () => {
    const result = computeRequiresApproval({
      reservation: makeReservation({
        startAt: '2026-06-01T10:00:00.000Z',
        endAt: '2026-06-03T10:00:00.000Z',
      }),
      vehicleAutoAccept: true,
      vehicleMaxDays: 5,
      newEndAtIso: '2026-06-05T10:00:00.000Z',
    })
    expect(result).toBe(false)
  })

  it('requiere aprobación cuando autoAccept ON pero el chain excede maxDays', () => {
    const result = computeRequiresApproval({
      reservation: makeReservation({
        startAt: '2026-06-01T10:00:00.000Z',
        endAt: '2026-06-06T10:00:00.000Z',
      }),
      vehicleAutoAccept: true,
      vehicleMaxDays: 7,
      newEndAtIso: '2026-06-10T10:00:00.000Z',
    })
    expect(result).toBe(true)
  })

  it('usa el startAt mínimo del chain cuando hay extensiones existentes', () => {
    const reservation = makeReservation({
      startAt: '2026-06-05T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
      chain: [
        {
          id: 'parent',
          status: 'completed',
          startAt: '2026-06-01T10:00:00.000Z',
          endAt: '2026-06-05T10:00:00.000Z',
          totalCents: 100000,
          parentReservationId: null,
        },
        {
          id: 'res-1',
          status: 'in_progress',
          startAt: '2026-06-05T10:00:00.000Z',
          endAt: '2026-06-08T10:00:00.000Z',
          totalCents: 100000,
          parentReservationId: 'parent',
        },
      ],
    })
    const result = computeRequiresApproval({
      reservation,
      vehicleAutoAccept: true,
      vehicleMaxDays: 10,
      newEndAtIso: '2026-06-12T10:00:00.000Z',
    })
    expect(result).toBe(true)
  })

  it('requiere aprobación cuando no hay newEndAtIso', () => {
    const result = computeRequiresApproval({
      reservation: makeReservation(),
      vehicleAutoAccept: true,
      vehicleMaxDays: 30,
      newEndAtIso: null,
    })
    expect(result).toBe(true)
  })
})
