import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { GetReservationResponse } from '@rocket-lease/contracts'
import { ConductorView } from './ConductorView'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <a {...rest}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}))

const reReservarMock = vi.fn()
vi.mock('@/features/reservar/hooks/useReReservar', () => ({
  useReReservar: () => reReservarMock,
}))

vi.mock('@/features/soporte/hooks/useReservationTickets', () => ({
  useReservationTickets: () => ({ data: [] }),
}))

vi.mock('@/features/chat/hooks/useUnreadCount', () => ({
  useUnreadCount: () => ({ data: 0 }),
}))

vi.mock('../ReservaUbicacion', () => ({ ReservaUbicacion: () => null }))
vi.mock('./ReservaUbicacion', () => ({ ReservaUbicacion: () => null }))
vi.mock('./ReservaPricingBreakdown', () => ({ ReservaPricingBreakdown: () => null }))
vi.mock('@/features/reviews/components/CrearResenaSheet', () => ({ CrearResenaSheet: () => null }))
vi.mock('@/features/soporte/components/ReportarProblemaSheet', () => ({ ReportarProblemaSheet: () => null }))
vi.mock('@/features/soporte/components/ReservaTicketInfo', () => ({ ReservaTicketInfo: () => null }))

vi.mock('qrcode', () => ({ default: { toDataURL: () => Promise.resolve('data:image/png;base64,') } }))

function reservationFixture(status: string): GetReservationResponse {
  return {
    id: 'res-1234-5678',
    vehicleId: 'veh-1',
    status,
    startAt: '2026-01-01T10:00:00.000Z',
    endAt: '2026-01-03T10:00:00.000Z',
    totalCents: 100000,
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
    basePriceCentsSnapshot: 100000,
    cancellationPolicySnapshot: 'FLEXIBLE',
    maxKilometrageSnapshot: { type: 'UNLIMITED' },
    rentalTimeConstraintsSnapshot: { minDays: null, maxDays: null },
    withHomeDelivery: false,
    homeDeliveryFeeCentsSnapshot: null,
    deliveryAddress: null,
    withHomeReturn: false,
    homeReturnFeeCentsSnapshot: null,
    returnAddress: null,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    pricingSnapshot: {} as GetReservationResponse['pricingSnapshot'],
    vehicle: { id: 'veh-1', plate: 'AA123BB', brand: 'Toyota', model: 'Corolla', year: 2022, photo: null },
    rentador: { id: 'r-1', name: 'Beto' },
    reviews: [],
  } as unknown as GetReservationResponse
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ConductorView — botón Re-reservar (US-31)', () => {
  it('muestra Re-reservar cuando la reserva está completada', () => {
    render(<ConductorView reservation={reservationFixture('completed')} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByRole('button', { name: 'Re-reservar' })).toBeInTheDocument()
  })

  it('no muestra Re-reservar cuando la reserva no está completada', () => {
    render(<ConductorView reservation={reservationFixture('confirmed')} />, {
      wrapper: createWrapper(),
    })

    expect(screen.queryByRole('button', { name: 'Re-reservar' })).not.toBeInTheDocument()
  })
})
