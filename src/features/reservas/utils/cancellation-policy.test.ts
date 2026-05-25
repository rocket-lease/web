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
    depositPercentageSnapshot: null,
    basePriceCentsSnapshot: 100000,
    cancellationPolicySnapshot: 'FLEXIBLE',
    maxKilometrageSnapshot: { type: 'UNLIMITED' },
    rentalTimeConstraintsSnapshot: {},
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
        depositPercentage: 10,
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
      cancellationPolicySnapshot: 'MODERATE',
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
    expect(summary.refundPercent).toBe(0)
    expect(summary.deadlineAt?.toISOString()).toBe('2026-06-13T12:00:00.000Z')
  })

  it('calcula estricta vigente cuando está dentro de 7 días y faltan más de 48h', () => {
    const reservation = makeReservation({
      cancellationPolicySnapshot: 'STRICT',
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
    expect(summary.refundPercent).toBe(100)
  })

  it('calcula estricta con deadline en startAt - 48h cuando ese límite es anterior', () => {
    const reservation = makeReservation({
      paidAt: '2026-06-10T12:00:00.000Z',
      cancellationPolicySnapshot: 'STRICT',
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'STRICT',
        },
      },
    })

    const nowMs = new Date('2026-06-12T11:59:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('strict_active')
    expect(summary.deadlineAt?.toISOString()).toBe('2026-06-13T12:00:00.000Z')
  })

  it('calcula estricta vencida cuando pasó paidAt + 7 días', () => {
    const reservation = makeReservation({
      cancellationPolicySnapshot: 'STRICT',
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

  it('calcula estricta vencida cuando faltan 48h o menos para el inicio', () => {
    const reservation = makeReservation({
      cancellationPolicySnapshot: 'STRICT',
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: {
          ...makeReservation().vehicle.reservationRuleSet!,
          cancellationPolicy: 'STRICT',
        },
      },
    })

    const nowMs = new Date('2026-06-13T12:00:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)

    expect(summary.state).toBe('strict_expired')
    expect(summary.refundPercent).toBe(0)
  })

  it('usa flexible por defecto cuando la reserva no trae Rule Set', () => {
    const reservation = makeReservation({
      vehicle: {
        ...makeReservation().vehicle,
        reservationRuleSet: null,
      },
    })

    const nowMs = new Date('2026-06-14T11:59:00.000Z').getTime()
    const summary = getCancellationRefundSummary(reservation, nowMs)
    expect(summary.state).toBe('flexible_active')
    expect(summary.policy).toBe('FLEXIBLE')
    expect(summary.refundPercent).toBe(100)
  })

  it('reporta invalid_dates cuando strict no tiene paidAt', () => {
    // paidAt es null → la política viene del set live, no del snapshot
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
