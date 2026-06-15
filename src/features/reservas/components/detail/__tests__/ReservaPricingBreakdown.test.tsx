import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { GetReservationResponse } from '@rocket-lease/contracts'
import { ReservaPricingBreakdown } from '../ReservaPricingBreakdown'

function makeReservation(
  overrides: Partial<GetReservationResponse> = {},
): GetReservationResponse {
  return {
    id: 'res-1',
    vehicleId: 'veh-1',
    status: 'confirmed',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-05T10:00:00.000Z',
    totalCents: 7600,
    currency: 'ARS',
    paymentMethod: null,
    walletProvider: null,
    holdExpiresAt: null,
    contractAcceptedAt: null,
    paidAt: null,
    transferExpiresAt: null,
    transferCode: null,
    transferAlias: null,
    rejectionReason: null,
    depositPercentageSnapshot: null,
    basePriceCentsSnapshot: 10000,
    cancellationPolicySnapshot: 'FLEXIBLE',
    maxKilometrageSnapshot: { type: 'UNLIMITED' },
    rentalTimeConstraintsSnapshot: { minDays: null, maxDays: null },
    withHomeDelivery: false,
    homeDeliveryFeeCentsSnapshot: null,
    deliveryAddress: null,
    withHomeReturn: false,
    homeReturnFeeCentsSnapshot: null,
    returnAddress: null,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    pricingSnapshot: {
      vehicleId: 'veh-1',
      currency: 'ARS',
      basePriceCents: 10000,
      durationDays: 4,
      subtotalCents: 8000,
      appliedDiscountTier: { minimumDays: 3, discountPercentage: 5 },
      appliedDiscountPercentage: 5,
      discountCents: 400,
      totalCents: 7600,
    },
    vehicle: { id: 'veh-1', plate: 'AA123BB', brand: 'Toyota', model: 'Corolla', year: 2022, photo: null },
    rentador: { id: 'r-1', name: 'Beto' },
    reviews: [],
    ...overrides,
  } as unknown as GetReservationResponse
}

describe('ReservaPricingBreakdown — descuento por nivel', () => {
  it('muestra línea "Desc. por nivel" cuando levelDiscountPercentage está presente', () => {
    const reservation = makeReservation({
      pricingSnapshot: {
        vehicleId: 'veh-1',
        currency: 'ARS',
        basePriceCents: 10000,
        durationDays: 4,
        subtotalCents: 8000,
        appliedDiscountTier: { minimumDays: 3, discountPercentage: 5 },
        appliedDiscountPercentage: 5,
        discountCents: 400,
        totalCents: 7220,
        levelDiscountPercentage: 5,
      },
    })

    render(<ReservaPricingBreakdown reservation={reservation} />)

    expect(screen.getByText('Desc. por nivel (5%)')).toBeInTheDocument()
  })

  it('no muestra línea "Desc. por nivel" cuando levelDiscountPercentage no está', () => {
    const reservation = makeReservation()

    render(<ReservaPricingBreakdown reservation={reservation} />)

    expect(screen.queryByText(/Desc\. por nivel/)).not.toBeInTheDocument()
  })

  it('muestra el desglose con subtotal, descuento y total', () => {
    const reservation = makeReservation()

    render(<ReservaPricingBreakdown reservation={reservation} />)

    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText(/^Descuento/)).toBeInTheDocument()
    expect(screen.getAllByText('Total')).toHaveLength(2)
  })
})
