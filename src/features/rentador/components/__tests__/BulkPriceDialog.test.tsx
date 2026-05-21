import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkPriceDialog } from '../BulkPriceDialog'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/vehiculos/api/vehiculos.api', () => ({
  vehiclesApi: {
    bulkUpdatePrices: vi.fn(),
    getActiveReservationsCount: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'

const mockApi = vi.mocked(vehiclesApi)

const VEH_1 = {
  id: '11111111-1111-1111-1111-111111111111',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  basePriceCents: 500000,
}

const VEH_2 = {
  id: '22222222-2222-2222-2222-222222222222',
  brand: 'Honda',
  model: 'Civic',
  year: 2021,
  basePriceCents: 1,
}

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  vehicles: [VEH_1, VEH_2],
  selectedIds: new Set([VEH_1.id]),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockApi.getActiveReservationsCount.mockResolvedValue({ counts: {} })
  mockApi.bulkUpdatePrices.mockResolvedValue({
    updated: [{ id: VEH_1.id, previousPriceCents: VEH_1.basePriceCents, newPriceCents: 600000 }],
  })
})

describe('BulkPriceDialog', () => {
  it('step form renderiza los dos radio buttons de operación', () => {
    render(<BulkPriceDialog {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByRole('radio', { name: /establecer precio fijo/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /ajustar por porcentaje/i })).toBeInTheDocument()
  })

  it('seleccionar operación PERCENTAGE y clickear "Ver vista previa" avanza al step preview', async () => {
    render(<BulkPriceDialog {...defaultProps} />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByRole('radio', { name: /ajustar por porcentaje/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: /ver vista previa/i }))

    await waitFor(() => {
      expect(screen.getByText(/vista previa del ajuste/i)).toBeInTheDocument()
    })
  })

  it('en preview con counts = {veh-1: 2} muestra el banner de reservas activas', async () => {
    mockApi.getActiveReservationsCount.mockResolvedValue({
      counts: { [VEH_1.id]: 2 },
    })

    render(<BulkPriceDialog {...defaultProps} />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5000' } })
    fireEvent.click(screen.getByRole('button', { name: /ver vista previa/i }))

    await waitFor(() => {
      expect(screen.getByText(/reservas activas mantendrán el precio anterior/i)).toBeInTheDocument()
    })
  })

  it('en preview con vehículo que daría precio negativo, fila inválida y Confirmar deshabilitado', async () => {
    render(
      <BulkPriceDialog
        {...defaultProps}
        selectedIds={new Set([VEH_2.id])}
      />,
      { wrapper: createWrapper() },
    )

    fireEvent.click(screen.getByRole('radio', { name: /ajustar por porcentaje/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-90' } })
    fireEvent.click(screen.getByRole('button', { name: /ver vista previa/i }))

    await waitFor(() => {
      expect(screen.getByText(/precio inválido/i)).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i })
    expect(confirmBtn).toBeDisabled()
  })

  it('con resultado válido el botón Confirmar está habilitado', async () => {
    render(<BulkPriceDialog {...defaultProps} />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '6000' } })
    fireEvent.click(screen.getByRole('button', { name: /ver vista previa/i }))

    await waitFor(() => {
      expect(screen.getByText(/vista previa del ajuste/i)).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i })
    expect(confirmBtn).not.toBeDisabled()
  })
})
