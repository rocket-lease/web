import { describe, it, expect } from 'vitest'
import type { GetReservationResponse } from '@rocket-lease/contracts'
import { getCancellationRefundSummary } from './cancellation-policy'

const START_AT = '2026-06-15T12:00:00.000Z'
const PAID_AT = '2026-06-01T12:00:00.000Z'

function makeReservation(
  overrides: Partial<GetReservationResponse> = {},
): GetReservationResponse {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    vehicleId: '22222222-2222-2222-2222-222222222222',
    conductorId: '33333333-3333-3333-3333-333333333333',
    rentadorId: '44444444-4444-4444-4444-444444444444',
    status: 'confirmed',
    startAt: START_AT,
    endAt: '2026-06-17T12:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 100000,
    currency: 'ARS',
    paymentMethod: 'credit_card',
    walletProvider: null,
    contractAcceptedAt: '2026-05-30T12:00:00.000Z',
    paidAt: PAID_AT,
    transferExpiresAt: null,
    transferCode: null,
    transferAlias: null,
    voucherToken: null,
    returnQrToken: null,
    startedAt: null,
    completedAt: null,
    rejectionReason: null,
    createdAt: '2026-05-30T12:00:00.000Z',
    updatedAt: '2026-05-30T12:00:00.000Z',
    vehicle: {
      id: '22222222-2222-2222-2222-222222222222',
      brand: 'Ford',
      model: 'Ranger',
      year: 2023,
      photo: null,
      reservationRuleSet: {
        id: '55555555-5555-5555-5555-555555555555',
        rentalorId: '44444444-4444-4444-4444-444444444444',
        cancellationPolicy: 'FLEXIBLE',
        deposit: 'TEN_PERCENT',
        maxKilometrage: { type: 'UNLIMITED' },
        rentalTimeConstraints: {},
      },
    },
    rentador: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Rentador',
      avatarUrl: null,
    },
    ...overrides,
  }
}

describe('getCancellationRefundSummary', () => {
  it('calcula flexible vigente con reembolso total hasta 24h antes', () => {
    const reservation = makeReservation()
    const nowMs = new Date('2026-06-14T11:59:00.000Z').getTime()

    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('flexible_active')
    expect(summary.refundPercent).toBe(100)
    expect(summary.deadlineAt?.toISOString()).toBe('2026-06-14T12:00:00.000Z')
  })

  it('calcula moderada vencida cuando ya pasó el límite de 48h', () => {
    const reservation = makeReservation({
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'MODERATE',
        },
      },
    })

    const nowMs = new Date('2026-06-13T12:01:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('moderate_expired')
    expect(summary.refundPercent).toBe(50)
    expect(summary.deadlineAt?.toISOString()).toBe('2026-06-13T12:00:00.000Z')
  })

  it('calcula estricta vigente según paidAt + 7 días', () => {
    const reservation = makeReservation({
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'STRICT',
        },
      },
    })

    const nowMs = new Date('2026-06-08T11:59:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('strict_active')
    expect(summary.deadlineAt?.toISOString()).toBe('2026-06-08T12:00:00.000Z')
  })

  it('calcula estricta con el deadline más temprano entre paidAt + 7 días y 48h antes del inicio', () => {
    const reservation = makeReservation({
      startAt: '2026-06-06T12:00:00.000Z',
      endAt: '2026-06-08T12:00:00.000Z',
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'STRICT',
        },
      },
    })

    const nowMs = new Date('2026-06-04T11:59:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('strict_active')
    expect(summary.deadlineAt?.toISOString()).toBe('2026-06-04T12:00:00.000Z')
  })

  it('calcula estricta vencida cuando pasó paidAt + 7 días', () => {
    const reservation = makeReservation({
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'STRICT',
        },
      },
    })

    const nowMs = new Date('2026-06-08T12:01:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('strict_expired')
  })

  it('reporta missing_policy cuando la reserva no trae Rule Set', () => {
    const reservation = makeReservation({
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: null,
      },
    })

    const summary = getCancellationRefundSummary(reservation)
    expect(summary.state).toBe('missing_policy')
  })

  it('reporta invalid_dates cuando strict no tiene paidAt', () => {
    const reservation = makeReservation({
      paidAt: null,
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'STRICT',
        },
      },
    })

    const summary = getCancellationRefundSummary(reservation)
    expect(summary.state).toBe('invalid_dates')
  })
})
